import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SLIDES_META } from './data/presentationData';
import { CoverSplash } from './components/CoverSplash';
import { INTRO_VIDEO_SRC } from './components/EditorialVisual';
import { SlideCanvas } from './components/SlideCanvas';
import {
  PresenterDock,
  SlideSorterModal,
  SpeakerNotesDrawer,
  TopPresenterBar,
} from './components/PresenterControls';
import { RotateCw, Volume2, VolumeX } from 'lucide-react';
import { MotionConfig } from 'motion/react';

type AppStage = 'video' | 'cover' | 'slides';

export function App() {
  const [stage, setStage] = useState<AppStage>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.has('slide')) {
      return 'slides';
    }
    return 'video';
  });

  const [currentSlide, setCurrentSlide] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const slideParam = Number(params.get('slide'));
    if (Number.isInteger(slideParam) && slideParam >= 1 && slideParam <= SLIDES_META.length) {
      return slideParam - 1;
    }
    return 0;
  });

  const [sorterOpen, setSorterOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [introMuted, setIntroMuted] = useState(true);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);

  // Mandatory Portrait Mobile Detection (width < 768 && height > width)
  const [isPortraitPhone, setIsPortraitPhone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortraitPhone(window.innerWidth < 768 && window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const goToSlide = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(SLIDES_META.length - 1, idx));
    setCurrentSlide((prev) => {
      setSlideDirection(clamped >= prev ? 1 : -1);
      return clamped;
    });
    setStage('slides');
  }, []);

  const nextSlide = useCallback(() => {
    setSlideDirection(1);
    setCurrentSlide((prev) => Math.min(SLIDES_META.length - 1, prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setSlideDirection(-1);
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const replayIntroVideo = useCallback(() => {
    setStage('video');
    window.setTimeout(() => {
      if (introVideoRef.current) {
        introVideoRef.current.currentTime = 0;
        introVideoRef.current.play().catch(() => {});
      }
    }, 50);
  }, []);

  // Keyboard ergonomics for PowerPoint-style navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;

      if (e.key === 'ArrowLeft') {
        if (stage === 'cover') setStage('slides');
        else if (stage === 'slides') nextSlide();
      } else if (e.key === 'ArrowRight') {
        if (stage === 'slides') prevSlide();
      } else if (e.key === 'Escape') {
        setSorterOpen(false);
        if (stage === 'video') setStage('cover');
      } else if (e.key.toLowerCase() === 'n' && stage === 'slides') {
        setNotesOpen((o) => !o);
      } else if (e.key.toLowerCase() === 'g' && stage === 'slides') {
        setSorterOpen((o) => !o);
      } else if (e.key.toLowerCase() === 'd') {
        setDarkMode((d) => !d);
      } else if (e.key.toLowerCase() === 'l' && stage === 'slides') {
        setSpotlightActive((s) => !s);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, nextSlide, prevSlide, toggleFullscreen]);

  // Spotlight Laser Pointer tracking
  useEffect(() => {
    if (!spotlightActive) return;
    const onMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [spotlightActive]);

  const progressPercent = ((currentSlide + 1) / SLIDES_META.length) * 100;

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 transition-colors dark:bg-[#0B0F19] dark:text-slate-100">
      {/* Mandatory Rotate-to-Landscape Overlay on Narrow Portrait Phone */}
      {isPortraitPhone && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تنبيه تدوير الشاشة للوضع الأفقي"
          data-testid="rotate-landscape-gate"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#090d16] via-[#13080c] to-[#090d16] p-6 text-center text-white"
        >
          <div className="neon-stage-frame flex max-w-sm flex-col items-center rounded-3xl bg-slate-950/95 p-7">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/40 bg-red-600/15 text-red-400">
              <RotateCw className="h-8 w-8 animate-spin" style={{ animationDuration: '4s' }} aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-extrabold text-white">
              برجاء تدوير شاشة الهاتف إلى الوضع الأفقي
            </h2>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              تم تصميم شرائح العرض التقديمي بنظام الشاشة العريضة (<span className="en">PowerPoint 16:9</span>) لعرض
              جميع الجداول والصور والمخططات بوضوح كامل دون ضغط أو قص.
            </p>
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2 font-display text-xs font-bold text-red-300">
              قم بإدارة الهاتف أفقياً ليبدأ العرض تلقائياً بنفس جودة الكمبيوتر
            </div>
          </div>
        </div>
      )}

      {/* Stage 1: Fullscreen Opening Video (LOGO-INTRO) */}
      {stage === 'video' && (
        <div
          data-testid="intro-video-stage"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060911]"
        >
          <video
            ref={introVideoRef}
            src={INTRO_VIDEO_SRC}
            autoPlay
            muted={introMuted}
            playsInline
            onEnded={() => setStage('cover')}
            onError={() => setStage('cover')}
            className="h-full w-full object-cover"
          />
          <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/25 bg-slate-950/85 px-4 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setIntroMuted((m) => {
                  const next = !m;
                  if (introVideoRef.current) introVideoRef.current.muted = next;
                  return next;
                });
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 font-display text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              {introMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>{introMuted ? 'تشغيل الصوت' : 'كتم الصوت'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('cover')}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-red-600 px-5 py-1.5 font-display text-xs font-extrabold text-white shadow-[0_0_20px_rgba(220,38,38,0.45)] transition-colors hover:bg-red-700"
            >
              <span>تخطي إلى بدء العرض ←</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Progress Hairline */}
      {stage === 'slides' && (
        <div className="no-print fixed top-0 right-0 left-0 z-50 h-1 bg-stone-200 dark:bg-slate-800">
          <div
            className="h-full bg-red-600 transition-all duration-300 dark:bg-red-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Stage 2: Start Cover */}
      {stage === 'cover' && (
        <CoverSplash
          onEnter={() => goToSlide(0)}
          onJumpAxis={(slideIdx) => goToSlide(slideIdx)}
          onOpenVideo={replayIntroVideo}
        />
      )}

      {/* Stage 3: Full PowerPoint Presentation Viewport */}
      {stage === 'slides' && (
        <div className="flex h-screen flex-col overflow-hidden">
          <TopPresenterBar
            currentSlideIndex={currentSlide}
            onSelectSlide={goToSlide}
            onGoCover={() => setStage('cover')}
          />

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-1.5 pb-13 md:px-6 md:pt-3 md:pb-16">
            <div className="min-h-0 flex-1 overflow-hidden">
              <SlideCanvas
                slideIndex={currentSlide}
                direction={slideDirection}
                onJumpSlide={goToSlide}
              />
            </div>

            <SpeakerNotesDrawer
              open={notesOpen}
              slideIndex={currentSlide}
              onClose={() => setNotesOpen(false)}
            />
          </main>

          <PresenterDock
            currentSlideIndex={currentSlide}
            totalSlides={SLIDES_META.length}
            notesOpen={notesOpen}
            darkMode={darkMode}
            spotlightActive={spotlightActive}
            isFullscreen={isFullscreen}
            onPrev={prevSlide}
            onNext={nextSlide}
            onOpenSorter={() => setSorterOpen(true)}
            onToggleNotes={() => setNotesOpen((o) => !o)}
            onToggleDark={() => setDarkMode((d) => !d)}
            onToggleSpotlight={() => setSpotlightActive((s) => !s)}
            onToggleFullscreen={toggleFullscreen}
            onReplayIntro={replayIntroVideo}
          />
        </div>
      )}

      {/* 21-Slide Sorter Modal */}
      <SlideSorterModal
        open={sorterOpen}
        currentSlideIndex={currentSlide}
        onSelectSlide={goToSlide}
        onClose={() => setSorterOpen(false)}
      />

      {/* Laser Spotlight Pointer Overlay */}
      {spotlightActive && stage === 'slides' && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-600 bg-red-500/25 shadow-[0_0_16px_rgba(220,38,38,0.65)]"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        />
      )}
    </div>
    </MotionConfig>
  );
}

export default App;
