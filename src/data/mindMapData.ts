export type MindMapPresetId = 'all' | 'virality' | 'conversion' | 'authority';

export type NodeAccent = 'red' | 'amber' | 'sky' | 'emerald' | 'indigo';

export interface MindMapNode {
  id: string;
  x: number;
  y: number;
  arTitle: string;
  shortAr: string;
  enTitle: string;
  abbr: string;
  accent: NodeAccent;
  presets: MindMapPresetId[];
  primaryMetric: string;
  metricLabel: string;
  guerrillaGives: string;
  channelGives: string;
  executionPlaybook: string;
  proofEvidence: string;
}

export interface StrategicIntersection {
  id: string;
  fromId: string;
  toId: string;
  titleAr: string;
  impactMetric: string;
  mechanism: string;
}

export interface MindMapPreset {
  id: MindMapPresetId;
  label: string;
  enLabel: string;
  summary: string;
}

export const MIND_MAP_CENTER = {
  x: 430,
  y: 270,
  arTitle: 'التسويق الغوريلا',
  enTitle: 'Guerrilla Marketing Core',
  subtitle: 'كسر التوقع + المفاجأة المجانية',
};

export const MIND_MAP_PRESETS: MindMapPreset[] = [
  {
    id: 'all',
    label: 'الخريطة الشاملة (8 مسارات)',
    enLabel: 'Full Ecosystem',
    summary: 'استعراض كامل تقاطعات التسويق الغوريلا مع كل القنوات الثماني وروابطها البينية.',
  },
  {
    id: 'virality',
    label: 'مثلث الضجة (UGC × PR × Social)',
    enLabel: 'Virality & Trust',
    summary: 'كيف تتحول المفاجأة الميدانية إلى محتوى جمهور UGC وتغطية صحفية PR وتداول فيروسي.',
  },
  {
    id: 'conversion',
    label: 'مسار التحويل (Digital × Affiliate × CRM)',
    enLabel: 'Attribution & ROI',
    summary: 'تحويل الدهشة إلى مبيعات محسوبة عبر Geofencing وQR العمولة وأتمتة الواتساب.',
  },
  {
    id: 'authority',
    label: 'الهيمنة المحلية والشركات (Local SEO × B2B)',
    enLabel: 'Local & Enterprise',
    summary: 'استثمار الحشد الميداني لتصدر خرائط جوجل واقتناص عقود الشركات الكبرى ABM.',
  },
];

