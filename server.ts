import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  extractPlanSections,
  parseGroundingSources,
  validateProjectBrief,
} from './src/utils/strategyHelpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_ID = 'gemini-4-hydrogen';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      model: MODEL_ID,
      aiConfigured:
        Boolean(process.env.GEMINI_API_KEY) &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    });
  });

  app.post('/api/guerrilla-plan', async (req: Request, res: Response) => {
    const validation = validateProjectBrief(req.body ?? {});
    if (validation.ok === false) {
      return res.status(400).json({ error: validation.errorAr });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        error:
          'مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ على الخادم حالياً. يرجى إضافته في إعدادات البيئة (Secrets) للتشغيل الفعلي.',
      });
    }

    const { brief } = validation;

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `أنت استشاري تسويق غوريلا (Guerrilla Marketing) واستراتيجي نمو وجلب ترافيك (Growth & Traffic Strategist) محترف.
مهمتك مساعدة أصحاب المشاريع والطلاب على تحويل أي فكرة مشروع إلى خطة تنفيذ عملية حقيقية لجلب الترافيك والمبيعات بأقل ميزانية، بالربط بين التسويق الغوريلا و(UGC، والـ WebAR، وFOOH، والـ QR، والتسويق بالعمولة Affiliate، والرقمي، والـ Local SEO).
استخدم بحث جوجل الحي (Google Search) للتحقق من اتجاهات السوق أو المنافسين أو أفكار الحملات الواقعية المناسبة لهذا النشاط والموقع.
اكتب الرد بلغة عربية احترافية واضحة مع كتابة المصطلحات التسويقية الإنجليزية الكاملة بجانبها.
التزم بتقسيم الرد إلى 5 أقسام رئيسية تبدأ دائماً بـ ## بهذا الترتيب الدقيق:
## 1. فكرة الغوريلا الخاطفة وصناعة الترافيك المجاني (Pattern Interrupt & Viral Hook)
## 2. خطوات التنفيذ العملية (من اليوم 1 إلى اليوم 14)
## 3. محركات جلب الترافيك والربط المتكامل (UGC + WebAR/FOOH + QR + Affiliate + Local SEO)
## 4. الميزانية التقديرية الذكية وتوزيع الإنفاق
## 5. مؤشرات الأداء المستهدفة (Target KPIs: ROI, CAC, EMV, Traffic)`;

      const userPrompt = `أعد خطة تسويق غوريلا احترافية وجاهزة للتنفيذ لهذا المشروع:
- اسم المشروع / العلامة: ${brief.projectName || 'مشروع جديد'}
- نوع المشروع / النشاط: ${brief.projectType}
- المدينة / السوق المستهدف: ${brief.cityOrMarket}
- الجمهور المستهدف: ${brief.targetAudience || 'الجمهور المحلي والشباب والعملاء المحتملون'}
- الميزانية التقديرية: ${brief.budgetTier}
- الهدف الرئيسي وجلب الترافيك: ${brief.trafficGoal}
- سؤال أو تركيز خاص من المستخدم: ${brief.customQuery || 'تقديم أسرع وأذكى خطة لجلب ترافيك عالي ومبيعات فورية'}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: MODEL_ID,
          contents: userPrompt,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
            temperature: 0.7,
          },
        });
      } catch (searchErr) {
        const searchErrText =
          searchErr instanceof Error ? searchErr.message : String(searchErr);
        // Retry cleanly with pure gemini-4-hydrogen only if Search tool call failed due to tool/400/quota while text model may succeed
        if (!searchErrText.includes('API_KEY_INVALID')) {
          response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
        } else {
          throw searchErr;
        }
      }

      const markdown = (response.text || '').trim();
      if (!markdown) {
        return res.status(502).json({
          error: 'لم يُرجع نموذج الذكاء الاصطناعي نتيجة نصية صالحة. يرجى إعادة المحاولة.',
        });
      }

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = parseGroundingSources(groundingMetadata?.groundingChunks);
      const searchQueries = Array.isArray(groundingMetadata?.webSearchQueries)
        ? groundingMetadata.webSearchQueries
        : [];
      const sections = extractPlanSections(markdown);

      return res.json({
        markdown,
        sections,
        sources,
        searchQueries,
        model: MODEL_ID,
      });
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي.';
      console.error('Gemini guerrilla-plan error:', rawMessage);

      if (rawMessage.includes('429') || rawMessage.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error:
            'تم بلوغ الحد المؤقت لحصة الاستخدام المجانية لمحرك الذكاء الاصطناعي (429 Quota Exceeded). يرجى المحاولة بعد قليل أو التحقق من رصيد مفتاح GEMINI_API_KEY.',
        });
      }

      if (rawMessage.includes('401') || rawMessage.includes('403') || rawMessage.includes('API_KEY')) {
        return res.status(403).json({
          error:
            'مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) لا يملك صلاحية التشغيل أو غير صحيح. يرجى مراجعته في إعدادات البيئة.',
        });
      }

      return res.status(502).json({
        error: 'تعذّر إتمام البحث بالذكاء الاصطناعي مؤقتاً. يرجى إعادة المحاولة خلال لحظات.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
