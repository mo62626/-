import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ACADEMIC_REFERENCES,
  computeSimulatorState,
  filterGlossary,
  GLOSSARY_TERMS,
  HISTORICAL_ERAS,
  PRESENTATION_AXES,
  SLIDES_META,
} from '../data/presentationData';
import {
  calculateAffiliateMetrics,
  CommissionModel,
  drawQrToCanvas,
} from '../utils/qrGenerator';
import { BG_VIDEO_SRC, EditorialVisual } from './EditorialVisual';
import { WebArStudio } from './WebArStudio';
import { GuerrillaMindMap } from './GuerrillaMindMap';
import { AiStrategyAdvisor } from './AiStrategyAdvisor';
import { PresentationRating } from './PresentationRating';
import { Check, Copy, Download, ExternalLink, QrCode, Search } from 'lucide-react';

interface SlideCanvasProps {
  slideIndex: number;
  direction?: 1 | -1;
  onJumpSlide: (index: number) => void;
}

const ABBREV_MASTER_LIST = [
  {
    abbr: 'UGC',
    full: 'User-Generated Content',
    ar: 'المحتوى من صنع الجمهور',
    how: 'تصميم مشهد أو مجسم غوريلا مثير للدهشة في الشارع أو على الطاولة يجبر الزبائن على تصويره ونشره في ريلز وتيك توك طوعاً.',
    num: '12× إعلام مكتسب EMV، +79% ثقة شرائية، -68% كلفة إنتاج',
  },
  {
    abbr: 'QR Code',
    full: 'Quick Response Code',
    ar: 'رمز الاستجابة السريعة',
    how: 'طباعة كود مميز على بطاقة خداع بصري أو استند طاولة أو كوبون لفتح WebAR أو واتساب مع معاملات تتبع UTM.',
    num: 'مسح في < 1 ثانية، تحويل حتى 40%، تتبع 100% للمبيعات',
  },
  {
    abbr: 'Dynamic QR',
    full: 'Editable Tracked Quick Response',
    ar: 'كود الاستجابة الديناميكي القابل للتعديل',
    how: 'تغيير العرض المرتبط بالكود من خصم غداء لخصم عشاء لحظياً من لوحة التحكم دون إعادة طباعة المطبوعات.',
    num: 'توفير 100% من إعادة الطباعة + رصد دقيق للساعة والموقع',
  },
  {
    abbr: 'AR / WebAR',
    full: 'Augmented Reality / Web-Based AR',
    ar: 'الواقع المعزز عبر كاميرا المتصفح',
    how: 'إظهار مجسم 3D للوجبة أو الغرفة الفندقية فوق طاولة الزبون بمجرد مسح QR بدون تنزيل أي تطبيق.',
    num: '+28% متوسط قيمة الفاتورة AOV و40% نسبة تحويل',
  },
  {
    abbr: 'VR',
    full: 'Virtual Reality',
    ar: 'الواقع الافتراضي الغامر 360°',
    how: 'نصب كشك تجربة مؤقت في المول أو الجامعة بنظارة VR يعيش فيها الزائر جولة كاملة داخل الفندق أو المنتج.',
    num: '+340% تفاعل عاطفي، > 4.2 دقيقة بقاء، +45% حجوزات',
  },
  {
    abbr: 'MR & XR',
    full: 'Mixed Reality & Extended Reality',
    ar: 'الواقع المختلط والواقع الممتد',
    how: 'دمج مجسمات رقمية تتفاعل مباشرة مع يد الزائر في أكشاك المعارض (MR) وتوحيد مسار AR/VR في منظومة XR.',
    num: 'تذكّر للعلامة يتخطى 84% و5× عملاء محتملين Leads',
  },
  {
    abbr: 'FOOH / CGI',
    full: 'Fake Out-Of-Home / Computer-Generated Imagery',
    ar: 'الإعلان الخارجي الوهمي بالجرافيك 3D',
    how: 'تصوير فيديو حقيقي لشارع شهير بالهاتف ودمج مجسم 3D عملاق عليه ببرامج Blender/AI ونشره على الريلز.',
    num: 'Maybelline لندن: 50 مليون مشاهدة، +42% مبيعات، 0 تصاريح',
  },
  {
    abbr: 'SLAM',
    full: 'Simultaneous Localization And Mapping',
    ar: 'التتبع المكاني المتزامن للمجسمات',
    how: 'خوارزمية كاميرا الهاتف التي تثبت مجسم الـ 3D فوق سطح الطاولة أو الأرض بثبات تام عند حركة الزبون.',
    num: 'ثبات واقعي يدفع 72% من المجربين لتصوير الشاشة ومشاركتها',
  },
  {
    abbr: 'NFC',
    full: 'Near Field Communication',
    ar: 'الاتصال قريب المدى باللمس الذكي',
    how: 'زرع شريحة رفيعة رخيصة في بطاقة الفندق أو استند المطعم؛ تفتح التقييم أو تجربة AR بمجرد لمس الهاتف لها.',
    num: 'استجابة في 0.4 ثانية ومعدل تفعيل أعلى 2.3× من الروابط',
  },
  {
    abbr: 'O2O & Phygital',
    full: 'Offline-to-Online / Physical + Digital',
    ar: 'التحويل من الشارع للإنترنت والتسويق الهجين',
    how: 'ربط العنصر المادي الملموس (بطاقة، مقعد، كود) بمسار شراء وبيكسل وواتساب رقمي يقيس العائد.',
    num: 'نقل الزوار لمسار بيع رقمي بعائد من 2,782% لـ 2,955%',
  },
  {
    abbr: 'Geofencing',
    full: 'GPS & IP Virtual Perimeter Targeting',
    ar: 'التسييج الجغرافي الرقمي',
    how: 'توجيه إعلانات ميتا (Meta) وتيك توك (TikTok) لدائرة قطرها 500م–1كم حول موقع الحملة الميدانية لإعادة استهداف المارة.',
    num: 'خفض تكلفة النقرة CPC بنسبة -65% وعائد إنفاق ROAS 4.2×',
  },
  {
    abbr: 'Affiliate & UTM',
    full: 'Performance Partner + Urchin Tracking Module',
    ar: 'التسويق بالعمولة ومعاملات تتبع المصدر',
    how: 'توزيع بطاقات QR فريدة على سفراء الجامعة وسائقي التوصيل لتسجيل كل مبيعة تلقائياً بأسمائهم.',
    num: 'عائد 1 : 18، صفر رواتب ثابتة، وخفض الاستحواذ -72%',
  },
  {
    abbr: 'CPS & CPL',
    full: 'Cost Per Sale / Cost Per Lead',
    ar: 'العمولة مقابل البيع الفعلي أو الحجز المؤكد',
    how: 'دفع نسبة 15% عند الدفع الفعلي (CPS) للمطاعم أو مبلغ 40 ج.م عند تأكيد حجز العميل (CPL) للفنادق.',
    num: 'صفر مخاطرة مالية على رأس المال العامل للمنشأة',
  },
  {
    abbr: 'ROI & EMV',
    full: 'Return On Investment / Earned Media Value',
    ar: 'العائد على الاستثمار وقيمة الإعلام المكتسب',
    how: 'قياس صافي الربح مقابل الكلفة (ROI) وحساب القيمة المكافئة للمشاهدات الصحفية والفيروسية المجانية (EMV).',
    num: 'تجاوز ROI 500% عالمياً (2,782% بالمنصورة) و3.5M€ في إيكيا',
  },
  {
    abbr: 'CAC & LTV',
    full: 'Customer Acquisition Cost / Lifetime Value',
    ar: 'تكلفة اكتساب العميل والقيمة الدائمة له',
    how: 'خفض تكلفة جلب العميل الجديد عبر الدهشة المجانية ثم مضاعفة إنفاقه المتكرر عبر عروض الواتساب والولاء.',
    num: 'خفض CAC بنسبة 80%–90% وبقاء نسبة LTV ≥ 3× CAC',
  },
  {
    abbr: 'K-Factor & CRM',
    full: 'Viral Coefficient / Customer Relationship Mgmt',
    ar: 'معامل الانتشار الفيروسي وإدارة العملاء',
    how: 'حساب عدد الزبائن الجدد الذين يجلبهم كل عميل (K) ثم الاحتفاظ ببياناتهم عبر WhatsApp Flow والـ CRM.',
    num: 'معامل K ≥ 1.3 وتصل نسبة فتح رسائل واتساب إلى 82%',
  },
];

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slideIndex,
  direction = 1,
  onJumpSlide,
}) => {
  const meta = SLIDES_META[slideIndex] ?? SLIDES_META[0];
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Slide 5: Traditional vs Guerrilla Live Simulator
  const [simRatio, setSimRatio] = useState(50);
  const simState = computeSimulatorState(simRatio);

  // Slide 19: Live Affiliate QR Generator
  const [qrUrl, setQrUrl] = useState('https://mansoura-grill.com/offer');
  const [qrAffCode, setQrAffCode] = useState('MANSOURA_VIP_01');
  const [qrModel, setQrModel] = useState<CommissionModel>('CPS_15');
  const [qrOrders, setQrOrders] = useState(150);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const affCalc = calculateAffiliateMetrics({
    baseUrl: qrUrl,
    affiliateCode: qrAffCode,
    model: qrModel,
    expectedOrders: qrOrders,
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [meta.num]);

  useEffect(() => {
    if (meta.num === 20 && qrCanvasRef.current) {
      drawQrToCanvas(qrCanvasRef.current, affCalc.trackingUrl);
    }
  }, [meta.num, affCalc.trackingUrl]);

  // Slide 24: Glossary Search Filter (all 34 terms visible by default)
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const filteredGlossary = filterGlossary(glossaryQuery);

  const handleCopyAffiliate = async () => {
    try {
      await navigator.clipboard?.writeText(affCalc.trackingUrl);
    } catch {
      // Clipboard may be restricted in headless mode
    }
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QR-${affCalc.sanitizedCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // High-contrast crisp frosted cards letting BG-SLIDE video show clearly behind cards
  const cardBase =
    'rounded-2xl border border-slate-300/85 bg-white/86 p-4 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-[#0f172a]/86';
  const cardRed = `${cardBase} border-t-4 border-t-red-600`;
  const cardSky = `${cardBase} border-t-4 border-t-sky-500`;
  const cardInd = `${cardBase} border-t-4 border-t-indigo-600`;
  const cardAmb = `${cardBase} border-t-4 border-t-amber-500`;
  const cardEm = `${cardBase} border-t-4 border-t-emerald-500`;

  const noteBox =
    'mt-2.5 rounded-xl border-r-4 border-r-red-600 bg-red-50/95 px-3.5 py-2.5 text-[13.5px] font-bold leading-relaxed text-slate-950 lg:text-[14.5px] dark:bg-red-950/45 dark:text-slate-100';
  const noteBoxSky =
    'mt-2.5 rounded-xl border-r-4 border-r-sky-600 bg-sky-50/95 px-3.5 py-2.5 text-[13.5px] font-bold leading-relaxed text-slate-950 lg:text-[14.5px] dark:bg-sky-950/45 dark:text-slate-100';
  const noteBoxEm =
    'mt-2.5 rounded-xl border-r-4 border-r-emerald-600 bg-emerald-50/95 px-3.5 py-2.5 text-[13.5px] font-bold leading-relaxed text-slate-950 lg:text-[14.5px] dark:bg-emerald-950/45 dark:text-slate-100';

  const pillRed =
    'inline-block rounded-lg bg-red-600/14 px-3 py-1 font-display text-xs font-black text-red-800 lg:text-[13px] dark:bg-red-500/20 dark:text-red-300';
  const pillSky =
    'inline-block rounded-lg bg-sky-500/16 px-3 py-1 font-display text-xs font-black text-sky-900 lg:text-[13px] dark:bg-sky-500/20 dark:text-sky-300';
  const pillInd =
    'inline-block rounded-lg bg-indigo-500/16 px-3 py-1 font-display text-xs font-black text-indigo-900 lg:text-[13px] dark:bg-indigo-500/20 dark:text-indigo-300';
  const pillAmb =
    'inline-block rounded-lg bg-amber-500/20 px-3 py-1 font-display text-xs font-black text-amber-950 lg:text-[13px] dark:bg-amber-500/20 dark:text-amber-300';
  const pillEm =
    'inline-block rounded-lg bg-emerald-500/16 px-3 py-1 font-display text-xs font-black text-emerald-900 lg:text-[13px] dark:bg-emerald-500/20 dark:text-emerald-300';

  // Larger, bolder typography matching English and Arabic weight rhythm
  const bodyTxt =
    'mt-2 text-sm font-bold leading-[1.7] text-slate-900 lg:text-[15.5px] dark:text-slate-100';
  const smallTxt =
    'mt-1.5 text-[13.5px] font-bold leading-[1.68] text-slate-900 lg:text-[14.5px] dark:text-slate-100';

  const renderSlideBody = () => {
    switch (meta.num) {
      /* ---------------- SLIDE 01: COVER & COMPREHENSIVE THESIS ---------------- */
      case 1:
        return (
          <div className="grid grid-cols-1 items-stretch gap-3.5 sm:grid-cols-12">
            <div className="flex flex-col justify-between gap-3 sm:col-span-7">
              <div className={cardRed}>
                <span className={pillRed}>الأطروحة العلمية والفلسفة الجوهرية</span>
                <h2 className="mt-2 font-display text-lg font-black text-slate-950 lg:text-xl dark:text-white">
                  كيف يهزم الذكاء الإبداعي والتقني الميزانيات المليونية؟
                </h2>
                <p className={bodyTxt}>
                  يمثل <strong>التسويق الغوريلا (<span className="en">Guerrilla Marketing</span>)</strong> منهجية تسويقية
                  غير تقليدية تقوم على كسر رتابة الإعلانات المعتادة عبر استثمار{' '}
                  <strong>الوقت، والخيال، والطاقة الإبداعية، والتكنولوجيا الحديثة</strong> بدلاً من الإنفاق المالي الضخم.
                  فبينما يتعرض المستهلك الحديث لـ <strong>4,000–10,000 رسالة يومياً</strong> مما أصابه بـ{' '}
                  <strong>العمى الإعلاني (<span className="en">Banner Blindness</span>)</strong> الذي يحجب 99.5% من الإعلانات،
                  تخترق حملات الغوريلا هذا الحاجز الدفاعي بمفاجأة ذكية تُصنع خصيصاً لتُصوَّر وتُشارك طوعاً كـ{' '}
                  <strong>محتوى جمهور (<span className="en">UGC</span>)</strong>.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-xl bg-red-50/95 p-2.5 dark:bg-red-950/35">
                    <div className="en tabular-nums text-base font-black text-red-700 lg:text-lg dark:text-red-300">
                      -80% : -90%
                    </div>
                    <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      خفض تكلفة اكتساب العميل (<span className="en">CAC</span>)
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50/95 p-2.5 dark:bg-emerald-950/35">
                    <div className="en tabular-nums text-base font-black text-emerald-700 lg:text-lg dark:text-emerald-300">
                      &gt; 500%
                    </div>
                    <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      العائد على الاستثمار (<span className="en">ROI</span>)
                    </div>
                  </div>
                  <div className="rounded-xl bg-sky-50/95 p-2.5 dark:bg-sky-950/35">
                    <div className="en tabular-nums text-base font-black text-sky-700 lg:text-lg dark:text-sky-300">
                      6× أعمق
                    </div>
                    <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      معدل التذكر الذهني بالذاكرة الطويلة
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardSky}>
                <span className={pillSky}>هيكل البحث العلمي والتطبيقي · 27 شريحة عبر 6 محاور مترابطة</span>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                  {PRESENTATION_AXES.map((ax) => (
                    <button
                      key={ax.id}
                      type="button"
                      onClick={() => onJumpSlide(ax.startSlideIndex)}
                      className="rounded-xl border border-slate-300/90 bg-slate-50/95 p-2.5 text-right transition-all hover:border-red-600 hover:bg-red-50/80 dark:border-slate-700 dark:bg-slate-900/80"
                    >
                      <div className="flex items-center justify-between text-xs font-black text-red-700 dark:text-red-400">
                        <span className="tabular-nums">الشرائح {ax.slideRange}</span>
                        <span className="en">0{ax.id}</span>
                      </div>
                      <div className="mt-1 font-display text-[13px] font-black leading-snug text-slate-950 dark:text-white">
                        {ax.title.replace(/^المحور [^:]+:\s*/, '')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${cardBase} flex flex-col justify-between gap-2.5 p-3 sm:col-span-5`}>
              <EditorialVisual imageNum={1} tall alt="التسويق الغوريلا - اختراق العمى الإعلاني" />
              <div className={noteBox}>
                <strong>القيمة المضافة للبحث:</strong> يجمع هذا المرجع بين النظريات الأكاديمية المحكّمة، وربط الغوريلا بـ{' '}
                <strong>9 أنواع تسويق حديثة</strong> (بما فيها <span className="en">UGC</span> والتسويق بالعمولة{' '}
                <span className="en">Affiliate</span>)، وتقنيات الواقع المعزز <span className="en">AR/WebAR</span> والافتراضي{' '}
                <span className="en">VR</span> والمختلط <span className="en">MR/XR</span> و<span className="en">FOOH</span>، وتطبيقات المنصورة.
              </div>
            </div>
          </div>
        );

      /* ---------------- SLIDE 02: 1808 MILITARY ROOTS & 1984 LEVINSON ---------------- */
      case 2:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <article className={cardRed}>
              <EditorialVisual imageNum={2} compact alt="حرب الاستقلال الإسبانية 1808" />
              <div className="mt-2.5">
                <span className={pillRed}>1808 – 1814 · شبه الجزيرة الأيبيرية، إسبانيا</span>
              </div>
              <h2 className="mt-1.5 font-display text-base font-black text-slate-950 lg:text-lg dark:text-white">
                1. التأصيل التاريخي والعسكري لمفهوم (<span className="en">Guerrilla</span>)
              </h2>
              <p className={smallTxt}>
                يعود المصطلح لغوياً إلى اللغة الإسبانية؛ حيث تعني <strong className="en">Guerra</strong> «الحرب»، بينما
                التصغير <strong className="en">Guerrilla</strong> يعني «الحرب الصغيرة» أو «حرب العصابات». ظهر المصطلح تاريخياً
                إبان حرب الاستقلال الإسبانية ضد جيش نابليون بونابرت، حيث نجحت فصائل صغيرة من <strong>50,000 مقاتل</strong>{' '}
                في استنزاف جيش نظامي يفوق <strong>250,000 جندي</strong> بنسبة خسائر تكتيكية غير متكافئة تفوق{' '}
                <strong>5 : 1</strong>، ووثّقها المنظّر العسكري{' '}
                <strong>كارل فون كلاوزفيتز (<span className="en">Carl von Clausewitz</span>)</strong> في كتابه{' '}
                <em className="en">On War (1832)</em> بوصفها عقيدة تفوّق القوى الصغيرة المرنة.
              </p>
              <div className={noteBox}>
                <strong>الدليل والقوانين الثلاثة المنقولة لعالم الأعمال:</strong> (1) تجنّب المواجهة المالية المباشرة مع المنافس العملاق،
                (2) توظيف المعرفة الدقيقة بتضاريس السوق المحلية وثقافتها، (3) الاعتماد على الضربات الخاطفة والمرونة الفائقة.
              </div>
            </article>

            <article className={cardSky}>
              <EditorialVisual imageNum={3} compact alt="كتاب جاي كونراد ليفينسون 1984" />
              <div className="mt-2.5">
                <span className={pillSky}>1984 · بوسطن، الولايات المتحدة الأمريكية</span>
              </div>
              <h2 className="mt-1.5 font-display text-base font-black text-slate-950 lg:text-lg dark:text-white">
                2. التأسيس الأكاديمي والتجاري على يد «جاي كونراد ليفينسون»
              </h2>
              <p className={smallTxt}>
                في عام <strong>1984</strong>، صاغ الخبير الإعلاني الأمريكي{' '}
                <strong>جاي كونراد ليفينسون (<span className="en">Jay Conrad Levinson</span>)</strong> هذا المفهوم في كتابه
                المؤسس <em className="en">"Guerrilla Marketing: Secrets for Making Big Profits from Your Small Business"</em>{' '}
                (تجاوزت مبيعاته <strong>21 مليون نسخة</strong> وتُرجم إلى <strong>62 لغة</strong>) لتمكين المشروعات الصغيرة
                والمتوسطة (<span className="en">SMEs — Small and Medium Enterprises</span>) من انتزاع الحصة السوقية من
                الشركات متعددة الجنسيات بتكلفة أقل بنسبة <strong>80% إلى 90%</strong>.
              </p>
              <div className={noteBoxSky}>
                <strong>الوصايا الرقمية لمدرسة ليفينسون:</strong> العملة الحقيقية ليست المال بل{' '}
                <strong>الوقت والطاقة الإبداعية والخيال</strong>؛ ومقياس النجاح الوحيد هو{' '}
                <strong>صافي الربح (<span className="en">Net Profit</span>)</strong> وليس مجرد عدد المشاهدات العابرة، مع توظيف
                الشراكات المتقاطعة (<span className="en">Fusion Marketing</span>).
              </div>
            </article>
          </div>
        );

      /* ---------------- SLIDE 03: ALL 5 HISTORICAL ERAS VISIBLE DIRECTLY ---------------- */
      case 3:
        return (
          <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-12">
            <div className={`${cardRed} sm:col-span-4`}>
              <EditorialVisual imageNum={4} compact alt="تطور التسويق الغوريلا عبر أربعة عقود" />
              <div className="mt-2.5">
                <span className={pillRed}>الفلسفة التطورية (1984 – 2026)</span>
              </div>
              <h2 className="mt-1.5 font-display text-base font-black text-slate-950 dark:text-white">
                ثبات الجوهر وتحوّل الوسائط التكنولوجية
              </h2>
              <p className={smallTxt}>
                تؤكد القراءة التاريخية المقارنة أن جوهر التسويق الغوريلا لم يتغير منذ أربعة عقود:{' '}
                <strong>«تحقيق أقصى استجابة نفسية وتجارية بأقل إنفاق نقدي ممكن»</strong>. غير أن الثورة الرقمية نقلت
                مدى الحملة الواحدة من <strong>500 مارّ في شارع محلي</strong> إلى <strong>50+ مليون مشاهدة عالمياً</strong> خلال
                أسبوع عبر منصات الفيديو القصير وتقنيات الواقع المعزز والافتراضي والـ <span className="en">FOOH</span>.
              </p>
              <div className={noteBox}>
                <strong>الدليل الرقمي للقفزة الكبرى:</strong> حملة فيلم <span className="en">Blair Witch Project (1999)</span>{' '}
                أنفقت <strong>35,000$</strong> فقط وحققت إيرادات عالمية بقيمة <strong>248.6 مليون دولار</strong> (عائد{' '}
                <strong>710,000%</strong>).
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:col-span-8 sm:grid-cols-2">
              {HISTORICAL_ERAS.map((era, idx) => {
                const accents = [cardRed, cardSky, cardInd, cardAmb, cardEm];
                const pills = [pillRed, pillSky, pillInd, pillAmb, pillEm];
                return (
                  <article
                    key={era.period}
                    className={`${accents[idx % accents.length]} ${idx === 4 ? 'sm:col-span-2' : ''}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className={`${pills[idx % pills.length]} en tabular-nums`}>
                        0{idx + 1} · {era.period}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {era.location}
                      </span>
                    </div>
                    <h3
                      className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white"
                      dangerouslySetInnerHTML={{ __html: era.titleHtml }}
                    />
                    <p
                      className={smallTxt}
                      dangerouslySetInnerHTML={{ __html: era.descriptionHtml }}
                    />
                    <div className="mt-2 rounded-xl bg-slate-100/95 px-3 py-2 text-xs font-extrabold leading-relaxed text-slate-950 lg:text-[13px] dark:bg-slate-900/85 dark:text-slate-100">
                      <strong className="text-red-700 dark:text-red-400">الأدلة والأرقام الموثقة: </strong>
                      <span dangerouslySetInnerHTML={{ __html: era.metricsHtml }} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );

      /* ---------------- SLIDE 04: NEUROMARKETING & STEPPS ---------------- */
      case 4:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <article className={cardRed}>
              <EditorialVisual imageNum={3} compact alt="علم النفس العصبي للتسويق الغوريلا" />
              <div className="mt-2.5">
                <span className={pillRed}>01 · التفسير العصبي للانتباه</span>
              </div>
              <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                اختراق النظام الشبكي المنشط (<span className="en">RAS — Reticular Activating System</span>)
              </h2>
              <p className={smallTxt}>
                يتعرض عقل المستهلك يومياً لما بين <strong>4,000 إلى 10,000 رسالة إعلانية</strong>؛ فيقوم نظام{' '}
                <span className="en">RAS</span> في جذع الدماغ بتصفية وحجب <strong>99.5%</strong> مما هو مألوف ومتكرر في ظاهرة تُعرف بـ{' '}
                <strong>العمى الإعلاني (<span className="en">Banner Blindness</span>)</strong>. المفاجأة السياقية الغوريلا
                تُحدث <strong>خرقاً للتوقع (<span className="en">Pattern Interrupt</span>)</strong> في أقل من <strong>0.3 ثانية</strong>{' '}
                تجبر اللوزة الدماغية (<span className="en">Amygdala</span>) على إطلاق إشارة يقظة وانتباه فورية.
              </p>
            </article>

            <article className={cardInd}>
              <span className={pillInd}>02 · ترميز الذاكرة والسلوك القهري</span>
              <h2 className="mt-2 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                تأثير العزلة + فجوة الفضول + الدوبامين
              </h2>
              <div className="mt-2.5 space-y-2.5 text-[13.5px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                <div className="rounded-xl bg-indigo-50/90 p-3 dark:bg-indigo-950/35">
                  <strong className="text-indigo-800 dark:text-indigo-300">
                    1. تأثير فون ريستورف (<span className="en">Von Restorff / Isolation Effect</span>):
                  </strong>{' '}
                  العنصر الغريب المخالف لمحيطه المألوف يُحفظ في الذاكرة طويلة المدى بنسبة تتفوق على العناصر النمطية بـ{' '}
                  <strong>6 أضعاف (600% تذكّر أعلى)</strong> حسب تجارب <span className="en">Hutter &amp; Hoffmann (2014)</span>.
                </div>
                <div className="rounded-xl bg-amber-50/90 p-3 dark:bg-amber-950/35">
                  <strong className="text-amber-900 dark:text-amber-300">
                    2. تأثير زيجارنيك (<span className="en">Zeigarnik Effect</span>):
                  </strong>{' '}
                  المشهد الناقص أو اللغز البصري يخلق توتراً معرفياً إيجابياً يفرز <strong>الدوبامين</strong> ولا يهدأ حتى يخرج
                  العميل هاتفه ويمسح رمز الاستجابة السريعة (<span className="en">QR — Quick Response</span>) بنسب تصل لـ{' '}
                  <strong>40%</strong> لاكتشاف النهاية.
                </div>
              </div>
            </article>

            <article className={cardEm}>
              <span className={pillEm}>03 · نظرية العدوى الاجتماعية (Jonah Berger, 2013)</span>
              <h2 className="mt-2 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                نموذج المشاركة الستة (<span className="en">STEPPS Framework</span>)
              </h2>
              <p className={smallTxt}>
                أثبت أستاذ التسويق بجامعة بنسلفانيا جونا بيرجر عبر تحليل <strong>7,000+ مقال وفيديو</strong> المحركات الستة للانتشار:
              </p>
              <ul className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                <li><strong className="en text-emerald-700 dark:text-emerald-300">S · Social Currency (العملة الاجتماعية):</strong> مشاركة الفكرة تجعل الناشر يبدو ذكياً وسابقاً لبيئته.</li>
                <li><strong className="en text-emerald-700 dark:text-emerald-300">T · Triggers (المحفزات البيئية):</strong> ربط العلامة بعناصر متكررة يومياً (+15% تذكّر تلقائي).</li>
                <li><strong className="en text-emerald-700 dark:text-emerald-300">E · Emotion (الإثارة العاطفية العالية):</strong> الدهشة والضحك ترفعان إعادة النشر بنسبة <strong>+300%</strong>.</li>
                <li><strong className="en text-emerald-700 dark:text-emerald-300">P · Public (العلنية البصرية):</strong> المشهد العلني بالشارع يرفع تقليد المارة إلى <strong>82%</strong>.</li>
                <li><strong className="en text-emerald-700 dark:text-emerald-300">P · Practical Value (القيمة العملية):</strong> دمج كوبون خصم <strong>15%–20%</strong> يحفز الإرسال للأصدقاء.</li>
                <li><strong className="en text-emerald-700 dark:text-emerald-300">S · Stories (القصة):</strong> تغليف العرض بحكاية مدهشة يُعاد سردها في <strong>60 ثانية</strong>.</li>
              </ul>
            </article>
          </div>
        );

      /* ---------------- SLIDE 05: TRADITIONAL VS GUERRILLA + SIMULATOR ---------------- */
      case 5:
        return (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-12">
              <div className="overflow-x-auto rounded-2xl border border-slate-300/85 bg-white/95 shadow-sm sm:col-span-8 dark:border-slate-800 dark:bg-[#101726]/95">
                <table className="w-full border-collapse text-right text-[13px] lg:text-[14px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-red-600/12 text-red-900 dark:border-slate-800 dark:bg-red-950/45 dark:text-red-300">
                      <th className="p-2.5 font-display font-black">البُعد المقارن</th>
                      <th className="p-2.5 font-display font-black">التسويق التقليدي (<span className="en">Traditional</span>)</th>
                      <th className="p-2.5 font-display font-black">التسويق الغوريلا (<span className="en">Guerrilla</span>)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-bold text-slate-900 dark:divide-slate-800 dark:text-slate-100">
                    {[
                      ['1. المورد الحاكم', 'ميزانيات ضخمة (60,000–250,000 ج.م شهرياً للوحة واحدة).', 'الوقت، الخيال، وتقنيات WebAR وFOOH (< 15,000 ج.م شاملة).'],
                      ['2. معيار القياس', 'عدد مرات الظهور التقديري (Impressions) دون ضمان مبيعات.', 'التفاعل الفعلي، الإعلام المكتسب (EMV)، وصافي الربح (ROI > 500%).'],
                      ['3. الحاجز النفسي', 'تجاهل لاواعي بنسبة 99.5% نتيجة العمى الإعلاني (Banner Blindness).', 'مفاجأة تكسر توقع المخ RAS وتخلق 6× تذكراً بالذاكرة الطويلة.'],
                      ['4. دور الجمهور', 'متلقٍ سلبي يُفرض عليه الإعلان قسراً أثناء القيادة أو التصفح.', 'شريك يصوّر المشهد طوعاً ويولّد محتوى جمهور (UGC) بـ 12× قيمة إعلانية.'],
                      ['5. الاستمرارية الزمنية', 'تتوقف التغطية في اللحظة التي ينتهي فيها الرصيد الإعلاني الممول.', 'تستمر ذاتياً عبر الانتشار الفيروسي (K-Factor ≥ 1.3) وبطاقات العمولة.'],
                      ['6. دقة الاستهداف', 'هدر مالي يتخطى 70% على شرائح خارج السوق المستهدف.', 'تركيز جغرافي دقيق عبر التسييج الجغرافي (Geofencing 500م–1كم).'],
                      ['7. سرعة التنفيذ', 'بطيئة؛ تتطلب عقود إيجار وموافقات طباعة تستغرق 14–30 يوماً.', 'مرونة فائقة؛ إنتاج وإطلاق فيديو FOOH وتجربة WebAR خلال 24–48 ساعة.'],
                      ['8. تكلفة العميل (CAC)', 'تكلفة استحواذ مرتفعة تتضخم سنوياً مع اشتداد المزايدة الإعلانية.', 'خفض تكلفة اكتساب العميل (CAC) بنسبة 80% إلى 90% بالأدلة التطبيقية.'],
                    ].map(([k, t, g]) => (
                      <tr key={k}>
                        <td className="p-2 font-black text-slate-950 dark:text-white">{k}</td>
                        <td className="p-2">{t}</td>
                        <td className="p-2 font-extrabold text-emerald-800 dark:text-emerald-300">{g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`${cardRed} sm:col-span-4`}>
                <EditorialVisual imageNum={5} compact alt="اللوحة التقليدية مقابل مجسم الغوريلا" />
                <p className={smallTxt}>
                  <strong>التحليل السلوكي المقارن:</strong> في الشوارع المزدحمة، يتجاهل <strong>99.5%</strong> من المارة
                  اللوحة التقليدية بسبب انشغالهم بالهاتف (<span className="en">&lt; 0.3%</span> تحويل)؛ بينما تجبرهم حيلة
                  الغوريلا على إخراج الهاتف نفسه للتصوير والمشاركة وتحقيق معدل تحويل يبلغ <strong>35%–40%</strong> عبر{' '}
                  <span className="en">QR + WebAR</span>.
                </p>
              </div>
            </div>

            <div className={cardSky}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="sim-slider" className="font-display text-sm font-black text-slate-950 lg:text-[15px] dark:text-white">
                  محاكي التحوّل الحي: مقارنة إطلاق مطعم في شارع المشاية بالمنصورة (الميزانية vs العائد بالأرقام)
                </label>
                <span className="tabular-nums rounded-full bg-red-600/14 px-3.5 py-1 text-xs font-black text-red-800 dark:text-red-300">
                  نسبة التحوّل نحو الغوريلا: {simState.ratio}%
                </span>
              </div>
              <input
                id="sim-slider"
                type="range"
                min={0}
                max={100}
                value={simRatio}
                onChange={(e) => setSimRatio(Number(e.target.value))}
                className="mt-2 w-full accent-red-600"
              />
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div
                  style={{ opacity: Math.max(0.55, simState.tradVisibilityPercent / 100) }}
                  className="rounded-xl border border-red-300 bg-red-50/95 p-3 text-[13px] font-bold leading-relaxed text-slate-950 transition-opacity dark:border-red-900/50 dark:bg-red-950/35 dark:text-slate-100"
                >
                  <strong className="text-red-700 dark:text-red-400">المسار التقليدي: </strong>
                  {simState.tradNote}
                </div>
                <div
                  style={{ opacity: Math.max(0.65, simState.guerrillaImpactPercent / 100) }}
                  className="rounded-xl border border-emerald-300 bg-emerald-50/95 p-3 text-[13px] font-bold leading-relaxed text-slate-950 transition-opacity dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-100"
                >
                  <strong className="text-emerald-800 dark:text-emerald-300">مسار الغوريلا الهجين: </strong>
                  {simState.guerrillaNote}
                </div>
              </div>
            </div>
          </div>
        );

      /* ---------------- SLIDE 06: 6 CONTEXTUAL DIMENSIONS ---------------- */
      case 6:
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                cls: cardEm,
                pill: pillEm,
                k: '01 · البُعد البيئي (Environmental Dimension)',
                t: 'الاستدامة واحترام الفضاء العام',
                d: 'يقيس مدى اندماج الحملة في المشهد الحضري دون تشويه بصري أو نفايات بلاستيكية أو مخالفة لقوانين النظافة. البدائل الصديقة للبيئة تحمي العلامة من الغرامات البلدية وتكسب تعاطف الجيل الشاب.',
                n: "الدليل الرقمي (لندن، 2008): حملة Domino's للجرافيتي العكسي بتنظيف 400+ رقعة رصيف بالماء المضغوط فقط حققت +1.2 مليون مشاهدة، 0 غرامات بلدية، وخفضت الكلفة بنسبة 78%.",
              },
              {
                cls: cardSky,
                pill: pillSky,
                k: '02 · البُعد الثقافي (Cultural Dimension)',
                t: 'مراعاة القيم واللهجة والرموز المحلية',
                d: 'المفاجأة والفكاهة حساستان ثقافياً؛ الحملة المقتبسة حرفياً من الغرب قد تفشل أو تسيء في مجتمع شرقي. النجاح يتطلب بناء الرسالة على الشفرة الثقافية والمواسم واللهجة المحببة.',
                n: 'الدليل التطبيقي: توظيف خفة الظل المصرية ومواسم امتحانات الجامعة بالمنصورة يرفع التفاعل والمشاركة العفوية بنسبة +210% مقارنة بالإعلانات الفصحى الجامدة.',
              },
              {
                cls: cardRed,
                pill: pillRed,
                k: '03 · البُعد الاجتماعي (Social Dimension)',
                t: 'تحفيز العدوى الاجتماعية الجماعية',
                d: 'تصميم الحدث بحيث يكسر العزلة الفردية في الشارع ويشجع شخصين أو أكثر على التعاون سوياً؛ فيولد «دليلاً اجتماعياً» يجذب عشرات المارة خلال دقائق.',
                n: 'الدليل الرقمي (سنغافورة، 2012): آلة كوكاكولا "Hug Me" لم تفتح إلا عند معانقة شخصين لها؛ رفعت المبيعات المحلية +18% وحصدت 3.4 مليون مشاهدة بتكلفة تشغيلية لا تتجاوز 12,000$.',
              },
              {
                cls: cardAmb,
                pill: pillAmb,
                k: '04 · البُعد الاقتصادي (Economic Dimension)',
                t: 'كفاءة رأس المال والعائد على الاستثمار (ROI)',
                d: 'المعيار الجوهري لدى ليفينسون؛ تُقيّم كل فكرة بقدرتها على تحويل إنفاق محدود إلى قيمة إعلامية ومبيعات تضاهي أضعاف الميزانية دون تعريض السيولة للخطر.',
                n: 'الدليل الرقمي: تعويض فارق القوة المالية بتحقيق تكلفة الألف ظهور (CPM — Cost Per Mille) أقل بنسبة 85% وتحقيق ROI يتجاوز 500% إلى 2,780%.',
              },
              {
                cls: cardInd,
                pill: pillInd,
                k: '05 · البُعد القانوني والأخلاقي (Legal & Ethical)',
                t: 'الالتزام بالتصاريح وحماية السمعة',
                d: 'يرسم الحد الفاصل بين «الإبداع الجريء» و«التعدي أو الترويع الأمني». يشمل احترام الملكية، عدم إغلاق الممرات، خصوصية الوجوه، والامتثال لقواعد الإفصاح الإعلاني.',
                n: 'الدليل الرقمي التحذيري (بوسطن، 2007): إهمال الإخطار القانوني لـ 38 لوحة مضيئة كلّف Turner Broadcasting غرامة 2 مليون دولار؛ والحل الرقمي هو FOOH/WebAR بصفر غرامات.',
              },
            ].map((item) => (
              <article key={item.k} className={item.cls}>
                <span className={item.pill}>{item.k}</span>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                  {item.t}
                </h2>
                <p className={smallTxt}>{item.d}</p>
                <div className={noteBox}>{item.n}</div>
              </article>
            ))}

            <article className={cardSky}>
              <EditorialVisual imageNum={6} compact alt="البعد التكنولوجي والجرافيتي النظيف" />
              <div className="mt-2.5">
                <span className={pillSky}>06 · البُعد التكنولوجي (Technological Dimension)</span>
              </div>
              <p className={smallTxt}>
                تحويل الحملة الميدانية من مشهد عابر إلى قمع بيعي متتبع رقمياً بنسبة <strong>100%</strong> باستخدام{' '}
                <strong>رموز <span className="en">QR</span></strong>، والواقع المعزز <strong><span className="en">WebAR</span></strong>،
                والواقع الافتراضي <strong><span className="en">VR</span></strong>، وتقنية{' '}
                <strong>التسييج الجغرافي (<span className="en">Geofencing 1 km</span>)</strong> لرفع نسبة التحويل إلى{' '}
                <strong>40%</strong> ومضاعفة العائد الإعلاني <span className="en">4.2×</span>.
              </p>
            </article>
          </div>
        );

      /* ---------------- SLIDE 07: 6 TACTICAL TRAITS (HUTTER & HOFFMANN) ---------------- */
      case 7:
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className={cardRed}>
              <EditorialVisual imageNum={7} compact alt="خديعة المصعد ثلاثي الأبعاد - Surprise" />
              <div className="mt-2.5">
                <span className={pillRed}>01 · Surprise (عنصر المفاجأة)</span>
              </div>
              <h2 className="mt-1 font-display text-[15px] font-black text-slate-950 dark:text-white">
                كسر التوقع في ثانية واحدة
              </h2>
              <p className={smallTxt}>
                بحسب دراسة هوتر وهوفمان المحكّمة (<em className="en">Journal of Retailing, 2014</em>)، المفاجأة هي
                الشرارة التي تفتح باب الانتباه. <strong>الدليل الرقمي (زيورخ، 2008):</strong> ملصق 3D على أرضية مصعد
                لمدرسة <span className="en">Swiss Skydive</span> بتكلفة <strong>3,200$</strong> رفع التسجيل الفوري بنسبة{' '}
                <strong>+45%</strong> وحقق تذكراً ذهنياً أعلى بـ <strong>6 أضعاف</strong>.
              </p>
            </article>

            {[
              {
                cls: cardSky,
                pill: pillSky,
                k: '02 · Diffusion (قابلية الانتشار والعدوى)',
                t: 'هندسة التداول الاجتماعي التطوعي',
                d: 'لا يكفي اندهاش الحاضرين بالموقع؛ بل يجب أن يكون المشهد مصمماً لعدسة الكاميرا كي ينقله الجمهور مجاناً على يوتيوب وإنستغرام وتيك توك كـ UGC.',
                n: 'الدليل الرقمي (نيويورك، 2010): آلة سعادة كوكاكولا بجامعة سانت جونز بتكلفة 30,000$ حصدت 4.5 مليون مشاهدة خلال 7 أيام و+11% مبيعات جامعية دون إعلان ممول.',
              },
              {
                cls: cardEm,
                pill: pillEm,
                k: '03 · Low Cost (التكلفة المنخفضة والأثر العالي)',
                t: 'استثمار البنية المحيطة مجاناً',
                d: 'يقوم المعيار على إحلال الخيال محل التكلفة الإنتاجية عبر توظيف فتحات البخار أو خطوط المشاة الموجودة أصلاً بالشارع لإتمام الدلالة البصرية.',
                n: 'الدليل الرقمي (مانهاتن، 2007): وضع أغطية أكواب Folgers فوق فتحات البخار كلّف 8,000$ فقط (بدلاً من 250,000$ لوحات) وحصد 2.1 مليون ظهور مجاني وتغطية CBS وNBC.',
              },
              {
                cls: cardAmb,
                pill: pillAmb,
                k: '04 · Clarity (الوضوح الفوري — قاعدة 3 ثوانٍ)',
                t: 'الفهم البصري الخاطف دون نصوص مطوّلة',
                d: 'إذا احتاج المشاهد أكثر من 3 ثوانٍ لفهم الفكرة أو معرفة العلامة التجارية تتسرب الفعالية وتحدث ظاهرة Vampire Effect (تُذكر النكتة ويُنسى المنتج).',
                n: 'الدليل الرقمي (كندا، 2011): طلاء عمود إنارة ليبدو كعود أسنان عملاق يحمل شعار عيادة أسنان بتكلفة 1,800$ رفع المكالمات والزيارات بنسبة +60% خلال شهر واحد.',
              },
              {
                cls: cardInd,
                pill: pillInd,
                k: '05 · Humor (الفكاهة والبهجة الذكية)',
                t: 'تفكيك المقاومة الدفاعية للمستهلك',
                d: 'الضحك يفرز الإندورفين ويزيل التحفّز النقدي تجاه الإعلان؛ مما يجعل المستهلك أكثر تقبلاً للعرض البيعي وارتباطاً عاطفياً بالعلامة.',
                n: 'الدليل الرقمي (برلين، 2010): مرايا مقعرة في محطات الحافلات تُظهر المارة بأجساد رياضية لنادي Fitness First بتكلفة 9,500€ رفعت الاشتراكات بنسبة +27% وتداولتها 18 صحيفة.',
              },
              {
                cls: cardRed,
                pill: pillRed,
                k: '06 · Creativity (الابتكار وتجربة المنتج)',
                t: 'دمج وظيفة المنتج في الحدث اليومي',
                d: 'أرقى مستويات الإبداع الغوريلا هو جعل الجمهور يجرّب المنتج وظيفياً وهو في طريقه للعمل أو الجامعة دون الدخول للمتجر.',
                n: 'الدليل الرقمي (ألمانيا، 2009): تحويل مقابض اليد داخل 300 حافلة لمجسمات ساعات IWC الفاخرة ليرتديها الركاب؛ رفع زيارات الفروع بنسبة +34% ومبيعات الطراز بنسبة +19%.',
              },
            ].map((c) => (
              <article key={c.k} className={c.cls}>
                <span className={c.pill}>{c.k}</span>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                  {c.t}
                </h2>
                <p className={smallTxt}>{c.d}</p>
                <div className={noteBox}>{c.n}</div>
              </article>
            ))}
          </div>
        );

      /* ---------------- SLIDE 08: EXTENDED 7PS MARKETING MIX ---------------- */
      case 8:
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className={cardRed}>
              <EditorialVisual imageNum={8} compact alt="حقيبة Fitness Company على شكل ثقل" />
              <div className="mt-2.5">
                <span className={`${pillRed} en`}>01 · Product (المنتج والتغليف الدعائي)</span>
              </div>
              <h2 className="mt-1 font-display text-[15px] font-black text-slate-950 dark:text-white">
                تحويل العبوة والحقيبة إلى إعلان متحرك
              </h2>
              <p className={smallTxt}>
                تصميم شكل المنتج أو كيس التغليف ليصنع وهماً بصرياً مدهشاً في يد كل عميل بالشارع.{' '}
                <strong>الدليل الرقمي (أوروبا ودبي، 2012):</strong> توزيع <strong>15,000 حقيبة</strong> لنادي{' '}
                <span className="en">Fitness Company</span> مرسوم عليها يد تحمل ثقلاً حديدياً بتكلفة طباعة إضافية{' '}
                <strong>0.15$ فقط للحقيبة</strong> حقق <strong>450,000+ مشاهدة ميدانية</strong> شهرياً ورفع استفسارات
                العضوية <strong>+31%</strong>.
              </p>
            </article>

            {[
              {
                cls: cardSky,
                pill: pillSky,
                k: '02 · Price (التسعير التفاعلي والعينات المسرحية)',
                t: 'استبدال النقود بتحدٍّ مرح أو تفاعل حركي',
                d: 'ربط السعر بسلوك حركي يخلق قيمة عاطفية مضاعفة ويتصدّر التغطية الإخبارية بتكلفة عينات محدودة.',
                n: 'الدليل الرقمي (موسكو، 2013): ماكينة مترو منحت تذكرة (30 روبل) مقابل 30 تمرين قرفصاء خلال دقيقتين لأولمبياد سوتشي؛ شارك 10,000+ راكب بأسبوع وحصدت تغطية إعلامية تتخطى 4 ملايين دولار EMV.',
              },
              {
                cls: cardInd,
                pill: pillInd,
                k: '03 · Place (المكان وتحويل المسار لنقطة بيع)',
                t: 'البيع في أماكن الانتظار اليومية لا داخل المتجر',
                d: 'نقل رفوف المتجر لصور محطات القطار وحرم الجامعات وربط كل سلعة بكود QR للشراء الفوري أثناء الانتظار.',
                n: 'الدليل الرقمي (سيول، 2011): متجر Tesco Homeplus الافتراضي على جدران المترو أدى إلى زيادة 10,287 مستخدماً جديداً، +76% تسجيل بالتطبيق، وزيادة المبيعات أونلاين بنسبة +130% ليصبح الأعلى مبيعاً.',
              },
              {
                cls: cardAmb,
                pill: pillAmb,
                k: '04 · Promotion (الترويج عبر الإعلام المكتسب)',
                t: 'تحويل كل جنيه إنتاج إلى تغطية مجانية متضاعفة',
                d: 'الاعتماد على العلاقات العامة الفيروسية والقيمة المالية للإعلام المكتسب (EMV — Earned Media Value) بدلاً من حرق الميزانية في شراء الإعلانات.',
                n: 'المعيار الرقمي الموثق: حملات الغوريلا المتقنة تولّد من 10 إلى 30 ضعف تكلفتها من النشر الصحفي ومحتوى UGC وتقلص كلفة الألف ظهور CPM بنسبة 85%.',
              },
              {
                cls: cardEm,
                pill: pillEm,
                k: '05 · People (العنصر البشري وسفراء التجربة)',
                t: 'توظيف الشرارة البشرية لكسر التردد الجمعي',
                d: 'الاستعانة بـ 3–5 سفراء أو ممثلين مدربين يبدؤون التجربة أمام الكاميرا لتحفيز الجمهور الحاضر على الخوض والمسح.',
                n: 'القاعدة السلوكية الرقمية: أظهرت تجارب التسويق الميداني أن نسبة إقبال المارة تقفز من 11% إلى 82% بمجرد مشاهدة 3 أشخاص يتفاعلون بحماس أمامهم.',
              },
              {
                cls: cardRed,
                pill: pillRed,
                k: '06 & 07 · Process & Physical Evidence',
                t: 'هندسة الفاتورة والبطاقة كبوابة رقمية (Phygital)',
                d: 'تحويل الفاتورة الورقية أو حامل الكوب أو بطاقة الغرفة الفندقية لتحفة تفاعلية تحمل شريحة NFC وكود QR لـ WebAR.',
                n: 'الدليل التطبيقي: تضاعف عودة العميل للشراء الثاني (Retention) إلى 34% ويرتفع متوسط الفاتورة (AOV) بنسبة +28% عند مسح كود الطاولة التفاعلي.',
              },
            ].map((p) => (
              <article key={p.k} className={p.cls}>
                <span className={`${p.pill} en`}>{p.k}</span>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                  {p.t}
                </h2>
                <p className={smallTxt}>{p.d}</p>
                <div className={noteBox}>{p.n}</div>
              </article>
            ))}
          </div>
        );

      /* ---------------- SLIDE 09: THE 6 RS SUSTAINABILITY LOOP ---------------- */
      case 9:
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                cls: cardRed,
                pill: pillRed,
                k: '01 · Reach (الوصول الاستراتيجي الموجه)',
                t: '1. الضرب في نقاط الكثافة الديموغرافية الصحيحة',
                d: 'دراسة مسار الجمهور بدقة واختيار نقاط الاختناق البشري للجمهور المستهدف تحديداً (بوابات الجامعات، شارع المشاية السفلية، وميدان أم كلثوم)؛ مما يخفض هدر الوصول من 72% في اللوحات العامة إلى أقل من 8%.',
              },
              {
                cls: cardSky,
                pill: pillSky,
                k: '02 · Relevance (الملاءمة السياقية اللحظية)',
                t: '2. الالتحام بحالة العميل في اللحظة الراهنة',
                d: 'ربط الرسالة بالاحتياج الفوري للمستهلك في تلك اللحظة (عروض الغداء لطلبة الكليات الساعة 2 ظهراً، أو راحة عائلات المراكز الطبية بالفنادق) مما يرفع نسبة النقر والتفاعل من 1.5% إلى 18%–24%.',
              },
              {
                cls: cardInd,
                pill: pillInd,
                k: '03 · Resonance (الصدى العاطفي والترميز)',
                t: '3. صناعة انفعال إنساني يحفر العلامة بالذاكرة',
                d: 'الهدف ليس جذب العين لثانية؛ بل تحفيز الدهشة والابتسامة التي تجعل الدماغ يخزّن شعار المنتج بمعدل أعمق بـ 6 أضعاف وتمنع طمسه بظاهرة Vampire Effect.',
              },
              {
                cls: cardAmb,
                pill: pillAmb,
                k: '04 · Reaction (رد الفعل القابل للقياس CTA)',
                t: '4. الجسر الحرج نحو الفعل التجاري الفوري',
                d: 'الفارق الفاصل بين «مزحة تُنسى» و«حملة رابحة»: تضمين دعوة واضحة للفعل (CTA — Call To Action) بكود QR أو شريحة NFC تمنح خصم 15% أو عرض WebAR؛ وهو ما يحقق نسبة تحويل 35%–40% من الماسحين.',
              },
              {
                cls: cardEm,
                pill: pillEm,
                k: '05 · Relationship (العلاقة والاحتفاظ LTV)',
                t: '5. تحويل المندهش العابر إلى قاعدة بيانات دائمة',
                d: 'تسجيل رقم العميل على قناة WhatsApp CRM وإضافته لجمهور Pixel إعادة الاستهداف، مما يحقق معدل فتح 82% ونسبة عودة للشراء المتكرر 34% خلال 30 يوماً ويعظم القيمة الدائمة LTV ≥ 3× CAC.',
              },
            ].map((r) => (
              <article key={r.k} className={r.cls}>
                <span className={`${r.pill} en`}>{r.k}</span>
                <h2 className="mt-2 font-display text-[15px] font-black text-slate-950 dark:text-white">{r.t}</h2>
                <p className={smallTxt}>{r.d}</p>
              </article>
            ))}

            <article className={cardRed}>
              <EditorialVisual imageNum={9} compact alt="تفاعل الجمهور مع كشك QR ذكي" />
              <div className="mt-2.5">
                <span className={`${pillRed} en`}>06 · Referral (الإحالة بالعمولة Affiliate)</span>
              </div>
              <h2 className="mt-1 font-display text-[15px] font-black text-slate-950 dark:text-white">
                6. تحويل المندهش إلى مسوّق شريك بالعمولة
              </h2>
              <p className={smallTxt}>
                أرقى حلقة في الاستدامة: منح كل عميل أو طالب منبهر كود{' '}
                <strong>استجابة سريعاً (<span className="en">QR</span>)</strong> ورابط تتبع خاص (<span className="en">UTM</span>)
                ليحصل على <strong>عمولة 15% (<span className="en">CPS</span>)</strong> أو <strong>40 ج.م (<span className="en">CPL</span>)</strong>{' '}
                ويصل معامل الانتشار <span className="en">K-Factor ≥ 1.3</span> بعائد <span className="en">1:18</span>.
              </p>
            </article>
          </div>
        );

      /* ---------------- SLIDE 10: FIELD GUERRILLA TYPES ---------------- */
      case 10:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {[
              {
                cls: cardRed,
                pill: pillRed,
                img: 10,
                k: '01 · التسويق المحيطي (Ambient Marketing)',
                t: 'مقاعد شوكولاتة KitKat — توظيف الأثاث القائم',
                loc: 'حدائق أمستردام وأوتريخت (هولندا) ومانشستر (بريطانيا) — صيف 2012',
                res: 'استغلال مقاعد الحدائق العامة وطلاء الخشب بلون ألواح KitKat وغلاف أحمر وفضي بشعار Have a Break بتكلفة طلاء وتركيب تقل عن 15,000€. النتائج الرقمية: انتشرت الصور عفوياً في 30+ دولة، حققت +2.8 مليون يورو قيمة إعلام مكتسب (EMV)، ورفعت المبيعات المحلية +14% وزيادة الوعي لدى الشباب لـ 68%.',
              },
              {
                cls: cardSky,
                pill: pillSky,
                img: 11,
                k: '02 · تسويق الشارع (Street Marketing)',
                t: 'شفرة حلاقة Gillette — المجسمات الميدانية العملاقة',
                loc: 'حديقة فونديلبارك وميادين أمستردام (هولندا) — مايو 2007',
                res: 'وضع مجسم ماكينة حلاقة بطول 4 أمتار وسط الميدان مع قص شريط العشب خلفها بدقة متناهية لخلق صدمة بصرية فورية بتكلفة إنتاج تقارب 22,000€. النتائج الرقمية: تغطية صحفية في 45 وسيلة إعلام أوروبية، التقط الجمهور 18,000+ صورة عفوية UGC، وعززت جيليت حصتها السوقية في هولندا إلى 74%.',
              },
              {
                cls: cardEm,
                pill: pillEm,
                img: 12,
                k: '03 · التسويق التجريبي (Experiential Marketing)',
                t: 'آلة سعادة Coca-Cola — الانغماس الحسي المباشر',
                loc: "حرم جامعة سانت جونز (St. John's University)، نيويورك — يناير 2010",
                res: 'إدهاش الطلاب بآلة تخرج بجانب المشروب بيتزا ساخنة وزهوراً وساندويتش 6 أقدام بـ 5 كاميرات خفية بميزانية تنفيذ شاملة 30,000$ فقط. النتائج الرقمية: 4.5 مليون مشاهدة على يوتيوب في الأسبوع الأول (تجاوزت 11 مليون لاحقاً)، قيمة EMV تفوق 2.5 مليون دولار (ROI > 8,200%)، وارتفاع المبيعات بالجامعات 11%.',
              },
            ].map((item) => (
              <article key={item.k} className={item.cls}>
                <EditorialVisual imageNum={item.img} compact alt={item.t} />
                <div className="mt-2.5">
                  <span className={item.pill}>{item.k}</span>
                </div>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                  {item.t}
                </h2>
                <div className={noteBox}>
                  <strong>المكان والتاريخ:</strong> {item.loc}
                  <br />
                  <strong className="mt-1.5 inline-block">التنفيذ والأرقام الموثقة:</strong> {item.res}
                </div>
              </article>
            ))}
          </div>
        );

      /* ---------------- SLIDE 11: SMART, STEALTH, VIRAL & ALT TYPES ---------------- */
      case 11:
        return (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  cls: cardRed,
                  pill: pillRed,
                  img: 13,
                  k: '04 · تسويق الكمائن (Ambush Marketing)',
                  t: 'كمين Nike بأولمبياد أتلانتا 1996',
                  res: 'خطف الأضواء من الراعي الرسمي دون سداد رسوم الرعاية (Cornwell & Maignan, 1998). دفعت Reebok مبلغ 50 مليون دولار كراعٍ رسمي، بينما بنت Nike مركزاً ضخماً بجوار القرية الأولمبية ووزعت 300,000 علم مجاني وحذاء ذهبياً لـ Michael Johnson. النتائج الرقمية: 70% من المشاهدين ظنوا أن نايكي هي الراعي الرسمي، وقفزت إيراداتها السنوية بنسبة +36% لتصل إلى 6.47 مليار دولار!',
                },
                {
                  cls: cardInd,
                  pill: pillInd,
                  img: 14,
                  k: '05 · التسويق الخفي (Stealth Marketing)',
                  t: 'سياح Sony Ericsson (صيف 2002)',
                  res: 'إدماج المنتج في مواقف حياتية قبل كشف الصفة الإعلانية: انتشر 60 ممثلاً في 10 مدن أمريكية كبرى يتظاهرون كسياح ويطلبون من المارة تصويرهم بهاتف Sony Ericsson T68i المزود بكاميرا ملحقة مبتكرة في تفاعلات يومية بميزانية تقل 85% عن الحملة التلفزيونية الموازية. النتائج الرقمية: تصدّر الهاتف مبيعات فئته بالربع الثالث 2002 وحقق تفاعلاً مباشراً مع 250,000+ شخص.',
                },
                {
                  cls: cardEm,
                  pill: pillEm,
                  img: 15,
                  k: '06 · التسويق الفيروسي (Viral Marketing)',
                  t: 'سلسلة Will It Blend — Blendtec (2006)',
                  res: 'عرض عملي مدهش لقوة الخلاط أمام الكاميرا بتكلفة لا تُصدق: أنفق المؤسس توم ديكسون 50 دولاراً فقط لشراء كرات جولف وماربلز ثم هاتف iPhone لطحنها داخل الخلاط في مصنعه بولاية يوتا (أكتوبر 2006). النتائج الرقمية: حصدت السلسلة 280+ مليون مشاهدة على يوتيوب، 390,000+ مشترك عضوي، وقفزت المبيعات التجارية 700% خلال عام واحد!',
                },
              ].map((item) => (
                <article key={item.k} className={item.cls}>
                  <EditorialVisual imageNum={item.img} compact alt={item.t} />
                  <div className="mt-2.5">
                    <span className={item.pill}>{item.k}</span>
                  </div>
                  <h2 className="mt-1 font-display text-[15px] font-black text-slate-950 dark:text-white">
                    {item.t}
                  </h2>
                  <p className={smallTxt}>{item.res}</p>
                </article>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={cardSky}>
                <span className={pillSky}>07 · Reverse Graffiti (الجرافيتي العكسي النظيف)</span>
                <p className={smallTxt}>
                  تنظيف الأرصفة بماء مضغوط (2,500 PSI) وقوالب مفرغة لإبراز الشعار نظيفاً بدون دهان؛ كلف Domino&apos;s نحو{' '}
                  <strong>12% فقط</strong> من تكلفة لوحات الطرق وحصد <strong>1.2 مليون مشاهدة</strong> وصفر غرامات.
                </p>
              </div>
              <div className={cardAmb}>
                <span className={pillAmb}>08 · Guerrilla Projections (الإسقاط الضوئي الليلي)</span>
                <p className={smallTxt}>
                  إسقاط إعلانات بروجيكتور عملاقة (<strong>20,000 Lumens</strong>) ليلاً على الواجهات لمدة 3 ساعات بتكلفة{' '}
                  <strong>800–1,500$</strong> لليلة؛ تجذب <strong>25,000–60,000 مارّ ومشاهد فيديو</strong> دون ترك أثر مادي.
                </p>
              </div>
              <div className={cardRed}>
                <span className={pillRed}>09 · تحذير بحثي: Astroturfing (التأييد المصطنع)</span>
                <p className={smallTxt}>
                  تزييف تقييمات أو حسابات وهمية كأنها رأي شعبي عفوي؛ يؤدي انكشافه إلى انهيار ثقة المستهلكين بنسبة{' '}
                  <strong>-62%</strong> وملاحقات هيئة <span className="en">FTC</span> بغرامات تصل إلى{' '}
                  <strong>51,744$</strong> للمخالفة الواحدة.
                </p>
              </div>
            </div>
          </div>
        );

      /* ---------------- SLIDE 12: ALL 4 GLOBAL CASE STUDIES FULLY VISIBLE ---------------- */
      case 12:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {[
              {
                cls: cardRed,
                pill: pillRed,
                img: 16,
                badge: 'يوليو 2007 · الولايات المتحدة وكندا',
                t: '1. متاجر Kwik-E-Mart لفيلم The Simpsons',
                loc: '12 فرعاً من سلسلة 7-Eleven في مدن أمريكية وكندية كبرى (لوس أنجلوس، نيويورك، شيكاغو، سياتل)',
                exec: 'تحويل متاجر بقالة حقيقية بالكامل خارجياً وداخلياً إلى المتجر الكرتوني الشهير وبيع منتجات المسلسل فعلياً مثل مشروبات Buzz Cola وSquishee وKrustyO’s بتكلفة إجمالية ≈ 1 مليون دولار متكاملة.',
                res: '+30% ارتفاع مباشر في مبيعات الفروع الـ 12 خلال شهر، مع 10+ مليون دولار قيمة إعلام مكتسب (EMV)، وطوابير يومية حققت افتتاحية شباك تذاكر عالمية للفيلم بقيمة 74 مليون دولار أمريكي في أول عطلة!',
              },
              {
                cls: cardSky,
                pill: pillSky,
                img: 17,
                badge: '15 يناير 2009 · لندن، بريطانيا',
                t: '2. تجمع T-Mobile المفاجئ (Flash Mob)',
                loc: 'محطة قطارات ليفربول ستريت (Liverpool Street Station)، وسط لندن — الساعة 11:00 صباحاً',
                exec: 'توزيع 350 راقصاً محترفاً بملابس مسافرين عاديين وسط المحطة خلال ذروة الصباح، ثم انطلاق رقصة جماعية مفاجئة صُوّرت بـ 10 كاميرات خفية وبُثت في إعلان 3 دقائق بشعار Life’s for Sharing.',
                res: '42+ مليون مشاهدة على يوتيوب، 200+ تغطية إخبارية دولية، ارتفاع مبيعات هواتف وخطوط T-Mobile بنسبة +52% في الربع التالي، وخفض تكلفة الاستحواذ CAC بنسبة 64% مع جائزة أفضل إعلان بريطاني 2009.',
              },
              {
                cls: cardAmb,
                pill: pillAmb,
                img: 18,
                badge: 'صيف 2010 · زيورخ، سويسرا',
                t: '3. ممر مشاة McDonald’s (البطاطس الذهبية)',
                loc: 'أمام بوابات الحفلات والمهرجانات الصيفية والممرات المزدحمة في مدينة زيورخ، سويسرا',
                exec: 'توظيف خطوط المشاة البيضاء القائمة بالأسفلت وإضافة عبوة ماكدونالدز الحمراء العملاقة عند بدايتها لتبدو الخطوط كأصابع بطاطس ذهبية مقرمشة تقود المشاة تلقائياً لباب الفرع بتكلفة طلاء تقل عن 4,500 فرنك.',
                res: 'توجيه تدفق عشرات الآلاف من الحشود مباشرة من بوابة الفعالية للفرع المحيط وتحقيق قفزة فورية بنسبة +38% في حجم المبيعات خلال 3 أيام فقط بتكلفة استحواذ تقل عن 0.25 فرنك للعميل!',
              },
              {
                cls: cardInd,
                pill: pillInd,
                img: 19,
                badge: 'مارس 2014 · باريس، فرنسا',
                t: '4. شقة IKEA الحية داخل محطة مترو أوبير',
                loc: 'محطة مترو Auber المركزية (أكثر محطات باريس ازدحاماً) لمدة 6 أيام متواصلة',
                exec: 'بناء شقة زجاجية مفروشة بالكامل بمساحة 54 متراً مربعاً داخل بهو المترو عاش فيها 5 متطوعين أمام المسافرين لاستعراض ذكاء تخزين أثاث إيكيا بميزانية تنفيذ 180,000 يورو.',
                res: '180,000 زائر وتجربة مباشرة (بتكلفة 1€ فقط لكل زائر)، +35,000 صورة UGC على إنستغرام وتويتر، زيادة +22% في زيارات معارض إيكيا بفرنسا، وقيمة إعلام مكتسب (EMV) تجاوزت 3.5 مليون يورو (ROI 1,844%)!',
              },
            ].map((c) => (
              <article key={c.t} className={c.cls}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <EditorialVisual imageNum={c.img} compact alt={c.t} />
                  </div>
                  <div className="sm:col-span-7">
                    <span className={c.pill}>{c.badge}</span>
                    <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                      {c.t}
                    </h2>
                    <p className={smallTxt}>
                      <strong>المكان والتوقيت:</strong> {c.loc}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 space-y-1.5 rounded-xl bg-slate-100/90 p-3 text-[13px] font-bold leading-relaxed text-slate-900 dark:bg-slate-900/75 dark:text-slate-100">
                  <div><strong className="text-slate-950 dark:text-white">آلية التنفيذ الميداني:</strong> {c.exec}</div>
                  <div><strong className="text-emerald-800 dark:text-emerald-300">النتائج والأرقام المالية:</strong> {c.res}</div>
                </div>
              </article>
            ))}
          </div>
        );

      /* ---------------- SLIDE 13: DEEP INTEGRATION WITH AFFILIATE MARKETING ---------------- */
      case 13:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            <article className={`${cardRed} sm:col-span-4`}>
              <EditorialVisual imageNum={23} compact alt="ربط التسويق الغوريلا بالتسويق بالعمولة" />
              <div className="mt-2.5">
                <span className={pillRed}>01 · لماذا وكيف نربط الغوريلا بالعمولة؟</span>
              </div>
              <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                إغلاق فجوة القياس وتحويل الضجة لمبيعات مضمونة
              </h2>
              <p className={smallTxt}>
                يعاني التسويق الغوريلا التقليدي من فجوة رئيسية هي{' '}
                <strong>صعوبة إسناد المبيعات (<span className="en">Attribution Gap</span>)</strong>؛ بينما يفتقر{' '}
                <strong>التسويق بالعمولة (<span className="en">Affiliate Marketing</span>)</strong> الرقمي أحياناً إلى الزخم البصري المثير.
                عند دمجهما: يصنع الغوريلا «الدهشة المجانية» في الشارع أو عبر فيديو <span className="en">FOOH</span>، ويتولى التسويق بالعمولة
                تحويل هذه الدهشة إلى قناة بيع منظمة <strong>لا يدفع فيها التاجر جنيهاً واحداً إلا عند إتمام البيع أو الحجز!</strong>
              </p>
              <div className={noteBox}>
                <strong>شرح الاختصارات الحاكمة:</strong> <span className="en">UTM (Urchin Tracking Module)</span> لتتبع المصدر،{' '}
                <span className="en">CPS (Cost Per Sale)</span> للدفع عند البيع 15%، و<span className="en">CPL (Cost Per Lead)</span> للدفع عند الحجز 40 ج.م.
              </div>
            </article>

            <div className="flex flex-col gap-3 sm:col-span-8">
              <article className={cardSky}>
                <span className={pillSky}>02 · خطوات التنفيذ التطبيقي المتكامل (Step-by-Step Affiliate × Guerrilla)</span>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50/95 p-3 text-[13px] font-bold leading-relaxed text-slate-900 dark:bg-slate-900/75 dark:text-slate-100">
                    <strong className="text-red-700 dark:text-red-400">الخطوة 1 · هندسة رابط التتبع الفريد (<span className="en">UTM</span>):</strong><br />
                    توليد رابط مخصص لكل مسوّق يحتوي على <span className="en">?aff_id=STUDENT_05</span> وتحويله لرمز{' '}
                    <strong><span className="en">QR — Quick Response</span></strong> فريد (من الشريحة 19 مباشرة) بمعدل تتبع 100%.
                  </div>
                  <div className="rounded-xl bg-slate-50/95 p-3 text-[13px] font-bold leading-relaxed text-slate-900 dark:bg-slate-900/75 dark:text-slate-100">
                    <strong className="text-sky-700 dark:text-sky-300">الخطوة 2 · التموضع الغوريلا للـ <span className="en">QR</span>:</strong><br />
                    عدم توزيع فلاير ورقي يُلقى في الشارع (معدل قراءة 2%)؛ بل طبع الكود على بطاقة خداع بصري فاخرة (<span className="en">Phygital VIP Card</span>) تفتح منيو <strong><span className="en">WebAR</span></strong> بنسبة مسح 38%.
                  </div>
                  <div className="rounded-xl bg-slate-50/95 p-3 text-[13px] font-bold leading-relaxed text-slate-900 dark:bg-slate-900/75 dark:text-slate-100">
                    <strong className="text-indigo-700 dark:text-indigo-300">الخطوة 3 · اختيار نموذج المحاسبة العادل:</strong><br />
                    تطبيق نظام <strong><span className="en">CPS 15%</span></strong> للمطاعم (28.5 ج.م من فاتورة 190 ج.م)،
                    أو نظام <strong><span className="en">CPL 40 ج.م</span></strong> للفنادق (مقابل حجز ليلة بقيمة 2,500 ج.م).
                  </div>
                  <div className="rounded-xl bg-slate-50/95 p-3 text-[13px] font-bold leading-relaxed text-slate-900 dark:bg-slate-900/75 dark:text-slate-100">
                    <strong className="text-emerald-700 dark:text-emerald-300">الخطوة 4 · التحفيز الثنائي ومدة التتبع:</strong><br />
                    منح الزبون خصماً فورياً <strong>10%–15%</strong> عند استخدام كود المسوّق لمنع التجاوز، مع تفعيل نافذة ملف ارتباط (<span className="en">Cookie Window</span>) مدتها <strong>30 يوماً</strong>.
                  </div>
                </div>
              </article>

              <article className={cardEm}>
                <span className={pillEm}>03 · النتائج والأرقام الموثقة لـ «جيش السفراء بالعمولة» (تطبيق المنصورة)</span>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50/95 p-3 text-center dark:bg-emerald-950/35">
                    <div className="en tabular-nums text-lg font-black text-emerald-700 dark:text-emerald-300">30 شريكاً</div>
                    <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      من طلاب الجامعة، سائقي الدليفري، والميكرو إنفلونسرز بصفر رواتب ثابتة
                    </div>
                  </div>
                  <div className="rounded-xl bg-red-50/95 p-3 text-center dark:bg-red-950/35">
                    <div className="en tabular-nums text-lg font-black text-red-700 dark:text-red-300">1 : 18 ROI</div>
                    <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      كل جنيه عمولة يولّد 18 جنيهاً مبيعات موثقة (<span className="en">Return On Investment</span>)
                    </div>
                  </div>
                  <div className="rounded-xl bg-sky-50/95 p-3 text-center dark:bg-sky-950/35">
                    <div className="en tabular-nums text-lg font-black text-sky-700 dark:text-sky-300">-72% CAC</div>
                    <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      انخفاض تكلفة اكتساب العميل إلى ~19 ج.م فقط مقارنة بالإعلانات الممولة
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        );

      /* ---------------- SLIDE 14: DEEP EXPLANATION OF UGC + DIGITAL, SOCIAL & LOCAL SEO ---------------- */
      case 14:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            {/* Highlighted UGC Deep Dive Column with Real Crowd Documentary Photo (img 28) */}
            <article className={`${cardAmb} flex flex-col justify-between sm:col-span-5`}>
              <div>
                <EditorialVisual imageNum={28} compact alt="جمهور يصور حملة غوريلا بالهواتف لصناعة UGC" />
                <div className="mt-2.5">
                  <span className={pillAmb}>ما هو تسويق (<span className="en">UGC</span>)؟ الشرح الكامل والربط بالغوريلا</span>
                </div>
                <h2 className="mt-1.5 font-display text-base font-black text-slate-950 dark:text-white">
                  <span className="en">UGC — User-Generated Content</span> (المحتوى الذي ينشئه الجمهور)
                </h2>
                <p className={smallTxt}>
                  <strong>التعريف والاختصار الكامل:</strong> <span className="en">UGC</span> هو اختصار{' '}
                  <strong className="en">User-Generated Content</strong> أي «المحتوى من صنع المستخدمين والجمهور»؛ وهو كل فيديو ريلز
                  أو صورة أو تقييم ينشره العميل العادي بهاتفه عفوياً على تيك توك وإنستغرام دون مقابل نقدي.
                </p>
                <div className={noteBox}>
                  <strong>كيف نسوق به عبر الغوريلا (التطبيق العلمي):</strong> بدلاً من استئجار استوديو أو التوسل للناس بالتصوير،
                  نصمم في الشارع أو الطاولة <strong>«مشهداً يستحيل تجاهل تصويره» (<span className="en">Camera-First Hook</span>)</strong>
                  — مثل مجسم 3D، أو تجربة <span className="en">WebAR</span>، أو صندوق مفاجأة — ونضع بجانبه وسم الحملة وكود{' '}
                  <span className="en">QR</span> للمكافأة؛ فيصبح كل زبون مصوّراً ومذيعاً مجانياً لعلامتك.
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-amber-50/95 p-2 dark:bg-amber-950/35">
                  <div className="en tabular-nums text-base font-black text-amber-800 dark:text-amber-300">12× EMV</div>
                  <div className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">قيمة إعلام مجاني</div>
                </div>
                <div className="rounded-xl bg-emerald-50/95 p-2 dark:bg-emerald-950/35">
                  <div className="en tabular-nums text-base font-black text-emerald-800 dark:text-emerald-300">+79%</div>
                  <div className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">تأثير وثقة بالشراء</div>
                </div>
                <div className="rounded-xl bg-red-50/95 p-2 dark:bg-red-950/35">
                  <div className="en tabular-nums text-base font-black text-red-700 dark:text-red-300">-68%</div>
                  <div className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">خفض كلفة المحتوى</div>
                </div>
              </div>
            </article>

            {/* Right 3 Channel Integrations */}
            <div className="flex flex-col justify-between gap-2.5 sm:col-span-7">
              {[
                {
                  cls: cardSky,
                  pill: pillSky,
                  k: '01 · التسويق الرقمي والأداء (Performance Marketing & O2O — Offline-to-Online)',
                  link: 'استثمار التفاعل الميداني بالشارع لتغذية خوارزميات ميتا (Meta) وتيك توك (TikTok) بجمهور دافئ عبر ربط الواقع بالإنترنت (O2O).',
                  exec: '(1) رسم نطاق تسييج جغرافي (Geofencing) بقطر 1 كم، (2) زرع رمز Pixel في صفحة هبوط QR، (3) إعادة استهداف الماسحين خلال 24 ساعة.',
                  res: 'خفض تكلفة النقرة (CPC — Cost Per Click) بنسبة -65%، ومضاعفة العائد على الإنفاق الإعلاني (ROAS) إلى 4.2× مقابل 1.4× للإعلان البارد.',
                },
                {
                  cls: cardRed,
                  pill: pillRed,
                  k: '02 · السوشيال ميديا والانتشار الفيروسي (Social Media & Viral Loop)',
                  link: 'توظيف الصدمة البصرية للغوريلا وفيديو FOOH في أول 3 ثوانٍ (Hook Rate) لاختراق خوارزميات الفيديو القصير.',
                  exec: '(1) تحدي هاشتاج مرتبط بهدية فورية، (2) تصوير ردود أفعال الجمهور المندهش، (3) إعادة نشر أفضل فيديوهات UGC مع إشارة لحساب المشارك.',
                  res: 'ارتفاع معدل الخطاف في أول 3 ثوانٍ (3s Hook Rate) لـ 54%، ومعامل الانتشار الفيروسي K-Factor ≥ 1.3، ونمو الحسابات +240% عضوياً.',
                },
                {
                  cls: cardEm,
                  pill: pillEm,
                  k: '03 · تحسين محركات البحث المحلية (Local SEO & Google Maps Pack)',
                  link: 'ترجمة الزحام الناتج عن حملة الشارع إلى إشارات جغرافية ومراجعات موثقة تصعّد نشاطك لأعلى خرائط جوجل مجاناً.',
                  exec: '(1) وضع بطاقة تقييم فورية بتقنية NFC + QR عند الكاشير أو الطاولة، (2) منح مشروب ترحيبي مقابل صورة لتجربة WebAR وتقييم صادق 5★.',
                  res: 'تصدر المراكز الثلاثة الأولى في نتائج خرائط جوجل (Local Pack Top 3) خلال 21 يوماً وزيادة نقرات طلب الاتجاهات والمكالمات بنسبة +140%.',
                },
              ].map((item) => (
                <article key={item.k} className={item.cls}>
                  <span className={item.pill}>{item.k}</span>
                  <div className="mt-1.5 space-y-1 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                    <div><strong className="text-red-700 dark:text-red-400">الربط: </strong>{item.link}</div>
                    <div><strong className="text-sky-800 dark:text-sky-300">التنفيذ: </strong>{item.exec}</div>
                    <div className="rounded-lg bg-emerald-50/95 px-2.5 py-1.5 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100">
                      <strong className="text-emerald-800 dark:text-emerald-300">الأدلة الرقمية: </strong>{item.res}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );

      /* ---------------- SLIDE 15: INTEGRATING PR, EVENTS, CRM/WHATSAPP & B2B ABM ---------------- */
      case 15:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {[
              {
                cls: cardInd,
                pill: pillInd,
                k: '04 · العلاقات العامة واقتناص الأخبار (PR — Public Relations & Newsjacking)',
                link: 'تحويل ضربة الغوريلا الجريئة إلى مادة خبرية مثيرة تتبناها الصحف والمنصات الإخبارية كـ «ظاهرة طريفة» لا كإعلان مدفوع، مع اختصار PR أي Public Relations.',
                exec: '(1) ربط الحيلة بتريند الساعة أو موسم حرج خلال 24 ساعة (Newsjacking)، (2) إرسال ملف صحفي رقمي (Press Kit) بصور عالية الدقة وإحصائات جاهزة للمحررين وصفحات المدن الكبرى.',
                res: 'تغطية صحفية مجانية في 15–40 وسيلة ومنصة رقمية، تحقيق EMV يتخطى 10× الكلفة، وارتفاع البحث المباشر عن اسم العلامة التجارية (+190% Branded Search).',
              },
              {
                cls: cardSky,
                pill: pillSky,
                k: '05 · تسويق الفعاليات والمعارض (Event & Experiential Marketing)',
                link: 'كسر الجمود في المعارض التجارية والمؤتمرات والجامعات بتحويل جناح العرض الصامت إلى محطة تفاعل حسي (VR أو تحدي 30 ثانية) تسرق 100% من أنظار الزوار.',
                exec: '(1) تركيب شاشة MR أو مجسم تفاعلي عند مدخل القاعة، (2) ربط اللعب بمسح كود QR يسجل الاسم والهاتف تلقائياً، (3) عرض لوحة متصدرين حية (Live Leaderboard) لجذب التنافس.',
                res: 'جمع 5 أضعاف عدد العملاء المحتملين (5× Qualified Leads) مقارنة بالأجنحة التقليدية بنفس كلفة الإيجار، وارتفاع نسبة تذكر العلامة بعد المعرض إلى 84%.',
              },
              {
                cls: cardEm,
                pill: pillEm,
                k: '06 · إدارة علاقات العملاء والواتساب (CRM — Customer Relationship Management)',
                link: 'إغلاق ثغرة «ضياع العميل بعد انقضاء ضجة الشارع» عبر توجيه كل من يمسح الـ QR أو NFC تلقائياً إلى تدفق ترحيبي مؤتمت (WhatsApp Flow + CRM) يصنف اهتماماته.',
                exec: '(1) عند مسح QR بالشارع يصل للعميل فوراً كوبون الخصم على WhatsApp، (2) وسم العميل تلقائياً بالحي أو الكلية، (3) إطلاق رسالة تذكير ورفع مبيعات (Upsell) في اليوم 3 و14.',
                res: 'معدل فتح رسائل واتساب يصل إلى 82% (مقابل 18% فقط للبريد الإلكتروني)، ومعدل عودة للشراء المتكرر (Retention Rate) يتجاوز 34% خلال الشهر الأول.',
              },
              {
                cls: cardRed,
                pill: pillRed,
                k: '07 · تسويق الشركات للشركات (B2B ABM — Account-Based Marketing)',
                link: 'اختصار B2B (Business-to-Business) وABM (التسويق المرتكز على الحسابات الكبرى): استبدال الإيميلات الباردة بطرود غوريلا فاخرة تُسلّم يداً بيد لصناع القرار.',
                exec: '(1) اختيار 20 فندقاً أو عيادة أو شركة مستهدفة، (2) إرسال صندوق أنيق يحمل اسم المدير + فكرة غوريلا ملموسة + كود QR/NFC يفتح نموذج WebAR مصمماً لشركته تحديداً، (3) متابعة هاتفية فور رصد إشعار المسح.',
                res: 'ارتفاع معدل الاستجابة وحجز اجتماعات العقود الكبرى إلى 68% (مقابل أقل من 2% في رسائل البريد البارد)، وتحقيق عائد استثمار يتخطى 1,400% للصفقات المبرمة.',
              },
            ].map((item) => (
              <article key={item.k} className={item.cls}>
                <span className={item.pill}>{item.k}</span>
                <div className="mt-2 space-y-1.5 text-[13.5px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <div><strong className="text-red-700 dark:text-red-400">كيف نربطه؟ </strong>{item.link}</div>
                  <div><strong className="text-sky-800 dark:text-sky-300">التنفيذ العملي: </strong>{item.exec}</div>
                  <div className="rounded-xl bg-emerald-50/95 p-2.5 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100">
                    <strong className="text-emerald-800 dark:text-emerald-300">النتائج والأرقام الموثقة: </strong>{item.res}
                  </div>
                </div>
              </article>
            ))}
          </div>
        );

      /* ---------------- SLIDE 16: INTERACTIVE STRATEGIC MIND MAP ---------------- */
      case 16:
        return <GuerrillaMindMap />;

      /* ---------------- SLIDE 17: REAL AR (26), REAL VR (27), AND FOOH (20) ---------------- */
      case 17:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <article className={cardRed}>
              <EditorialVisual imageNum={26} compact alt="تجربة واقع معزز حقيقية لوجبة 3D فوق طاولة مقهى" />
              <div className="mt-2.5">
                <span className={pillRed}>01 · الواقع المعزز (<span className="en">AR / WebAR — Augmented Reality</span>)</span>
              </div>
              <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                إسقاط المنتج 3D فوق طاولة الزبون عبر المتصفح
              </h2>
              <p className={smallTxt}>
                <strong>التقنية:</strong> إضافة مجسم ثلاثي الأبعاد حي فوق البيئة الحقيقية بالكاميرا. عبر{' '}
                <strong><span className="en">WebAR</span> (الواقع المعزز على الويب)</strong> لا يحتاج العميل تنزيل تطبيق؛
                فبمجرد مسح كود <span className="en">QR</span> المطبوع على استند الطاولة (كما في الصورة الحقيقية) يظهر الطبق
                بحجمه الواقعي مع الدخان الساخن وزر الطلب المباشر.
              </p>
              <div className={noteBox}>
                <strong>الأرقام الموثقة:</strong> تحميل في <strong>&lt; 2 ثانية</strong>، نسبة تحويل من العرض للطلب تصل إلى{' '}
                <strong>40%</strong>، ورفع متوسط قيمة الفاتورة (<span className="en">AOV</span>) بنسبة{' '}
                <strong>+28%</strong> عبر شهية العرض البصري.
              </div>
            </article>

            <article className={cardSky}>
              <EditorialVisual imageNum={27} compact alt="زوار يجربون الواقع الافتراضي VR داخل كشك تفاعلي بمول" />
              <div className="mt-2.5">
                <span className={pillSky}>02 · الواقع الافتراضي (<span className="en">VR — Virtual Reality</span>)</span>
              </div>
              <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                كشك الغوريلا الغامر 360° في المولات والجامعات
              </h2>
              <p className={smallTxt}>
                <strong>التقنية:</strong> نقل الزائر حسيّاً وبصرياً 360° عبر نظارة{' '}
                <strong className="en">VR Headset (مثل Meta Quest)</strong> لعالم علامتك التجارية — مثل التجول داخل جناح
                فندقي مطل على النيل أو خط إنتاج المصنع — عبر كشك سريع التركيب (<span className="en">Pop-Up Kiosk</span>) في ممرات المولات، فينبهر الحضور ويصورون ردود فعل المجربين!
              </p>
              <div className={noteBoxSky}>
                <strong>الأرقام الموثقة:</strong> مدة بقاء تتجاوز <strong>4.2 دقيقة</strong> للزائر، ارتفاع التفاعل العاطفي بنسبة{' '}
                <strong>+340%</strong>، وزيادة الحجوزات الفورية عبر كود <span className="en">QR</span> المرفق بنسبة <strong>+45%</strong>.
              </div>
            </article>

            <article className={cardEm}>
              <EditorialVisual imageNum={20} compact alt="حملة FOOH في شوارع حقيقية بتقنية CGI" />
              <div className="mt-2.5">
                <span className={pillEm}>03 · الإعلان الخارجي الوهمي (<span className="en">FOOH — Fake Out-Of-Home</span>)</span>
              </div>
              <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                اختطاف الشارع رقمياً بتقنية الجرافيك <span className="en">CGI</span>
              </h2>
              <p className={smallTxt}>
                <strong>التقنية:</strong> دمج مجسمات عملاقة مولدة بالحاسوب (<strong><span className="en">CGI — Computer-Generated Imagery</span></strong>)
                داخل لقطة هاتف حقيقية في شارع شهير لتبدو كحدث مادي خارق. <strong>الدليل الرقمي:</strong> حملة ماسكارا{' '}
                <span className="en">Maybelline</span> فوق مترو وحافلات لندن (يوليو 2023).
              </p>
              <div className={noteBoxEm}>
                <strong>الأرقام الموثقة:</strong> <strong>50+ مليون مشاهدة</strong> في أيام، زيادة مبيعات الخط الترويجي بنسبة{' '}
                <strong>+42%</strong>، تكلفة إنتاج <strong>3,500–4,000 ج.م</strong> محلياً، و<strong>صفر</strong> تصاريح بلدية!
              </div>
            </article>
          </div>
        );

      /* ---------------- SLIDE 18: ALL MODERN TECH METHODS & ABBREVIATIONS ---------------- */
      case 18:
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                cls: cardRed,
                pill: pillRed,
                t: '1. الواقع الافتراضي التفاعلي (VR — Virtual Reality)',
                meaning: 'محاكاة بصرية وسمعية غامرة 360° تعزل المستخدم تماماً عن الشارع عبر نظارات VR المستقلة.',
                exec: 'وضع كشك 2×2 متر بالمول أو الجامعة لتجربة غرفة الفندق أو مشروع عقاري في 3 دقائق، وبث الشاشة خارجياً لجذب طوابير الفضوليين.',
                res: '+340% تفاعل عاطفي، +45% حجوزات فورية عبر QR الخروج، وتذكر 88%.',
              },
              {
                cls: cardSky,
                pill: pillSky,
                t: '2. الواقع المختلط والممتد (MR / XR — Mixed & Extended Reality)',
                meaning: 'دمج العناصر الرقمية ثلاثية الأبعاد مع اليد والأشياء الحقيقية بالبيئة لحظياً (MR)، وتوحيد مسارات AR+VR+MR تحت مظلة XR.',
                exec: 'يتحكم الزائر بيده في تغيير مكونات الوجبة أو ديكور الغرفة في الهواء فوق الطاولة أمام كاميرا العرض التفاعلية فتتحول لصانع ضجة بالمعارض.',
                res: 'توليد 5× عملاء محتملين Leads وتفاعل يتخطى 4 دقائق لكل مشارك.',
              },
              {
                cls: cardInd,
                pill: pillInd,
                t: '3. خوارزمية التتبع المكاني (SLAM — Simultaneous Localization And Mapping)',
                meaning: 'تقنية رؤية حاسوبية بالهاتف ترسم خريطة الغرفة أو الطاولة فورياً لتثبيت مجسم WebAR على السطح الحقيقي دون اهتزاز.',
                exec: 'تفعيل SLAM داخل رابط WebAR بحيث يدور الزبون بالهاتف 360° حول طبق الطعام الوهمي فوق طاولة المطعم وكأنه موضوع فعلياً أمامه.',
                res: 'يدفع 72% من المستخدمين لتصوير شاشة الهاتف ومشاركتها تلقائياً كـ UGC.',
              },
              {
                cls: cardEm,
                pill: pillEm,
                t: '4. شرائح الاتصال قريب المدى (NFC — Near Field Communication)',
                meaning: 'شريحة لا سلكية رخيصة (< 15 ج.م) مدمجة في بطاقة أو ملصق طاولة تفتح الرابط فوراً بلمس الهاتف دون فتح تطبيق الكاميرا.',
                exec: 'وضع ملصقات NFC غوريلا على بوابات الطاولات وعند الكاشير: «المس بهاتفك لكشف الجائزة وتفعيل خصم 15% أو التقييم الفوري على Google Maps».',
                res: 'سرعة استجابة 0.4 ثانية، وتفعيل أعلى 2.3×، وقفزة +140% في تقييمات جوجل.',
              },
              {
                cls: cardAmb,
                pill: pillAmb,
                t: '5. التسييج الجغرافي والربط (Geofencing + O2O Integration)',
                meaning: 'تطويق نطاق جغرافي (500م–1كم) بإحداثيات GPS، وربط الزيارة الواقعية (Offline) بسلة الشراء وإعادة الاستهداف (Online).',
                exec: 'بث إعلان فوري على ميتا (Meta) وتيك توك (TikTok) لطلاب جامعة المنصورة أو رواد المشاية الذين زاروا موقع تنفيذ حملة الشارع خلال آخر 48 ساعة فقط.',
                res: 'خفض تكلفة النقرة CPC بنسبة -65% وتحقيق عائد إنفاق إعلاني ROAS 4.2×.',
              },
              {
                cls: cardRed,
                pill: pillRed,
                t: '6. الذكاء الاصطناعي التوليدي ثلاثي الأبعاد (GenAI 3D & AI Video)',
                meaning: 'توليد مجسمات .GLB ولقطات CGI وخدع بصرية عبر أدوات لومـا (Luma AI) وميشي (Meshy AI) ورانواي (Runway) بتكلفة منخفضة وسرعة فائقة.',
                exec: 'تحويل صورة الطبق لـ 3D خلال 15 دقيقة وتصديره لـ WebAR أو دمجه فوق واجهة الفندق في فيديو FOOH جاهز للنشر خلال 24 ساعة فقط.',
                res: 'تقليص تكلفة الإنتاج من 80,000 ج.م بوكالات تقليدية إلى < 3,500 ج.م بزيادة سرعة 10×.',
              },
            ].map((tech) => (
              <article key={tech.t} className={tech.cls}>
                <span className={tech.pill}>{tech.t}</span>
                <div className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <div><strong className="text-slate-950 dark:text-white">المعنى التقني الكامل: </strong>{tech.meaning}</div>
                  <div><strong className="text-sky-800 dark:text-sky-300">طريقة التنفيذ غوريلا: </strong>{tech.exec}</div>
                  <div className="rounded-lg bg-emerald-50/95 px-2.5 py-1.5 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100">
                    <strong className="text-emerald-800 dark:text-emerald-300">النتيجة الرقمية: </strong>{tech.res}
                  </div>
                </div>
              </article>
            ))}
          </div>
        );

      /* ---------------- SLIDE 19: LIVE WEBAR STUDIO + STEP 1-2-3 EXECUTION GUIDE ---------------- */
      case 19:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            <div className="flex flex-col gap-3 sm:col-span-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <article className={cardRed}>
                  <span className={pillRed}>المسار الأول · صناعة منيو/منتج <span className="en">WebAR</span></span>
                  <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                    الخطوات العملية (1 – 2 – 3) للتنفيذ بنفسك
                  </h2>
                  <ol className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                    <li><strong>1. التصوير وبناء النموذج (<span className="en">3D Scan</span>):</strong> استخدام <span className="en">Polycam</span> أو <span className="en">Luma AI</span> لتصوير الطبق أو الغرفة 360° وتصديره بملف <span className="en">.GLB</span> خفيف (&lt; 4 ميجابايت).</li>
                    <li><strong>2. الاستضافة والتشغيل (<span className="en">Web Hosting</span>):</strong> رفع الملف على <span className="en">MyWebAR</span> أو <span className="en">8th Wall</span> ليعمل مباشرة في كاميرا المتصفح دون تطبيق.</li>
                    <li><strong>3. الربط التجاري والعمولة (<span className="en">Conversion</span>):</strong> إدراج زر «اطلب بخصم 15%» داخل المشهد وطبع كود الـ <span className="en">QR</span> على طاولات المطعم أو بطاقات الغرف.</li>
                  </ol>
                </article>

                <article className={cardSky}>
                  <span className={pillSky}>المسار الثاني · إنتاج فيديو <span className="en">FOOH / CGI</span></span>
                  <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 dark:text-white">
                    صناعة فيديو الشارع الخيالي خلال 24 ساعة
                  </h2>
                  <ol className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                    <li><strong>1. لقطة الشارع الأساسية (<span className="en">Base Plate</span>):</strong> تصوير فيديو رأسي 9:16 لمدة 10 ثوانٍ بشارع المشاية السفلية أو أمام الجامعة.</li>
                    <li><strong>2. التوليد والدمج الحاسوبي (<span className="en">CGI</span>):</strong> تصميم المجسم عبر <span className="en">Meshy AI</span>، وتتبع الكاميرا والظلال عبر <span className="en">Blender / Runway / Kling AI</span>.</li>
                    <li><strong>3. هندسة الصوت والمونتاج:</strong> إضافة مؤثرات صوتية ضخمة وحركة ضبابية (<span className="en">Motion Blur</span>) عبر <span className="en">CapCut</span> لمنح واقعية تخدع العين.</li>
                  </ol>
                </article>
              </div>

              <article className={cardEm}>
                <span className={pillEm}>المسار الثالث · التتبع الرقمي وتفعيل التسييج الجغرافي والعمولة خلال 48 ساعة</span>
                <div className="mt-2 grid grid-cols-1 gap-2.5 text-[13px] font-bold leading-relaxed text-slate-900 sm:grid-cols-3 dark:text-slate-100">
                  <div className="rounded-xl bg-emerald-50/95 p-2.5 dark:bg-emerald-950/35">
                    <strong>1. تتبع <span className="en">UTM</span>:</strong> رابط مستقل لكل شارع ولكل مسوّق يوضح مصدر كل جنيه عائد.
                  </div>
                  <div className="rounded-xl bg-emerald-50/95 p-2.5 dark:bg-emerald-950/35">
                    <strong>2. تسييج <span className="en">Geofencing 1 km</span>:</strong> حملة ميتا (<span className="en">Meta</span>) وتيك توك (<span className="en">TikTok</span>) في قطر 1 كم حول نقطة التنفيذ.
                  </div>
                  <div className="rounded-xl bg-emerald-50/95 p-2.5 dark:bg-emerald-950/35">
                    <strong>3. إعادة الاستهداف والعمولة:</strong> إعلان خصم فوري لكل من مسح الكود واحتساب عمولة الشريك تلقائياً.
                  </div>
                </div>
              </article>

              <div className={noteBox}>
                <strong>الأرقام الاقتصادية للإنتاج الذاتي:</strong> إجمالي التكلفة أقل من <strong>3,500 ج.م</strong> مقارنة بـ{' '}
                <strong>120,000 ج.م</strong> للوحات الطرق الشهرية — وفر نقدي يتخطى <strong>97%</strong>!
              </div>
            </div>

            <div className={`${cardInd} flex flex-col justify-between gap-2 sm:col-span-5`}>
              <WebArStudio />
            </div>
          </div>
        );

      /* ---------------- SLIDE 20: QR COMPREHENSIVE EXPLANATION + LIVE ISO GENERATOR APP ---------------- */
      case 20:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            {/* Column A: Full Academic & Applied Guide to QR in Guerrilla Marketing */}
            <div className="flex flex-col gap-3 sm:col-span-5">
              <article className={cardSky}>
                <span className={pillSky}>ما هو <span className="en">QR Code</span>؟ وكيف نستفيد منه في الغوريلا؟</span>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                  <span className="en">QR — Quick Response Code</span> (النظام العصبي للقياس الفوري)
                </h2>
                <p className={smallTxt}>
                  ابتكرته شركة <span className="en">Denso Wave</span> اليابانية عام <strong>1994</strong>، وهو رمز مصفوفي ثنائي
                  الأبعاد يُقرأ بكاميرا الهاتف العادية خلال <strong>0.6 ثانية</strong> ليحول أي عنصر مادي في الشارع إلى بوابة بيع رقمية.
                </p>
                <div className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <div className="rounded-xl bg-sky-50/95 p-2.5 dark:bg-sky-950/35">
                    <strong className="text-sky-800 dark:text-sky-300">طرق استخدامه في تسويق الغوريلا (5 تطبيقات):</strong><br />
                    1. بطاقات خداع بصري بالجامعات | 2. استندات طاولات لفتح <span className="en">WebAR</span> |
                    3. وسط قوالب الجرافيتي النظيف بالماء | 4. أكواب القهوة الجاهزة | 5. طرود الشركات <span className="en">B2B</span>.
                  </div>
                  <div className="rounded-xl bg-emerald-50/95 p-2.5 dark:bg-emerald-950/35">
                    <strong className="text-emerald-800 dark:text-emerald-300">ماذا سنستفيد بالأرقام؟ (5 فوائد حاسمة):</strong><br />
                    • <strong>إغلاق فجوة القياس 100%:</strong> معرفة أي شارع وشريك جلب المبيعة عبر{' '}
                    <span className="en">UTM</span>.<br />
                    • <strong>الربح بالعمولة <span className="en">CPS/CPL</span>:</strong> تسجيل طلبات السفراء آلياً بدون أي تلاعب.<br />
                    • <strong>تعديل العرض فورياً (<span className="en">Dynamic QR</span>):</strong> تغيير الرابط من خصم غداء لخصم سهرة دون إعادة طباعة.<br />
                    • <strong>أتمتة الواتساب والبيكسل:</strong> نقل الماسح لقاعدة بيانات CRM بمعدل فتح <strong>82%</strong>.<br />
                    • <strong>معدل تحويل مرتفع:</strong> يصل إلى <strong>35%–40%</strong> عندما يفتح الكود تجربة بصرية مدهشة.
                  </div>
                </div>
              </article>
            </div>

            {/* Column B: Live Interactive Affiliate QR Code Application */}
            <div className={`${cardRed} sm:col-span-4`}>
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-display text-sm font-black text-slate-950 dark:border-slate-800 dark:text-white">
                <QrCode className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                <span>البرنامج الحي لتوليد <span className="en">QR</span> العمولة (<span className="en">ISO 18004</span>)</span>
              </div>

              <div className="mt-2.5 space-y-2.5">
                <div>
                  <label htmlFor="qr-url-input" className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    رابط العرض أو صفحة الحجز (<span className="en">Landing URL</span>)
                  </label>
                  <input
                    id="qr-url-input"
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    className="en w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="qr-code-input" className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      كود المسوّق (<span className="en">Affiliate ID</span>)
                    </label>
                    <input
                      id="qr-code-input"
                      type="text"
                      value={qrAffCode}
                      onChange={(e) => setQrAffCode(e.target.value)}
                      className="en w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="qr-orders-input" className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      الطلبات المتوقعة
                    </label>
                    <input
                      id="qr-orders-input"
                      type="number"
                      min={1}
                      max={10000}
                      value={qrOrders}
                      onChange={(e) => setQrOrders(Math.max(1, Number(e.target.value) || 1))}
                      className="en tabular-nums w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="qr-model-select" className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    نظام العمولة المحاسبي
                  </label>
                  <select
                    id="qr-model-select"
                    value={qrModel}
                    onChange={(e) => setQrModel(e.target.value as CommissionModel)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="CPS_15">CPS 15% (Cost Per Sale — عمولة 15% على البيع)</option>
                    <option value="CPL_40">CPL 40 EGP (Cost Per Lead — 40 ج.م لكل حجز)</option>
                  </select>
                </div>
              </div>

              <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50/95 p-2.5 dark:border-slate-800 dark:bg-slate-900/75">
                <div className="text-[11.5px] font-extrabold text-slate-700 dark:text-slate-300">
                  رابط التتبع المُولَّد آلياً (<span className="en">UTM Tracking</span>):
                </div>
                <div className="en mt-0.5 break-all text-xs font-black text-red-700 dark:text-red-400">
                  {affCalc.trackingUrl}
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-xl bg-emerald-50/95 p-2 dark:bg-emerald-950/35">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">المبيعات</div>
                  <div className="tabular-nums font-display text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {affCalc.totalSales.toLocaleString('en-US')} ج.م
                  </div>
                </div>
                <div className="rounded-xl bg-red-50/95 p-2 dark:bg-red-950/35">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">العمولة</div>
                  <div className="tabular-nums font-display text-xs font-black text-red-700 dark:text-red-300">
                    {affCalc.commission.toLocaleString('en-US')} ج.م
                  </div>
                </div>
                <div className="rounded-xl bg-sky-50/95 p-2 dark:bg-sky-950/35">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">الصافي</div>
                  <div className="tabular-nums font-display text-xs font-black text-sky-700 dark:text-sky-300">
                    {affCalc.netMerchantRevenue.toLocaleString('en-US')} ج.م
                  </div>
                </div>
              </div>
            </div>

            {/* Column C: Real Scannable Canvas */}
            <div className={`${cardEm} flex flex-col items-center justify-between text-center sm:col-span-3`}>
              <div className="flex w-full flex-col items-center">
                <span className={pillEm}>امسح الكود بكاميرا هاتفك الآن</span>
                <div className="mt-2.5 rounded-2xl border-2 border-red-500/45 bg-white p-2.5 shadow-sm">
                  <canvas
                    ref={qrCanvasRef}
                    data-testid="affiliate-qr-canvas"
                    aria-label="رمز الاستجابة السريعة للتسويق بالعمولة"
                    className="h-36 w-36"
                  />
                </div>
              </div>

              <div className="mt-2.5 flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyAffiliate}
                  className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 font-display text-xs font-black text-white hover:bg-slate-800 dark:bg-slate-800"
                >
                  {copiedUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedUrl ? 'تم نسخ الرابط' : 'نسخ رابط العمولة'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 font-display text-xs font-black text-white hover:bg-red-700"
                >
                  <Download className="h-4 w-4" />
                  <span>تحميل QR للطباعة (PNG)</span>
                </button>
              </div>

              <div className="mt-2.5 w-full">
                <EditorialVisual imageNum={23} compact alt="بطاقة QR VIP للتوزيع الميداني" />
              </div>
            </div>
          </div>
        );

      /* ---------------- SLIDE 21: MANSOURA EXECUTION + EXPANDED KPIS + 14-DAY BLUEPRINT ---------------- */
      case 21:
        return (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <article className={cardRed}>
                <span className={pillRed}>التطبيق الميداني 1 · قطاع المطاعم (شارع المشاية السفلية وحي الجامعة)</span>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                  إطلاق مطعم عبر <span className="en">FOOH + WebAR + Affiliate QR</span>
                </h2>
                <p className={smallTxt}>
                  <strong>التنفيذ الميداني:</strong> فيديو <span className="en">FOOH</span> لوجبة عملاقة فوق برج بالمشاية (4,000 ج.م) +
                  منيو <span className="en">WebAR</span> للطاولات (3,500 ج.م) + بذرة 10 مؤثرين طلاب وبطاقات عمولة <span className="en">CPS 15%</span> (4,000 ج.م) + تسييج جغرافي 1 كم (3,000 ج.م). استقطاب <strong>5,500 ماسح للكود</strong> ← تحويل <strong>40% (2,200 عميل)</strong> بمتوسط فاتورة <span className="en">AOV 190 ج.م</span>.
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-900">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">إجمالي التكلفة</div>
                    <div className="tabular-nums text-sm font-black text-slate-950 dark:text-white">14,500 ج.م</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/35">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">الإيراد (2,200 عميل)</div>
                    <div className="tabular-nums text-sm font-black text-emerald-700 dark:text-emerald-300">418,000 ج.م</div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-2.5 dark:bg-red-950/35">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">العائد (<span className="en">ROI</span>)</div>
                    <div className="tabular-nums text-sm font-black text-red-700 dark:text-red-400">2,782%</div>
                  </div>
                </div>
              </article>

              <article className={cardSky}>
                <span className={pillSky}>التطبيق الميداني 2 · قطاع الفنادق (كورنيش النيل وميدان أم كلثوم)</span>
                <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                  استقطاب عائلات الدلتا وضيوف المراكز الطبية بالمنصورة
                </h2>
                <p className={smallTxt}>
                  <strong>التنفيذ الميداني:</strong> جولة غرف افتراضية <span className="en">WebAR 360°</span> و<span className="en">VR</span> عبر بطاقات أنيقة (5,500 ج.م) +
                  شراكة عمولة <span className="en">CPL 40 ج.م</span> مع عيادات ومراكز الكلى والأورام وشركات السياحة (6,500 ج.م) + إعلان تسييج جغرافي حول محطة القطار والنادي (6,000 ج.م) لبيع <strong>220 ليلة فندقية</strong> بمتوسط <span className="en">ADR 2,500 ج.م</span>.
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-900">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">إجمالي التكلفة</div>
                    <div className="tabular-nums text-sm font-black text-slate-950 dark:text-white">18,000 ج.م</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/35">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">الإيراد (220 ليلة)</div>
                    <div className="tabular-nums text-sm font-black text-emerald-700 dark:text-emerald-300">550,000 ج.م</div>
                  </div>
                  <div className="rounded-xl bg-sky-50 p-2.5 dark:bg-sky-950/35">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300"><span className="en">ROI</span> / الإشغال</div>
                    <div className="tabular-nums text-sm font-black text-sky-700 dark:text-sky-300">2,955% (+21%)</div>
                  </div>
                </div>
              </article>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
              <article className={`${cardInd} sm:col-span-7`}>
                <span className={pillInd}>مؤشرات الأداء الرئيسية (<span className="en">KPIs — Key Performance Indicators</span>) وشرحها الكامل</span>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[12.5px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <div className="rounded-xl bg-slate-50/95 p-2.5 dark:bg-slate-900/75">
                    <strong className="en text-red-700 dark:text-red-400">ROI — Return On Investment (العائد على الاستثمار):</strong><br />
                    ((الإيراد − التكلفة) ÷ التكلفة × 100). يقيس صافي ربح كل جنيه أُنفق على الحملة.
                  </div>
                  <div className="rounded-xl bg-slate-50/95 p-2.5 dark:bg-slate-900/75">
                    <strong className="en text-sky-700 dark:text-sky-300">EMV — Earned Media Value (الإعلام المكتسب):</strong><br />
                    (المشاهدات المجانية ÷ 1,000) × <span className="en">CPM</span>؛ يثمن التغطية الصحفية ومشاركات الجمهور مجاناً.
                  </div>
                  <div className="rounded-xl bg-slate-50/95 p-2.5 dark:bg-slate-900/75">
                    <strong className="en text-emerald-700 dark:text-emerald-300">K-Factor &amp; ROAS (معامل الفيروسية وعائد الإعلان):</strong><br />
                    <span className="en">K =</span> الدعوات × التحويل (≥1 تضاعف ذاتي)؛ <span className="en">ROAS =</span> العائد لكل جنيه إعلاني (4.2×).
                  </div>
                  <div className="rounded-xl bg-slate-50/95 p-2.5 dark:bg-slate-900/75">
                    <strong className="en text-indigo-700 dark:text-indigo-300">CAC, AOV, ADR &amp; LTV (اقتصاديات العميل):</strong><br />
                    <span className="en">CAC</span> كلفة العميل؛ <span className="en">AOV/ADR</span> متوسط الفاتورة/الليلة؛ <span className="en">LTV</span> قيمة الإنفاق المستقبلية (≥ 3× CAC).
                  </div>
                </div>
              </article>

              <article className={`${cardEm} sm:col-span-5`}>
                <span className={pillEm}>خطة التنفيذ الزمنية الميدانية (14 يوماً)</span>
                <div className="mt-2 space-y-2 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <div className="rounded-xl bg-emerald-50/90 p-2.5 dark:bg-emerald-950/30">
                    <strong className="text-emerald-800 dark:text-emerald-300">أيام 1–4 (التأسيس والإنتاج):</strong> مسح الشارع، تصوير الـ 3D والـ <span className="en">FOOH</span>، وتوليد 30 كود <span className="en">UTM + QR</span> للسفراء.
                  </div>
                  <div className="rounded-xl bg-amber-50/90 p-2.5 dark:bg-amber-950/30">
                    <strong className="text-amber-900 dark:text-amber-300">أيام 5–9 (الضربة والتدفق):</strong> إطلاق الفيديو ونشر أكشاك <span className="en">VR/AR</span> وبطاقات العمولة وتفعيل <span className="en">Geofencing 1 km</span>.
                  </div>
                  <div className="rounded-xl bg-sky-50/90 p-2.5 dark:bg-sky-950/30">
                    <strong className="text-sky-800 dark:text-sky-300">أيام 10–14 (التحويل والتسوية):</strong> إعادة استهداف الماسحين عبر واتساب وبيكسل وصرف عمولات <span className="en">CPS/CPL</span>.
                  </div>
                </div>
              </article>
            </div>
          </div>
        );

      /* ---------------- SLIDE 22: FULL SWOT MATRIX + EXPLOIT + REMEDIATE ---------------- */
      case 22:
        return (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className={cardEm}>
                <span className={pillEm}>S · Strengths (نقاط القوة)</span>
                <ul className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <li>• خفض التكاليف 80%–90% مقابل التقليدي</li>
                  <li>• اختراق العمى الإعلاني (<span className="en">RAS</span>) بـ 6× تذكر</li>
                  <li>• قيمة إعلام مكتسب (<span className="en">EMV</span>) 10×–30×</li>
                  <li>• مرونة تنفيذ وتعديل خلال 24–48 ساعة</li>
                </ul>
              </div>
              <div className={cardRed}>
                <span className={pillRed}>W · Weaknesses (نقاط الضعف)</span>
                <ul className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <li>• فجوة قياس إن لم تُربط بـ <span className="en">QR / UTM</span></li>
                  <li>• قِصر عمر الضجة بالشارع (<span className="en">Short Lifespan</span>)</li>
                  <li>• تشتت عن البراند (<span className="en">Vampire Effect</span>)</li>
                  <li>• اعتماد عالٍ على التميّز الإبداعي</li>
                </ul>
              </div>
              <div className={cardSky}>
                <span className={pillSky}>O · Opportunities (الفرص)</span>
                <ul className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <li>• خوارزميات الريلز وتيك توك التي تدعم <span className="en">UGC</span></li>
                  <li>• رخص أدوات <span className="en">WebAR</span> و<span className="en">VR</span> والـ <span className="en">GenAI 3D</span></li>
                  <li>• جيش طلاب الجامعات كمسوقين بالعمولة</li>
                  <li>• ندرة المنافسين المحليين في الحملات الذكية</li>
                </ul>
              </div>
              <div className={cardAmb}>
                <span className={pillAmb}>T · Threats (التهديدات)</span>
                <ul className="mt-2 space-y-1.5 text-[13px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <li>• استنساخ المنافسين للفكرة بعد نجاحها</li>
                  <li>• الغرامات البلدية عند تجاهل التصاريح</li>
                  <li>• تشبع الجمهور وتناقص الدهشة بالتكرار</li>
                  <li>• انهيار الثقة -62% إذا كُشف <span className="en">Astroturfing</span></li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <article className={cardEm}>
                <span className={pillEm}>أولاً: استراتيجيات تعظيم نقاط القوة واستثمار الفرص (SO Strategy)</span>
                <ul className="mt-2 space-y-1.5 text-[13.5px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <li><strong>1. إعادة تدوير 25% من الوفر للمكافآت:</strong> تخصيص هدايا ترفع نسبة تصوير <span className="en">UGC</span> إلى 12× قيمة إعلانية.</li>
                  <li><strong>2. هندسة المشهد لعدسة الهاتف أولاً:</strong> ألوان وإضاءة مثالية تولّد مقاطع 9 ثوانٍ بمعدل <span className="en">Hook 54%</span>.</li>
                  <li><strong>3. قنص المواسم والتريندات:</strong> إطلاق <span className="en">Newsjacking</span> خلال 24 ساعة في مواسم الجامعات والأعياد.</li>
                  <li><strong>4. تحويل الزخم لبيع دائم بالعمولة:</strong> تسليح 30 شريكاً بأكواد <span className="en">Affiliate QR</span> بعائد <span className="en">1:18</span>.</li>
                </ul>
              </article>

              <article className={cardRed}>
                <span className={pillRed}>ثانياً: البروتوكول الهندسي لمعالجة الضعف وتحييد التهديدات (WT Defense)</span>
                <ul className="mt-2 space-y-1.5 text-[13.5px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">
                  <li><strong>1. علاج فجوة القياس:</strong> ربط كل تفاعل بـ <span className="en">QR + UTM + Pixel</span> لقياس نسبة التحويل (40%) بدقة.</li>
                  <li><strong>2. علاج قِصر العمر:</strong> توثيق ردود الأفعال لإعادة ضخها كإعلانات <span className="en">Geofencing</span> لمدة 60 يوماً.</li>
                  <li><strong>3. علاج تأثير <span className="en">Vampire Effect</span>:</strong> دمج شعار واسم المنتج في صميم الفكرة البصرية لا هامشها.</li>
                  <li><strong>4. علاج العقبات القانونية:</strong> الاعتماد على <span className="en">WebAR</span> و<span className="en">FOOH</span> النظيف رقمياً بصفر غرامات.</li>
                </ul>
              </article>
            </div>
          </div>
        );

      /* ---------------- SLIDE 23: LEGAL RISKS & BOSTON 2007 ---------------- */
      case 23:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            <article className={`${cardRed} sm:col-span-5`}>
              <EditorialVisual imageNum={25} compact alt="الامتثال القانوني والتصاريح الرسمية" />
              <div className="mt-2.5">
                <span className={pillRed}>دراسة تحذيرية موثقة · 31 يناير 2007 · بوسطن، أمريكا</span>
              </div>
              <h2 className="mt-1.5 font-display text-[15px] font-black text-slate-950 lg:text-base dark:text-white">
                كارثة بوسطن الأمنية (<span className="en">Turner Broadcasting / Mooninite Panic</span>)
              </h2>
              <p className={smallTxt}>
                وضعت وكالة ترويجية <strong>38 لوحة إلكترونية مضيئة</strong> بأسلاك مكشوفة وبطاريات لاصقة تحت الجسور ومحطات
                المترو في بوسطن للترويج لمسلسل <em className="en">Aqua Teen Hunger Force</em> بدون إخطار أمني؛ فاشتبهت الشرطة
                في كونها عبوات ناسفة، وأُغلقت 4 جسور وطرق رئيسية واستُنفرت فرق المفرقعات!
              </p>
              <div className={noteBox}>
                <strong>العواقب الرقمية الموثقة:</strong> تكبّدت شركة <span className="en">Turner Broadcasting</span> غرامات وتعويضات بقيمة{' '}
                <strong>2 مليون دولار أمريكي</strong> (مليون للولاية ومليون للأجهزة الأمنية)، واعتُقل مصمما التركيبات، واستقال رئيس{' '}
                <span className="en">Cartoon Network</span>.
              </div>
            </article>

            <div className="grid grid-cols-1 gap-2.5 sm:col-span-7 sm:grid-cols-2">
              {[
                {
                  cls: cardRed,
                  pill: pillRed,
                  k: '01 · الأمان الجسدي والأمني (Public Safety)',
                  d: 'حظر وضع أي مجسمات أو عبوات مغلقة بأسلاك وبطاريات ظاهرة في الميادين والمواصلات، وعدم إعاقة مخارج الطوارئ والمرور.',
                },
                {
                  cls: cardSky,
                  pill: pillSky,
                  k: '02 · التصاريح والملكية العامة (Municipal Permits)',
                  d: 'عدم استخدام الأرصفة أو واجهات المباني دون إذن رسمي، أو التحول لبديل FOOH وWebAR الرقمي الآمن بصفر مخالفة إشغال.',
                },
                {
                  cls: cardEm,
                  pill: pillEm,
                  k: '03 · النظافة والاستدامة البيئية (Eco Compliance)',
                  d: 'تجنب الدهانات الدائمة والملصقات الصمغية المشوّهة، واستبدالها بالجرافيتي العكسي بالماء المضغوط والألواح سريعة الفك.',
                },
                {
                  cls: cardAmb,
                  pill: pillAmb,
                  k: '04 · خصوصية التصوير والموافقة (Privacy & Consent)',
                  d: 'الحصول على موافقة المارة قبل استغلال وجوههم في الإعلانات الممولة مع إشعار واضح في موقع التصوير التفاعلي.',
                },
                {
                  cls: cardInd,
                  pill: pillInd,
                  k: '05 · الشفافية ومنع التضليل (Anti-Astroturfing)',
                  d: 'الالتزام بقواعد هيئات حماية المستهلك (مثل FTC) بالإفصاح عند وجود رعاية مدفوعة للمؤثرين وعدم فبركة المراجعات.',
                },
                {
                  cls: cardRed,
                  pill: pillRed,
                  k: '06 · الملكية الفكرية في الكمائن (IP Law Compliance)',
                  d: 'عند تنفيذ تسويق الكمائن (Ambush Marketing)، يُحظر تقليد العلامات التجارية المسجلة أو الشعارات الأولمبية والرياضية المحمية.',
                },
              ].map((rule) => (
                <article key={rule.k} className={rule.cls}>
                  <span className={rule.pill}>{rule.k}</span>
                  <p className={smallTxt}>{rule.d}</p>
                </article>
              ))}
            </div>
          </div>
        );

      /* ---------------- SLIDE 24: MASTER ORAL-DEFENSE QUICK-REFERENCE MATRIX OF ALL ABBREVIATIONS ---------------- */
      case 24:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            <div className="overflow-x-auto rounded-2xl border border-slate-300/85 bg-white/95 shadow-sm sm:col-span-12 dark:border-slate-800 dark:bg-[#101726]/95">
              <table className="w-full border-collapse text-right text-[13px] lg:text-[14px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-red-600/12 text-red-900 dark:border-slate-800 dark:bg-red-950/45 dark:text-red-300">
                    <th className="p-2.5 font-display font-black">الاختصار</th>
                    <th className="p-2.5 font-display font-black">الاسم الإنجليزي الكامل (<span className="en">Full Term</span>)</th>
                    <th className="p-2.5 font-display font-black">الترجمة العربية</th>
                    <th className="p-2.5 font-display font-black">كيف يُنفّذ في تسويق الغوريلا؟</th>
                    <th className="p-2.5 font-display font-black">الأدلة والأرقام الموثقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-bold text-slate-900 dark:divide-slate-800 dark:text-slate-100">
                  {ABBREV_MASTER_LIST.map((row) => (
                    <tr key={row.abbr} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                      <td className="en p-2 font-black text-red-700 dark:text-red-400">{row.abbr}</td>
                      <td className="en p-2 font-extrabold text-slate-950 dark:text-white">{row.full}</td>
                      <td className="p-2 font-extrabold text-sky-900 dark:text-sky-300">{row.ar}</td>
                      <td className="p-2 leading-relaxed">{row.how}</td>
                      <td className="p-2 font-extrabold text-emerald-800 dark:text-emerald-300">{row.num}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      /* ---------------- SLIDE 25: FULL GLOSSARY (34) + CLICKABLE REFERENCES (18) ---------------- */
      case 25:
        return (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            <section className={`${cardRed} flex flex-col sm:col-span-7`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 dark:border-slate-800">
                <span className={pillRed}>
                  القاموس التخصصي الشامل ({filteredGlossary.length} / {GLOSSARY_TERMS.length} مصطلحاً ومختصراً)
                </span>
                <div className="relative min-w-[200px] flex-1 sm:max-w-[260px]">
                  <Search className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    placeholder="ابحث (UGC, QR, VR, MR, ROI...)"
                    aria-label="بحث في القاموس التخصصي"
                    className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-9 pl-2.5 text-[13px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="editorial-scroll mt-2.5 grid max-h-[260px] gap-2.5 overflow-y-auto pl-1 sm:max-h-[340px] lg:grid-cols-2 lg:max-h-[500px]">
                {filteredGlossary.map((g) => (
                  <div
                    key={g.en}
                    className="rounded-xl border border-slate-200 bg-slate-50/95 p-3 dark:border-slate-800 dark:bg-slate-900/80"
                  >
                    <div className="en text-[13.5px] font-black text-red-700 dark:text-red-400">{g.en}</div>
                    <div className="mt-0.5 font-display text-[13.5px] font-black text-slate-950 dark:text-white">{g.ar}</div>
                    <p className="mt-1 text-[12.5px] font-bold leading-relaxed text-slate-900 dark:text-slate-100">{g.def}</p>
                    <p className="mt-1 text-[12.5px] font-extrabold text-emerald-800 dark:text-emerald-300">{g.mean}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${cardSky} flex flex-col sm:col-span-5`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
                <span className={pillSky}>المراجع الأكاديمية الموثقة بالروابط ({ACADEMIC_REFERENCES.length} مرجعاً)</span>
              </div>

              <ol className="editorial-scroll mt-2.5 max-h-[260px] space-y-2 overflow-y-auto pl-1 sm:max-h-[340px] lg:max-h-[500px]">
                {ACADEMIC_REFERENCES.map((ref) => (
                  <li
                    key={ref.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/95 p-2.5 text-[12.5px] font-bold leading-relaxed text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                  >
                    <div className="en font-extrabold text-slate-950 dark:text-white">
                      <span className="font-black text-red-700 dark:text-red-400">[{String(ref.id).padStart(2, '0')}]</span>{' '}
                      {ref.citation}
                    </div>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="en mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-sky-500/16 px-2.5 py-1 text-xs font-black text-sky-900 underline-offset-2 hover:bg-sky-500/25 hover:underline dark:bg-sky-500/20 dark:text-sky-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>فتح المصدر الموثق ({ref.sourceLabel})</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        );

      /* ---------------- SLIDE 26: AI STRATEGY & TRAFFIC ENGINE ---------------- */
      case 26:
        return <AiStrategyAdvisor />;

      /* ---------------- SLIDE 27: AUDIENCE STAR RATINGS & REVIEWS ---------------- */
      case 27:
        return <PresentationRating />;

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1460px] flex-col">
      {/* Rotating Animated Crimson-White Border + Luminous Neon Glow Frame */}
      <div className="animated-neon-frame flex min-h-0 flex-1 flex-col">
        <section
          aria-label={`شريحة ${meta.num}: ${meta.short}`}
          data-slide-num={meta.num}
          className="animated-neon-frame-inner relative flex min-h-0 flex-1 flex-col bg-white dark:bg-[#0c1220]"
        >
          {/* Clearly Visible Animated Slide Video Layer (BG-SLIDE) */}
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
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-slate-50/28 to-red-50/25 dark:from-[#0b101d]/48 dark:via-[#0f1625]/38 dark:to-[#1b0b10]/35"
          />

          {/* Animated Slide Entrance & Exit Choreography Across Every Navigation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={meta.num}
              data-testid="animated-slide-stage"
              custom={direction}
              initial={{
                opacity: 0,
                x: direction > 0 ? -36 : 36,
                scale: 0.985,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                x: direction > 0 ? 36 : -36,
                scale: 0.985,
              }}
              transition={{
                duration: 0.36,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 flex min-h-0 flex-1 flex-col p-2 md:p-4 lg:p-5"
            >
              {/* Slide Header (Clean PowerPoint Title Band without Corner Badge Boxes) */}
              <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="landscape-compact-header mb-2 flex shrink-0 flex-col rounded-xl border-b-2 border-red-500/35 bg-white/88 px-3.5 py-2 backdrop-blur-md md:mb-3 md:px-4 md:py-2.5 dark:bg-[#101726]/86"
              >
                <div className="font-display text-xs font-black text-red-700 md:text-[13px] dark:text-red-400">
                  {meta.kicker}
                </div>
                <h1
                  className="mt-0.5 font-display text-sm font-black leading-snug text-slate-950 sm:text-base md:text-xl lg:text-[22px] dark:text-white"
                  dangerouslySetInnerHTML={{ __html: meta.titleHtml }}
                />
                <p className="landscape-hide-subtitle mt-0.5 hidden line-clamp-2 text-xs font-bold leading-relaxed text-slate-800 md:block lg:text-[13.5px] dark:text-slate-100">
                  {meta.subtitle}
                </p>
              </motion.header>

              {/* Scrollable Slide Body Inside Fixed PowerPoint Stage with Staggered Reveal */}
              <motion.div
                ref={scrollAreaRef}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="editorial-scroll min-h-0 flex-1 overflow-y-auto pl-1"
              >
                {renderSlideBody()}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};