export const MIND_MAP_NODES: MindMapNode[] = [
  {
    id: 'ugc',
    x: 430,
    y: 62,
    arTitle: 'محتوى الجمهور',
    shortAr: 'محتوى الجمهور UGC',
    enTitle: 'User-Generated Content',
    abbr: 'UGC',
    accent: 'amber',
    presets: ['all', 'virality'],
    primaryMetric: '12× EMV',
    metricLabel: 'قيمة إعلام مكتسب',
    guerrillaGives: 'يصنع للعميل «لقطة جاهزة للكاميرا» ومفاجأة بصرية بالشارع أو عبر WebAR تستفزه للتصوير التلقائي دون أجر.',
    channelGives: 'يمنح الغوريلا مصداقية اجتماعية (+79% ثقة شرائية) ويحفظ اللحظة الميدانية المؤقتة كفيديوهات دائمة.',
    executionPlaybook: 'تصميم زاوية Selfie-Ready واضحة الشعار + وسم موحد + كود QR يمنح مكافأة فورية لكل مصوّر.',
    proofEvidence: 'خفض كلفة إنتاج المحتوى بنسبة -68%، ومضاعفة المشاهدات العضوية +310% عبر تيك توك وريلز.',
  },
  {
    id: 'pr',
    x: 685,
    y: 118,
    arTitle: 'العلاقات العامة',
    shortAr: 'العلاقات العامة PR',
    enTitle: 'PR & Newsjacking',
    abbr: 'PR',
    accent: 'indigo',
    presets: ['all', 'virality', 'authority'],
    primaryMetric: '+190%',
    metricLabel: 'بحث مباشر بالاسم',
    guerrillaGives: 'يحول الحملات التجارية الجريئة إلى قصص إنسانية وطريفة غير مسبوقة تتسابق الصحف لنشرها مجاناً.',
    channelGives: 'يرفع الضجة المحلية من دائرة المارة إلى 15–40 منصة وصحيفة رسمية مما يضفي هيبة ومصداقية على العلامة.',
    executionPlaybook: 'ربط الفكرة بتريند عاجل (Newsjacking) خلال 24 ساعة مع تجهيز ملف صحفي رقمي Press Kit بصور احترافية.',
    proofEvidence: 'حملة IKEA باريس (2014) حصدت 3.5 مليون يورو قيمة تغطية صحفية وإعلامية مجانية (EMV).',
  },
  {
    id: 'social',
    x: 735,
    y: 270,
    arTitle: 'السوشيال والانتشار',
    shortAr: 'السوشيال الفيروسي',
    enTitle: 'Social & Viral Loop',
    abbr: 'K-Factor',
    accent: 'red',
    presets: ['all', 'virality'],
    primaryMetric: 'K ≥ 1.3',
    metricLabel: 'معامل التضاعف الذاتي',
    guerrillaGives: 'يوفر مادة خطف انتباه في أول 3 ثوانٍ (Hook Rate 54%) تكسر تشبع المستخدمين مع الإعلانات التقليدية.',
    channelGives: 'يشغّل التداول الخوارزمي المتسارع بحيث يجلب كل مشاهد جديد 1.3 متفاعل إضافي بتكلفة صفر جنيه.',
    executionPlaybook: 'إطلاق تحدي تفاعلي قصير وتوثيق ردود فعل الجمهور العفوية ثم إعادة نشر أفضل المقاطع يومياً.',
    proofEvidence: 'نمو الحسابات عضوياً بمقدار +240% وتكرار النجاح عالمياً كما في التجمع المفاجئ لـ T-Mobile (42M مشاهدة).',
  },
  {
    id: 'seo',
    x: 685,
    y: 422,
    arTitle: 'البحث المحلي',
    shortAr: 'خرائط جوجل Local SEO',
    enTitle: 'Local SEO & Maps',
    abbr: 'Local SEO',
    accent: 'emerald',
    presets: ['all', 'authority'],
    primaryMetric: '+140%',
    metricLabel: 'اتصالات وطلب اتجاهات',
    guerrillaGives: 'يدفع تدفقاً بشرياً حقيقياً نحو الفرع فيولّد إشارات موقع GPS وبحثاً مباشراً يلاحظه محرك خرائط جوجل فوراً.',
    channelGives: 'يثبّت نتائج الصعود في صدارة خرائط جوجل (Local Pack Top 3) لتستمر المبيعات أشهراً بعد انتهاء الضربة.',
    executionPlaybook: 'وضع بطاقات تقييم NFC + QR على طاولات التفاعل، ومنح هدية ترحيبية مقابل تقييم صادق مع صورة WebAR.',
    proofEvidence: 'الصعود لأعلى 3 نتائج محلية خلال 21 يوماً وزيادة زيارات الفروع المتكررة دون إنفاق إضافي.',
  },
  {
    id: 'digital',
    x: 430,
    y: 478,
    arTitle: 'التسويق الرقمي',
    shortAr: 'التسويق الرقمي O2O',
    enTitle: 'Digital Performance & O2O',
    abbr: 'Digital · O2O',
    accent: 'sky',
    presets: ['all', 'conversion'],
    primaryMetric: '4.2× ROAS',
    metricLabel: 'عائد الإنفاق الإعلاني',
    guerrillaGives: 'يغذّي بيكسل Meta وTikTok بجمهور دافئ جغرافياً عبر التحويل من الواقع للإنترنت (O2O) فيلغي حرق الميزانيات الباردة.',
    channelGives: 'يتعقب المارة بعد مغادرة الشارع لمدة 48 ساعة بإعلانات إعادة استهداف مركزة تحسم قرار الشراء.',
    executionPlaybook: 'تطويق الموقع بنطاق Geofencing قطر 1 كم + زرع Pixel بصفحة هبوط كود QR + إطلاق عرض محدود.',
    proofEvidence: 'خفض تكلفة النقرة (CPC) بنسبة -65% ومضاعفة عائد الإنفاق الإعلاني ROAS لـ 4.2× مقارنة بالاستهداف العام.',
  },
  {
    id: 'affiliate',
    x: 175,
    y: 422,
    arTitle: 'التسويق بالعمولة',
    shortAr: 'التسويق بالعمولة',
    enTitle: 'Affiliate Marketing',
    abbr: 'CPS · CPL',
    accent: 'red',
    presets: ['all', 'conversion'],
    primaryMetric: '1 : 18',
    metricLabel: 'عائد مالي بالعمولة',
    guerrillaGives: 'يسلّح المسوقين الشركاء ببطاقات خداع بصري وتجارب WebAR تفتح شهية المشتري بنسبة مسح 38% بدلاً من الملل الورقي.',
    channelGives: 'يغلق فجوة قياس الغوريلا 100% عبر روابط UTM وأكواد QR ولا يدفع التاجر إلا عند البيع (CPS 15%) أو الحجز (CPL 40 ج.م).',
    executionPlaybook: 'تجنيد 30 طالباً وصانع محتوى وسائق دليفري بأكواد QR مميزة وخصم فوري 10% للمشتري.',
    proofEvidence: 'خفض تكلفة استحواذ العميل CAC بنسبة -72%، وبناء شبكة مبيعات نشطة بصفر رواتب شهرية ثابتة.',
  },
  {
    id: 'crm',
    x: 125,
    y: 270,
    arTitle: 'إدارة العملاء',
    shortAr: 'CRM والواتساب',
    enTitle: 'CRM & WhatsApp Flow',
    abbr: 'CRM',
    accent: 'emerald',
    presets: ['all', 'conversion'],
    primaryMetric: '82%',
    metricLabel: 'معدل فتح الرسائل',
    guerrillaGives: 'يجلب آلاف الأرقام والبيانات الطوعية في الشارع عندما يمسح الجمهور كود QR أو شريحة NFC لاستلام الكوبون.',
    channelGives: 'يحول الزبون العابر لأول مرة إلى مشتري دائم بتدفقات متابعة ذكية ترفع تكرار الشراء وتضاعف LTV.',
    executionPlaybook: 'ربط مسح الكود تلقائياً برسالة WhatsApp Business مصنفة بالحي والاهتمام + رسالة تذكير يوم 3 ويوم 14.',
    proofEvidence: 'تحقيق معدل فتح 82% (مقابل 18% إيميل) وعودة 34% من العملاء للشراء المتكرر خلال الشهر الأول.',
  },
  {
    id: 'b2b',
    x: 175,
    y: 118,
    arTitle: 'تسويق الشركات',
    shortAr: 'الشركات B2B ABM',
    enTitle: 'B2B ABM & Events',
    abbr: 'B2B ABM',
    accent: 'indigo',
    presets: ['all', 'authority'],
    primaryMetric: '68%',
    metricLabel: 'نسبة استجابة المديرين',
    guerrillaGives: 'يكسر برود المكالمات والإيميلات المهملة بطرود إبداعية مخصصة (3D/NFC) تخترق مكاتب صناع القرار مباشرة.',
    channelGives: 'يوجّه إبداع الغوريلا نحو حسابات مؤسسية ضخمة محددة بدقة مما يحقق أضخم عائد مالي للصفقة الواحدة.',
    executionPlaybook: 'تحديد 20 شركة أو فندقاً وإرسال صندوق VIP باسم المدير يحتوي على مجسم WebAR مصمم لمشروعه خصيصاً.',
    proofEvidence: '68% استجابة وحجز اجتماعات رسمية مقابل < 2% للإيميل البارد، وعائد ROI يتجاوز 1,400%، و5× Leads بالمعارض.',
  },
];

