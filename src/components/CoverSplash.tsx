import React from 'react';
import { motion } from 'motion/react';
import { PRESENTATION_AXES } from '../data/presentationData';
import { BG_VIDEO_SRC, INTRO_VIDEO_SRC } from './EditorialVisual';
import { ArrowLeft, Film, Layers } from 'lucide-react';

interface CoverSplashProps {
  onEnter: () => void;
  onJumpAxis: (slideIndex: number) => void;
  onOpenVideo: () => void;
}

export const CoverSplash: React.FC<CoverSplashProps> = ({
  onEnter,
  onJumpAxis,
  onOpenVideo,
}) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-red-50/45 px-4 py-6 text-slate-900 dark:from-[#070b14] dark:via-[#0b101d] dark:to-[#1a0a0e] dark:text-slate-100">
      {/* Clearly Visible Background Motion Video */}
      <video
        src={BG_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75 contrast-105 saturate-110 dark:opacity-65"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/32 backdrop-blur-[1px] dark:bg-[#090d16]/44"
      />

      {/* Signature Rotating Crimson-White Animated Neon Border */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="animated-neon-frame relative z-10 w-full max-w-6xl"
      >
        <div className="animated-neon-frame-inner bg-white/88 p-6 backdrop-blur-md md:p-10 dark:bg-[#0f1625]/90">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-sm font-extrabold text-slate-800 dark:border-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.45)]">
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
              <div className="flex flex-wrap items-center gap-2 text-red-700 dark:text-red-400">
                <span>بحث أكاديمي وتطبيقي متكامل</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">27 شريحة علمية شاملة</span>
                <span aria-hidden="true">·</span>
                <span>6 محاور مترابطة</span>
              </div>
            </div>
            <span className="en tracking-wider text-slate-800 dark:text-slate-200">
              GUERRILLA MARKETING · EDITION 2026
            </span>
          </div>

          <div className="py-5 md:py-7">
            <h1 className="font-display text-3xl font-black leading-tight text-slate-950 sm:text-4xl md:text-5xl dark:text-white">
              التسويق الغوريلا{' '}
              <span className="en block pt-1.5 text-2xl font-black text-red-600 sm:inline sm:pt-0 sm:text-4xl dark:text-red-400">
                (Guerrilla Marketing)
              </span>
            </h1>
            <p className="mt-4 max-w-4xl text-base font-bold leading-relaxed text-slate-800 md:text-lg dark:text-slate-200">
              المرجع العلمي والتطبيقي الشامل: الجذور العسكرية (1808) وثورة ليفينسون (1984)، علم النفس العصبي وآليات
              الإقناع، الأبعاد الستة والمزيج السباعي، دراسات الحالة العالمية بالأرقام، ربط الغوريلا بجميع أنواع التسويق
              (التسويق بالعمولة، محتوى الجمهور <span className="en">UGC</span>، الرقمي، السوشيال، العلاقات العامة،{' '}
              <span className="en">CRM</span>، <span className="en">Local SEO</span>، و<span className="en">B2B ABM</span>)،
              تقنيات الواقع المعزز <span className="en">WebAR</span> والواقع الافتراضي <span className="en">VR</span> و<span className="en">MR</span> و<span className="en">FOOH</span> وكود <span className="en">QR</span> وتطبيقات المنصورة.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onEnter}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-xl bg-red-600 px-7 py-3 font-display text-base font-black text-white shadow-[0_0_22px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02] hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <span>ابدأ تقديم البحث العلمي</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onJumpAxis(15)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-indigo-500/45 bg-indigo-50/75 px-4 py-3 font-display text-sm font-extrabold text-indigo-900 transition-colors hover:bg-indigo-100/85 dark:border-indigo-500/45 dark:bg-indigo-950/35 dark:text-indigo-200 dark:hover:bg-indigo-950/55"
              >
                <span>الخريطة الذهنية التفاعلية</span>
              </button>

              <button
                type="button"
                onClick={() => onJumpAxis(18)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-sky-500/45 bg-sky-50/75 px-4 py-3 font-display text-sm font-extrabold text-sky-900 transition-colors hover:bg-sky-100/85 dark:border-sky-500/45 dark:bg-sky-950/35 dark:text-sky-200 dark:hover:bg-sky-950/55"
              >
                <span>محاكي <span className="en">WebAR</span></span>
              </button>

              <button
                type="button"
                onClick={() => onJumpAxis(19)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-red-500/45 bg-red-50/75 px-4 py-3 font-display text-sm font-extrabold text-red-800 transition-colors hover:bg-red-100/80 dark:border-red-500/45 dark:bg-red-950/35 dark:text-red-300 dark:hover:bg-red-950/55"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
                <span>مولّد <span className="en">QR</span> العمولة</span>
              </button>

              <button
                type="button"
                onClick={() => onJumpAxis(25)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-emerald-500/45 bg-emerald-50/75 px-4 py-3 font-display text-sm font-extrabold text-emerald-900 transition-colors hover:bg-emerald-100/85 dark:border-emerald-500/45 dark:bg-emerald-950/35 dark:text-emerald-200 dark:hover:bg-emerald-950/55"
              >
                <span>مستشار الترافيك (<span className="en">AI</span>)</span>
              </button>

              <button
                type="button"
                onClick={() => onJumpAxis(26)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-amber-500/50 bg-amber-50/80 px-4 py-3 font-display text-sm font-extrabold text-amber-950 transition-colors hover:bg-amber-100/85 dark:border-amber-500/45 dark:bg-amber-950/35 dark:text-amber-200 dark:hover:bg-amber-950/55"
              >
                <span>تقييم الحضور ★</span>
              </button>

              <button
                type="button"
                onClick={onOpenVideo}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-display text-sm font-extrabold text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Film className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                <span>الفيديو الافتتاحي</span>
              </button>
            </div>
          </div>

          {/* 6 Axes Direct Navigation Strip */}
          <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="mb-3 text-sm font-extrabold text-slate-700 dark:text-slate-200">
              الدخول المباشر إلى أي محور من المحاور الستة:
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {PRESENTATION_AXES.map((axis, idx) => (
                <motion.button
                  key={axis.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + idx * 0.05, duration: 0.35 }}
                  onClick={() => onJumpAxis(axis.startSlideIndex)}
                  className="group flex flex-col items-start rounded-xl border border-slate-300/70 bg-slate-50/90 p-3 text-right transition-all hover:border-red-500 hover:bg-red-50/60 hover:shadow-[0_0_14px_rgba(239,68,68,0.16)] dark:border-slate-800 dark:bg-slate-900/75 dark:hover:border-red-500/60 dark:hover:bg-red-950/30"
                >
                  <div className="flex w-full items-center justify-between text-xs font-extrabold">
                    <span className="tabular-nums text-red-600 dark:text-red-400">
                      الشرائح {axis.slideRange}
                    </span>
                    <span className="en text-slate-700 dark:text-slate-300">0{axis.id}</span>
                  </div>
                  <div className="mt-1 font-display text-sm font-black leading-snug text-slate-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-300">
                    {axis.title.replace(/^المحور [^:]+:\s*/, '')}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>اختصارات العرض: الأسهم للتنقل · N لملاحظات المتحدث · G لخريطة الشرائح · D للوضع الليلي · F ملء الشاشة</span>
            <span>نسخة البحث الشامل والمراجع الموثقة</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
