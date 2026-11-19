import React, { useState } from 'react';
import {
  AiGuerrillaPlanResponse,
  AiProjectBrief,
  PROJECT_PRESETS,
  TRAFFIC_GOAL_OPTIONS,
  validateProjectBrief,
} from '../utils/strategyHelpers';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const BUDGET_OPTIONS = [
  'صفر - 3,000 ج.م (أفكار شبه مجانية)',
  '3,000 - 15,000 ج.م (نموذج غوريلا الذكي)',
  '15,000 - 50,000 ج.م (حملة متكاملة FOOH + WebAR)',
  '50,000+ ج.م (حملة إقليمية متعددة الفروع)',
];

const TRAFFIC_GOALS = TRAFFIC_GOAL_OPTIONS;

function renderFormattedLines(text: string) {
  return text.split(/\r?\n/).map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-1.5" />;

    const cleanBullet = trimmed.replace(/^[-*•]\s+/, '');
    const parts = cleanBullet.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-black text-slate-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={pIdx}>{part}</React.Fragment>;
    });

    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      return (
        <div key={i} className="flex items-start gap-2 leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600 dark:bg-red-400" aria-hidden="true" />
          <span>{rendered}</span>
        </div>
      );
    }

    return (
      <p key={i} className="leading-relaxed">
        {rendered}
      </p>
    );
  });
}