export const STRATEGIC_INTERSECTIONS: StrategicIntersection[] = [
  {
    id: 'ugc-pr',
    fromId: 'ugc',
    toId: 'pr',
    titleAr: 'عدوى الجمهور ← التغطية الصحفية',
    impactMetric: '15–40 وسيلة إعلامية',
    mechanism: 'عندما تتجاوز فيديوهات UGC المصوّرة بالشارع حاجزاً معيناً، تلتقطها الصحف والمنصات كخبر مجتمعي مجاني يضاعف البحث المباشر +190%.',
  },
  {
    id: 'ugc-digital',
    fromId: 'ugc',
    toId: 'digital',
    titleAr: 'مادة الكاميرا العفوية ← وقود إعلانات الأداء',
    impactMetric: '-65% كلفة نقرة CPC',
    mechanism: 'تُستخدم فيديوهات الزبائن الحقيقية (UGC) كإعلانات إعادة استهداف Retargeting عبر Geofencing فتبدو طبيعية وتحقق 4.2× ROAS.',
  },
  {
    id: 'ugc-social',
    fromId: 'ugc',
    toId: 'social',
    titleAr: 'شرارة التصوير ← تضاعف الخوارزميات',
    impactMetric: 'K-Factor ≥ 1.3',
    mechanism: 'تحفّز المشاهد العفوية خوارزميات الريلز وتيك توك فتتضاعف المشاركات ذاتياً بمعدل +240% نمو عضوي للحساب.',
  },
  {
    id: 'digital-affiliate',
    fromId: 'digital',
    toId: 'affiliate',
    titleAr: 'التسييج الجغرافي ← تتبع عمولات QR',
    impactMetric: '1 : 18 عائد مالي',
    mechanism: 'تتلاقى بيانات Pixel الرقمية مع أكواد UTM الشركاء لقياس كل مبيعة قادمة من الشارع بدقة 100% وخفض CAC بنسبة -72%.',
  },
  {
    id: 'affiliate-crm',
    fromId: 'affiliate',
    toId: 'crm',
    titleAr: 'دورة التحويل ← تجنيد العملاء سفراء',
    impactMetric: '34% تكرار شراء + عمولة',
    mechanism: 'كل عميل مخلص في قائمة CRM الواتساب يحصل على كود Affiliate QR ليحول أصدقاءه إلى مشترين جدد مقابل خصم أو عمولة.',
  },
  {
    id: 'seo-social',
    fromId: 'seo',
    toId: 'social',
    titleAr: 'الضجة البصرية ← صعود خرائط جوجل',
    impactMetric: 'Top 3 خلال 21 يوماً',
    mechanism: 'الزوار القادمون بدافع الفضول من السوشيال يلتقطون الصور ويرفعون تقييمات 5★ على Google Maps فيقفز ترتيب المكان محلياً.',
  },
  {
    id: 'pr-b2b',
    fromId: 'pr',
    toId: 'b2b',
    titleAr: 'هيبة الإعلام ← إغلاق صفقات الشركات',
    impactMetric: '68% موافقة اجتماعات ABM',
    mechanism: 'إرفاق قصاصة التغطية الصحفية الناجحة داخل طرد B2B ABM التفاعلي يقنع مديري الفنادق والشركات بفاعلية الحملة فوراً.',
  },
  {
    id: 'crm-b2b',
    fromId: 'crm',
    toId: 'b2b',
    titleAr: 'إشعار المسح الفوري ← متابعة VIP ذكية',
    impactMetric: 'ROI > 1,400% للعقود',
    mechanism: 'فور لمس المدير شريحة NFC أو مسح كود WebAR داخل الصندوق يصل تنبيه لحظي لفريق المبيعات على CRM لإجراء الاتصال المناسب.',
  },
];

export function filterNodesByPreset(
  presetId: MindMapPresetId,
  nodes: MindMapNode[] = MIND_MAP_NODES
): MindMapNode[] {
  if (presetId === 'all') return nodes;
  return nodes.filter((n) => n.presets.includes(presetId));
}

export function getIntersectionsForNode(
  nodeId: string,
  intersections: StrategicIntersection[] = STRATEGIC_INTERSECTIONS
): StrategicIntersection[] {
  return intersections.filter((edge) => edge.fromId === nodeId || edge.toId === nodeId);
}

export function getNextNodeId(
  currentId: string,
  nodes: MindMapNode[] = MIND_MAP_NODES
): string {
  if (nodes.length === 0) return currentId;
  const idx = nodes.findIndex((n) => n.id === currentId);
  if (idx === -1) return nodes[0].id;
  return nodes[(idx + 1) % nodes.length].id;
}
