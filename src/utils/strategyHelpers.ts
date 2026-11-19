export interface AiProjectBrief {
  projectName?: string;
  projectType: string;
  cityOrMarket: string;
  targetAudience?: string;
  budgetTier: string;
  trafficGoal: string;
  customQuery?: string;
}

export interface AiGroundSource {
  title: string;
  uri: string;
}

export interface AiPlanSection {
  title: string;
  body: string;
}

export interface AiGuerrillaPlanResponse {
  markdown: string;
  sections: AiPlanSection[];
  sources: AiGroundSource[];
  searchQueries: string[];
  model: string;
}

export interface ProjectPreset {
  id: string;
  label: string;
  brief: AiProjectBrief;
}

export const TRAFFIC_GOAL_OPTIONS = [
  'جلب ترافيك وزيارات سريعة + انتشار فيروسي ريلز وتيك توك',
  'تفجير زيارات المتجر الإلكتروني وتخفيض تكلفة الإعلان CAC',
  'تصدر خرائط جوجل المحلية (Local SEO) وزيادة الحجوزات اليومية',
  'شراكات عمولة CPL + جولات VR/WebAR لحجز الغرف والوحدات',
  'مبيعات فورية عبر QR والتسويق بالعمولة (Affiliate CPS/CPL)',
  'جذب عملاء شركات وصفقات كبرى (B2B ABM)',
];

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'mansoura-restaurant',
    label: 'مطعم وكافيه في المنصورة',
    brief: {
      projectName: 'مشويات وكافيه النيل',
      projectType: 'مطعم مأكولات سريعة وكافيه شبابي',
      cityOrMarket: 'المنصورة (شارع المشاية السفلية وحي الجامعة)',
      targetAudience: 'طلاب جامعة المنصورة والعائلات والشباب',
      budgetTier: '3,000 - 15,000 ج.م (نموذج غوريلا الذكي)',
      trafficGoal: TRAFFIC_GOAL_OPTIONS[0],
      customQuery: 'أريد خطة خطوة بخطوة بدمج FOOH وWebAR وبطاقات QR بالعمولة لرفع الترافيك خلال 14 يوماً',
    },
  },
  {
    id: 'fashion-ecommerce',
    label: 'متجر ملابس أونلاين',
    brief: {
      projectName: 'براند ستريت وير محلي',
      projectType: 'متجر تجارة إلكترونية للملابس العصرية (E-Commerce)',
      cityOrMarket: 'مصر — القاهرة والجيزة والدلتا',
      targetAudience: 'شباب وبنات جيل Z (18–28 سنة)',
      budgetTier: 'صفر - 3,000 ج.م (أفكار شبه مجانية)',
      trafficGoal: TRAFFIC_GOAL_OPTIONS[1],
      customQuery: 'كيف أجمع محتوى UGC مجاني من المارة والعملاء وأحوله لزيارات ومبيعات على الموقع؟',
    },
  },
  {
    id: 'dental-clinic',
    label: 'عيادة أسنان وتجميل',
    brief: {
      projectName: 'عيادة سمايل ديزاين',
      projectType: 'عيادة طب وتجميل الأسنان',
      cityOrMarket: 'مصر — حي سكني ومدينة جامعية',
      targetAudience: 'الموظفون والأسر والباحثون عن تجميل الأسنان',
      budgetTier: '3,000 - 15,000 ج.م (نموذج غوريلا الذكي)',
      trafficGoal: TRAFFIC_GOAL_OPTIONS[2],
      customQuery: 'اقترح حملات غوريلا طبية أخلاقية تزيد البحث المباشر والتقييمات على جوجل مابس بدون مخالفة قانونية',
    },
  },
  {
    id: 'hotel-realestate',
    label: 'فندق أو مشروع عقاري',
    brief: {
      projectName: 'إقامة وفندق كورنيش النيل',
      projectType: 'فندق بوتيك / وحدات فندقية واستثمار عقاري',
      cityOrMarket: 'مصر — المدن السياحية ومحافظات الدلتا',
      targetAudience: 'ضيوف السياحة العلاجية والعائلات والشركات B2B',
      budgetTier: '15,000 - 50,000 ج.م (حملة متكاملة FOOH + WebAR)',
      trafficGoal: TRAFFIC_GOAL_OPTIONS[3],
      customQuery: 'كيف أطبق أكشاك VR أو طرود B2B ABM مع العيادات والشركات لجلب حجوزات مستمرة؟',
    },
  },
];

export function validateProjectBrief(
  raw: Partial<AiProjectBrief>
):
  | { ok: true; brief: AiProjectBrief }
  | { ok: false; errorAr: string } {
  const projectType = (raw.projectType ?? '').trim().slice(0, 140);
  const cityOrMarket = (raw.cityOrMarket ?? '').trim().slice(0, 120);
  const projectName = (raw.projectName ?? '').trim().slice(0, 100);
  const targetAudience = (raw.targetAudience ?? '').trim().slice(0, 160);
  const budgetTier = (raw.budgetTier ?? '3,000 - 15,000 ج.م').trim().slice(0, 80);
  const trafficGoal = (raw.trafficGoal ?? '').trim().slice(0, 160);
  const customQuery = (raw.customQuery ?? '').trim().slice(0, 500);

  if (!projectType) {
    return { ok: false, errorAr: 'يرجى تحديد نوع المشروع أو النشاط التجاري أولاً.' };
  }
  if (!cityOrMarket) {
    return { ok: false, errorAr: 'يرجى تحديد المدينة أو السوق المستهدف.' };
  }
  if (!trafficGoal) {
    return { ok: false, errorAr: 'يرجى اختيار أو كتابة هدف الحملة والترافيك.' };
  }

  return {
    ok: true,
    brief: {
      projectName,
      projectType,
      cityOrMarket,
      targetAudience,
      budgetTier,
      trafficGoal,
      customQuery,
    },
  };
}

export interface RawGroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export function parseGroundingSources(
  chunks?: readonly RawGroundingChunk[] | null
): AiGroundSource[] {
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const out: AiGroundSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri?.trim();
    if (!uri) continue;
    if (!/^https?:\/\//i.test(uri)) continue;
    if (seen.has(uri)) continue;
    seen.add(uri);
    const title = chunk.web?.title?.trim() || new URL(uri).hostname;
    out.push({ title, uri });
  }

  return out;
}

export function extractPlanSections(markdown: string): AiPlanSection[] {
  const text = markdown.trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const sections: AiPlanSection[] = [];
  let currentTitle = 'ملخص الاستراتيجية الفورية';
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentLines.join('\n').trim().length > 0) {
        sections.push({
          title: currentTitle,
          body: currentLines.join('\n').trim(),
        });
      }
      currentTitle = headingMatch[1].replace(/\*\*/g, '').trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.join('\n').trim().length > 0) {
    sections.push({
      title: currentTitle,
      body: currentLines.join('\n').trim(),
    });
  }

  return sections;
}