export const AiStrategyAdvisor: React.FC = () => {
  const [brief, setBrief] = useState<AiProjectBrief>(PROJECT_PRESETS[0].brief);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AiGuerrillaPlanResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetBrief: AiProjectBrief) => {
    setBrief(presetBrief);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateProjectBrief(brief);
    if (check.ok === false) {
      setErrorMsg(check.errorAr);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await fetch('/api/guerrilla-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check.brief),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data?.error || 'تعذّر إنشاء الخطة حالياً. حاول مرة أخرى.');
        return;
      }

      setResult(data as AiGuerrillaPlanResponse);
    } catch {
      setErrorMsg('تعذّر الاتصال بخادم الذكاء الاصطناعي. تأكد من تشغيل الخادم وأعد المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!result?.markdown) return;
    try {
      await navigator.clipboard?.writeText(result.markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const cardBase =
    'rounded-2xl border border-slate-300/85 bg-white/92 p-4 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-[#0f172a]/90';

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
      {/* Input Brief Column */}
      <form
        onSubmit={handleSubmit}
        className={`${cardBase} flex flex-col gap-3 border-t-4 border-t-red-600 lg:col-span-5`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-sm font-black text-slate-950 lg:text-[15px] dark:text-white">
                بيانات مشروعك وخطة جلب الترافيك
              </h2>
              <p className="text-[11.5px] font-bold text-slate-600 dark:text-slate-300">
                بحث فوري عبر جوجل + ذكاء اصطناعي مجاني (<span className="en">Gemini Search Grounding</span>)
              </p>
            </div>
          </div>
        </div>

        {/* Ready Project Presets */}
        <div>
          <div className="mb-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
            نماذج مشاريع جاهزة للتجربة السريعة:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_PRESETS.map((preset) => {
              const active = brief.projectName === preset.brief.projectName;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.brief)}
                  className={`rounded-lg px-2.5 py-1.5 font-display text-xs font-extrabold transition-colors ${
                    active
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'border border-slate-300 bg-slate-50 text-slate-800 hover:border-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ai-project-type"
              className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
            >
              نوع المشروع / النشاط *
            </label>
            <input
              id="ai-project-type"
              type="text"
              required
              value={brief.projectType}
              onChange={(e) => setBrief((b) => ({ ...b, projectType: e.target.value }))}
              placeholder="مثال: مطعم برجر، متجر عطور، عيادة..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-950 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="ai-project-name"
              className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
            >
              اسم البراند (اختياري)
            </label>
            <input
              id="ai-project-name"
              type="text"
              value={brief.projectName ?? ''}
              onChange={(e) => setBrief((b) => ({ ...b, projectName: e.target.value }))}
              placeholder="اسم مشروعك التجاري"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-950 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ai-city-market"
              className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
            >
              المدينة / السوق المستهدف *
            </label>
            <input
              id="ai-city-market"
              type="text"
              required
              value={brief.cityOrMarket}
              onChange={(e) => setBrief((b) => ({ ...b, cityOrMarket: e.target.value }))}
              placeholder="مثال: المنصورة، القاهرة، السعودية..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-950 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="ai-budget-tier"
              className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
            >
              الميزانية المتاحة للتنفيذ
            </label>
            <select
              id="ai-budget-tier"
              value={brief.budgetTier}
              onChange={(e) => setBrief((b) => ({ ...b, budgetTier: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-950 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="ai-traffic-goal"
            className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
          >
            هدف الترافيك والنمو الرئيسي *
          </label>
          <select
            id="ai-traffic-goal"
            value={
              TRAFFIC_GOALS.includes(brief.trafficGoal) ? brief.trafficGoal : TRAFFIC_GOALS[0]
            }
            onChange={(e) => setBrief((b) => ({ ...b, trafficGoal: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-950 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {TRAFFIC_GOALS.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ai-custom-query"
            className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
          >
            ما الذي تريد أن يبحث عنه الذكاء الاصطناعي لمشروعك؟
          </label>
          <textarea
            id="ai-custom-query"
            rows={2}
            value={brief.customQuery ?? ''}
            onChange={(e) => setBrief((b) => ({ ...b, customQuery: e.target.value }))}
            placeholder="اكتب استفسارك: أفكار ريلز فيروسية، شراكات عمولة، أو حملة WebAR..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-950 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_0_18px_rgba(220,38,38,0.35)] transition-all hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>جارٍ البحث وبناء خطة الترافيك بالذكاء الاصطناعي...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>ابحث بالذكاء الاصطناعي وأنشئ خطة الترافيك</span>
            </>
          )}
        </button>
      </form>

      {/* Output Blueprint & Grounded Sources Column */}
      <section
        aria-label="خطة التنفيذ المولدة بالذكاء الاصطناعي"
        className={`${cardBase} flex flex-col border-t-4 border-t-sky-500 lg:col-span-7`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h2 className="font-display text-sm font-black text-slate-950 lg:text-[15px] dark:text-white">
              خطة التنفيذ العملية ومصادر البحث المباشر
            </h2>
          </div>

          {result && (
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 font-display text-xs font-black text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? 'تم نسخ الخطة كاملة' : 'نسخ الخطة'}</span>
            </button>
          )}
        </div>

        {!result && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/75 p-6 text-center dark:border-slate-700 dark:bg-slate-900/45">
            <Rocket className="mb-3 h-10 w-10 text-red-600 dark:text-red-400" aria-hidden="true" />
            <h3 className="font-display text-base font-black text-slate-950 dark:text-white">
              جاهز لتفصيل خطة تسويق غوريلا وجلب الترافيك لمشروعك
            </h3>
            <p className="mt-2 max-w-lg text-[13.5px] font-bold leading-relaxed text-slate-700 dark:text-slate-300">
              اختر أحد النماذج الجاهزة أو اكتب بيانات مشروعك وسؤالك في النموذج الجانبي ثم اضغط{' '}
              <strong>«ابحث بالذكاء الاصطناعي وأنشئ خطة الترافيك»</strong> ليقوم المحرك بالبحث في الويب وإعداد خطة
              تنفيذية احترافية خطوة بخطوة مع قنوات <span className="en">UGC / WebAR / QR / Affiliate</span> والمصادر الحية.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-slate-50/80 p-8 text-center dark:bg-slate-900/50">
            <Loader2 className="h-9 w-9 animate-spin text-red-600 dark:text-red-400" />
            <div className="font-display text-sm font-black text-slate-950 dark:text-white">
              يتم الآن البحث في الويب وتصميم خطة الترافيك المتكاملة...
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              يحلل الذكاء الاصطناعي السوق المستهدف ويربط حملتك بـ <span className="en">UGC, QR, WebAR &amp; Affiliate</span>
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="editorial-scroll mt-3 flex max-h-[460px] flex-col gap-2.5 overflow-y-auto pl-1">
            {result.sections.length > 0 ? (
              result.sections.map((sec, idx) => {
                const accents = [
                  'border-r-red-600 bg-red-50/70 dark:bg-red-950/25',
                  'border-r-sky-600 bg-sky-50/70 dark:bg-sky-950/25',
                  'border-r-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/25',
                  'border-r-amber-500 bg-amber-50/70 dark:bg-amber-950/25',
                  'border-r-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/25',
                ];
                return (
                  <article
                    key={idx}
                    className={`rounded-xl border border-slate-200/80 border-r-4 p-3.5 dark:border-slate-800 ${accents[idx % accents.length]}`}
                  >
                    <h3 className="font-display text-sm font-black text-slate-950 lg:text-[15px] dark:text-white">
                      {sec.title}
                    </h3>
                    <div className="mt-1.5 space-y-1 text-[13px] font-bold text-slate-900 dark:text-slate-100">
                      {renderFormattedLines(sec.body)}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 text-[13px] font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100">
                {renderFormattedLines(result.markdown)}
              </div>
            )}

            {/* Grounded Web Search Sources */}
            {result.sources.length > 0 && (
              <div className="rounded-xl border border-sky-300/70 bg-sky-50/85 p-3 dark:border-sky-800/70 dark:bg-sky-950/35">
                <div className="flex items-center gap-1.5 font-display text-xs font-black text-sky-900 dark:text-sky-300">
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  <span>مصادر ومراجع بحث جوجل الحية ({result.sources.length})</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.sources.map((src) => (
                    <a
                      key={src.uri}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/50 bg-white px-2.5 py-1.5 text-xs font-extrabold text-sky-950 transition-colors hover:bg-sky-100 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                      <span className="max-w-[220px] truncate">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
