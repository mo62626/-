import React, { useEffect, useState } from 'react';
import { PRESENTATION_AXES, SLIDES_META } from '../data/presentationData';
import { INTRO_VIDEO_SRC } from './EditorialVisual';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Film,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Moon,
  MousePointerClick,
  NotebookPen,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Sun,
  X,
} from 'lucide-react';

interface TopPresenterBarProps {
  currentSlideIndex: number;
  onSelectSlide: (idx: number) => void;
  onGoCover: () => void;
}

export const TopPresenterBar: React.FC<TopPresenterBarProps> = ({
  currentSlideIndex,
  onSelectSlide,
  onGoCover,
}) => {
  const activeAxisId = SLIDES_META[currentSlideIndex]?.axisId ?? 1;
  const activeAxis = PRESENTATION_AXES.find((a) => a.id === activeAxisId);

  return (
    <header className="no-print landscape-compact-topbar border-b border-red-500/25 bg-white/95 px-3 py-1.5 backdrop-blur-md md:px-6 md:py-2 dark:border-red-500/30 dark:bg-[#090d16]/95">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        {/* Brand Title + Circular Animated Logo beside "التسويق الغوريلا" */}
        <button
          type="button"
          onClick={onGoCover}
          aria-label="العودة إلى غلاف العرض التقديمي"
          className="group flex items-center gap-2.5 shrink-0 text-right"
        >
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-red-600 shadow-[0_0_14px_rgba(239,68,68,0.5)] transition-transform group-hover:scale-105">
            <video
              src={INTRO_VIDEO_SRC}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-display text-sm font-black whitespace-nowrap text-slate-950 transition-colors group-hover:text-red-600 md:text-base dark:text-white dark:group-hover:text-red-400">
            التسويق الغوريلا
          </span>
        </button>

        {/* Center Navigation: 6 Research Axes */}
        <nav aria-label="محاور العرض الستة" className="hidden items-center gap-4 lg:flex">
          {PRESENTATION_AXES.map((axis) => {
            const isActive = axis.id === activeAxisId;
            return (
              <button
                key={axis.id}
                type="button"
                onClick={() => onSelectSlide(axis.startSlideIndex)}
                className={`border-b-2 pb-0.5 font-display text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                    : 'border-transparent text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {axis.shortTitle}
              </button>
            );
          })}
        </nav>

        {/* Clean Top-Left Subtle Text Indicator (No Red Box) */}
        <div className="en hidden items-center gap-2 text-xs font-extrabold whitespace-nowrap shrink-0 text-slate-700 sm:flex dark:text-slate-300">
          <span>{activeAxis?.enTitle ?? 'GUERRILLA MARKETING'}</span>
          <span aria-hidden="true" className="text-red-600">·</span>
          <span className="tabular-nums text-red-600 dark:text-red-400">
            {String(currentSlideIndex + 1).padStart(2, '0')} / {SLIDES_META.length}
          </span>
        </div>
      </div>
    </header>
  );
};

interface PresenterDockProps {
  currentSlideIndex: number;
  totalSlides: number;
  notesOpen: boolean;
  darkMode: boolean;
  spotlightActive: boolean;
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenSorter: () => void;
  onToggleNotes: () => void;
  onToggleDark: () => void;
  onToggleSpotlight: () => void;
  onToggleFullscreen: () => void;
  onReplayIntro: () => void;
}

export const PresenterDock: React.FC<PresenterDockProps> = ({
  currentSlideIndex,
  totalSlides,
  notesOpen,
  darkMode,
  spotlightActive,
  isFullscreen,
  onPrev,
  onNext,
  onOpenSorter,
  onToggleNotes,
  onToggleDark,
  onToggleSpotlight,
  onToggleFullscreen,
  onReplayIntro,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <nav
      aria-label="أدوات التحكم بالعرض"
      className="no-print fixed bottom-2 left-1/2 z-40 flex max-w-[97vw] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border border-red-500/50 bg-white/97 px-3 py-1 shadow-[0_0_22px_rgba(239,68,68,0.22)] backdrop-blur-md dark:border-red-500/55 dark:bg-slate-900/97"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={currentSlideIndex === 0}
        aria-label="الشريحة السابقة"
        className="inline-flex min-h-[34px] items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-extrabold whitespace-nowrap text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span>السابق</span>
      </button>

      <button
        type="button"
        onClick={onOpenSorter}
        aria-label="عرض رقم الشريحة وفتح الخريطة"
        className="en tabular-nums rounded-full px-2.5 py-1 text-xs font-black whitespace-nowrap text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={currentSlideIndex === totalSlides - 1}
        aria-label="الشريحة التالية"
        className="inline-flex min-h-[34px] items-center gap-1 rounded-full bg-red-600 px-3.5 py-1 font-display text-xs font-extrabold whitespace-nowrap text-white transition-colors hover:bg-red-700 disabled:opacity-40"
      >
        <span>التالي</span>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-slate-300 dark:bg-slate-700" />

      <button
        type="button"
        onClick={onOpenSorter}
        aria-label={`كل الشرائح (${totalSlides})`}
        title="خريطة كل الشرائح (G)"
        className="inline-flex min-h-[34px] items-center gap-1 rounded-full px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <LayoutGrid className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
        <span className="hidden sm:inline">كل الشرائح ({totalSlides})</span>
      </button>

      <button
        type="button"
        onClick={onReplayIntro}
        aria-label="إعادة الفيديو الافتتاحي"
        title="إعادة الفيديو الافتتاحي"
        className="inline-flex min-h-[34px] items-center gap-1 rounded-full px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Film className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
        <span className="hidden md:inline">الافتتاحية</span>
      </button>

      <button
        type="button"
        onClick={onToggleNotes}
        aria-pressed={notesOpen}
        aria-label="ملاحظات المتحدث"
        className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-bold whitespace-nowrap transition-colors ${
          notesOpen
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden md:inline">الملاحظات</span>
      </button>

      <div className="hidden items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 md:flex dark:border-slate-700 dark:bg-slate-800/70">
        <Clock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
        <span className="en tabular-nums text-xs font-extrabold text-slate-900 dark:text-slate-100">
          {mins}:{secs}
        </span>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? 'إيقاف المؤقت' : 'تشغيل المؤقت'}
          className="rounded-full p-1 text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
          aria-label="إعادة ضبط المؤقت"
          className="rounded-full p-1 text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleSpotlight}
        aria-pressed={spotlightActive}
        aria-label="مؤشر الليزر"
        title="مؤشر الليزر (L)"
        className={`hidden min-h-[34px] items-center gap-1 rounded-full px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap transition-colors sm:inline-flex ${
          spotlightActive
            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
            : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onToggleDark}
        aria-label={darkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
        title="الوضع الليلي / النهاري (D)"
        className="inline-flex min-h-[34px] items-center justify-center rounded-full px-2.5 py-1 text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        aria-label="طباعة الشريحة"
        title="طباعة الشريحة"
        className="hidden min-h-[34px] items-center justify-center rounded-full px-2.5 py-1 text-slate-800 transition-colors hover:bg-slate-100 lg:inline-flex dark:text-slate-100 dark:hover:bg-slate-800"
      >
        <Printer className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
        title="ملء الشاشة (F)"
        className="inline-flex min-h-[34px] items-center justify-center rounded-full px-2.5 py-1 text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>
    </nav>
  );
};

interface SpeakerNotesDrawerProps {
  open: boolean;
  slideIndex: number;
  onClose: () => void;
}

export const SpeakerNotesDrawer: React.FC<SpeakerNotesDrawerProps> = ({
  open,
  slideIndex,
  onClose,
}) => {
  if (!open) return null;
  const meta = SLIDES_META[slideIndex] ?? SLIDES_META[0];

  return (
    <aside
      aria-label="ملاحظات المتحدث"
      className="no-print mx-auto mt-2 w-full max-w-[1440px] shrink-0 rounded-xl border border-red-500/40 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md dark:border-red-500/45 dark:bg-[#0f1625]/95"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-red-600 dark:text-red-400">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          <span>ملاحظات المتحدث · الشريحة {String(meta.num).padStart(2, '0')}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums text-slate-600 dark:text-slate-300">
            الزمن المقترح: {meta.speakerNotes.durationSec} ثانية
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق الملاحظات"
          className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-12">
        <p className="text-xs font-bold leading-relaxed text-slate-950 md:col-span-5 dark:text-white">
          الجملة الافتتاحية: {meta.speakerNotes.keyHook}
        </p>
        <ul className="space-y-0.5 text-xs font-medium leading-relaxed text-slate-800 md:col-span-7 dark:text-slate-200">
          {meta.speakerNotes.points.map((pt, i) => (
            <li key={i}>• {pt}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

interface SlideSorterModalProps {
  open: boolean;
  currentSlideIndex: number;
  onSelectSlide: (idx: number) => void;
  onClose: () => void;
}

export const SlideSorterModal: React.FC<SlideSorterModalProps> = ({
  open,
  currentSlideIndex,
  onSelectSlide,
  onClose,
}) => {
  const [axisFilter, setAxisFilter] = useState<number>(0);

  if (!open) return null;

  const visibleSlides =
    axisFilter === 0 ? SLIDES_META : SLIDES_META.filter((s) => s.axisId === axisFilter);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="خريطة الشرائح الكاملة"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
    >
      <div className="animated-neon-frame max-h-[88vh] w-full max-w-6xl">
        <div className="animated-neon-frame-inner flex max-h-[calc(88vh-10px)] flex-col bg-white p-5 dark:bg-[#0f1625]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-black text-slate-950 dark:text-white">
                خريطة الشرائح الكاملة ({SLIDES_META.length} شريحة)
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                اختر محوراً للتصفية أو انقر على أي شريحة للانتقال الفوري
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق خريطة الشرائح"
              className="inline-flex min-h-[38px] items-center gap-1 rounded-lg bg-red-600 px-3.5 py-1.5 font-display text-xs font-bold text-white hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              <span>إغلاق</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setAxisFilter(0)}
              className={`rounded-lg px-3 py-1.5 font-display text-xs font-bold transition-colors ${
                axisFilter === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              الكل ({SLIDES_META.length})
            </button>
            {PRESENTATION_AXES.map((ax) => (
              <button
                key={ax.id}
                type="button"
                onClick={() => setAxisFilter(ax.id)}
                className={`rounded-lg px-3 py-1.5 font-display text-xs font-bold transition-colors ${
                  axisFilter === ax.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {ax.shortTitle}
              </button>
            ))}
          </div>

          <div className="editorial-scroll mt-4 grid grid-cols-2 gap-3 overflow-y-auto pl-1 md:grid-cols-4">
            {visibleSlides.map((s) => {
              const idx = s.num - 1;
              const isCurrent = idx === currentSlideIndex;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    onSelectSlide(idx);
                    onClose();
                  }}
                  className={`flex flex-col items-start rounded-xl border p-3 text-right transition-colors ${
                    isCurrent
                      ? 'border-red-600 bg-red-50/75 dark:border-red-500 dark:bg-red-950/35'
                      : 'border-slate-200 bg-slate-50/75 hover:border-red-500/60 dark:border-slate-800 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex w-full items-center justify-between text-xs font-extrabold">
                    <span className="tabular-nums text-red-600 dark:text-red-400">
                      شريحة {String(s.num).padStart(2, '0')}
                    </span>
                    <span className="en text-slate-600 dark:text-slate-300">AXIS 0{s.axisId}</span>
                  </div>
                  <div className="mt-1.5 font-display text-sm font-black leading-snug text-slate-950 dark:text-white">
                    {s.short}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                    {s.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
