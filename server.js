var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_vite = require("vite");

// src/utils/strategyHelpers.ts
var TRAFFIC_GOAL_OPTIONS = [
  "\u062C\u0644\u0628 \u062A\u0631\u0627\u0641\u064A\u0643 \u0648\u0632\u064A\u0627\u0631\u0627\u062A \u0633\u0631\u064A\u0639\u0629 + \u0627\u0646\u062A\u0634\u0627\u0631 \u0641\u064A\u0631\u0648\u0633\u064A \u0631\u064A\u0644\u0632 \u0648\u062A\u064A\u0643 \u062A\u0648\u0643",
  "\u062A\u0641\u062C\u064A\u0631 \u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u062A\u062E\u0641\u064A\u0636 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 CAC",
  "\u062A\u0635\u062F\u0631 \u062E\u0631\u0627\u0626\u0637 \u062C\u0648\u062C\u0644 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 (Local SEO) \u0648\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
  "\u0634\u0631\u0627\u0643\u0627\u062A \u0639\u0645\u0648\u0644\u0629 CPL + \u062C\u0648\u0644\u0627\u062A VR/WebAR \u0644\u062D\u062C\u0632 \u0627\u0644\u063A\u0631\u0641 \u0648\u0627\u0644\u0648\u062D\u062F\u0627\u062A",
  "\u0645\u0628\u064A\u0639\u0627\u062A \u0641\u0648\u0631\u064A\u0629 \u0639\u0628\u0631 QR \u0648\u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0628\u0627\u0644\u0639\u0645\u0648\u0644\u0629 (Affiliate CPS/CPL)",
  "\u062C\u0630\u0628 \u0639\u0645\u0644\u0627\u0621 \u0634\u0631\u0643\u0627\u062A \u0648\u0635\u0641\u0642\u0627\u062A \u0643\u0628\u0631\u0649 (B2B ABM)"
];
var PROJECT_PRESETS = [
  {
    id: "mansoura-restaurant",
    label: "\u0645\u0637\u0639\u0645 \u0648\u0643\u0627\u0641\u064A\u0647 \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629",
    brief: {
      projectName: "\u0645\u0634\u0648\u064A\u0627\u062A \u0648\u0643\u0627\u0641\u064A\u0647 \u0627\u0644\u0646\u064A\u0644",
      projectType: "\u0645\u0637\u0639\u0645 \u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0633\u0631\u064A\u0639\u0629 \u0648\u0643\u0627\u0641\u064A\u0647 \u0634\u0628\u0627\u0628\u064A",
      cityOrMarket: "\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629 (\u0634\u0627\u0631\u0639 \u0627\u0644\u0645\u0634\u0627\u064A\u0629 \u0627\u0644\u0633\u0641\u0644\u064A\u0629 \u0648\u062D\u064A \u0627\u0644\u062C\u0627\u0645\u0639\u0629)",
      targetAudience: "\u0637\u0644\u0627\u0628 \u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629 \u0648\u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u0627\u0644\u0634\u0628\u0627\u0628",
      budgetTier: "3,000 - 15,000 \u062C.\u0645 (\u0646\u0645\u0648\u0630\u062C \u063A\u0648\u0631\u064A\u0644\u0627 \u0627\u0644\u0630\u0643\u064A)",
      trafficGoal: TRAFFIC_GOAL_OPTIONS[0],
      customQuery: "\u0623\u0631\u064A\u062F \u062E\u0637\u0629 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0628\u062F\u0645\u062C FOOH \u0648WebAR \u0648\u0628\u0637\u0627\u0642\u0627\u062A QR \u0628\u0627\u0644\u0639\u0645\u0648\u0644\u0629 \u0644\u0631\u0641\u0639 \u0627\u0644\u062A\u0631\u0627\u0641\u064A\u0643 \u062E\u0644\u0627\u0644 14 \u064A\u0648\u0645\u0627\u064B"
    }
  },
  {
    id: "fashion-ecommerce",
    label: "\u0645\u062A\u062C\u0631 \u0645\u0644\u0627\u0628\u0633 \u0623\u0648\u0646\u0644\u0627\u064A\u0646",
    brief: {
      projectName: "\u0628\u0631\u0627\u0646\u062F \u0633\u062A\u0631\u064A\u062A \u0648\u064A\u0631 \u0645\u062D\u0644\u064A",
      projectType: "\u0645\u062A\u062C\u0631 \u062A\u062C\u0627\u0631\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0644\u0644\u0645\u0644\u0627\u0628\u0633 \u0627\u0644\u0639\u0635\u0631\u064A\u0629 (E-Commerce)",
      cityOrMarket: "\u0645\u0635\u0631 \u2014 \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0648\u0627\u0644\u062C\u064A\u0632\u0629 \u0648\u0627\u0644\u062F\u0644\u062A\u0627",
      targetAudience: "\u0634\u0628\u0627\u0628 \u0648\u0628\u0646\u0627\u062A \u062C\u064A\u0644 Z (18\u201328 \u0633\u0646\u0629)",
      budgetTier: "\u0635\u0641\u0631 - 3,000 \u062C.\u0645 (\u0623\u0641\u0643\u0627\u0631 \u0634\u0628\u0647 \u0645\u062C\u0627\u0646\u064A\u0629)",
      trafficGoal: TRAFFIC_GOAL_OPTIONS[1],
      customQuery: "\u0643\u064A\u0641 \u0623\u062C\u0645\u0639 \u0645\u062D\u062A\u0648\u0649 UGC \u0645\u062C\u0627\u0646\u064A \u0645\u0646 \u0627\u0644\u0645\u0627\u0631\u0629 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0623\u062D\u0648\u0644\u0647 \u0644\u0632\u064A\u0627\u0631\u0627\u062A \u0648\u0645\u0628\u064A\u0639\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639\u061F"
    }
  },
  {
    id: "dental-clinic",
    label: "\u0639\u064A\u0627\u062F\u0629 \u0623\u0633\u0646\u0627\u0646 \u0648\u062A\u062C\u0645\u064A\u0644",
    brief: {
      projectName: "\u0639\u064A\u0627\u062F\u0629 \u0633\u0645\u0627\u064A\u0644 \u062F\u064A\u0632\u0627\u064A\u0646",
      projectType: "\u0639\u064A\u0627\u062F\u0629 \u0637\u0628 \u0648\u062A\u062C\u0645\u064A\u0644 \u0627\u0644\u0623\u0633\u0646\u0627\u0646",
      cityOrMarket: "\u0645\u0635\u0631 \u2014 \u062D\u064A \u0633\u0643\u0646\u064A \u0648\u0645\u062F\u064A\u0646\u0629 \u062C\u0627\u0645\u0639\u064A\u0629",
      targetAudience: "\u0627\u0644\u0645\u0648\u0638\u0641\u0648\u0646 \u0648\u0627\u0644\u0623\u0633\u0631 \u0648\u0627\u0644\u0628\u0627\u062D\u062B\u0648\u0646 \u0639\u0646 \u062A\u062C\u0645\u064A\u0644 \u0627\u0644\u0623\u0633\u0646\u0627\u0646",
      budgetTier: "3,000 - 15,000 \u062C.\u0645 (\u0646\u0645\u0648\u0630\u062C \u063A\u0648\u0631\u064A\u0644\u0627 \u0627\u0644\u0630\u0643\u064A)",
      trafficGoal: TRAFFIC_GOAL_OPTIONS[2],
      customQuery: "\u0627\u0642\u062A\u0631\u062D \u062D\u0645\u0644\u0627\u062A \u063A\u0648\u0631\u064A\u0644\u0627 \u0637\u0628\u064A\u0629 \u0623\u062E\u0644\u0627\u0642\u064A\u0629 \u062A\u0632\u064A\u062F \u0627\u0644\u0628\u062D\u062B \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0648\u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0639\u0644\u0649 \u062C\u0648\u062C\u0644 \u0645\u0627\u0628\u0633 \u0628\u062F\u0648\u0646 \u0645\u062E\u0627\u0644\u0641\u0629 \u0642\u0627\u0646\u0648\u0646\u064A\u0629"
    }
  },
  {
    id: "hotel-realestate",
    label: "\u0641\u0646\u062F\u0642 \u0623\u0648 \u0645\u0634\u0631\u0648\u0639 \u0639\u0642\u0627\u0631\u064A",
    brief: {
      projectName: "\u0625\u0642\u0627\u0645\u0629 \u0648\u0641\u0646\u062F\u0642 \u0643\u0648\u0631\u0646\u064A\u0634 \u0627\u0644\u0646\u064A\u0644",
      projectType: "\u0641\u0646\u062F\u0642 \u0628\u0648\u062A\u064A\u0643 / \u0648\u062D\u062F\u0627\u062A \u0641\u0646\u062F\u0642\u064A\u0629 \u0648\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0639\u0642\u0627\u0631\u064A",
      cityOrMarket: "\u0645\u0635\u0631 \u2014 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0633\u064A\u0627\u062D\u064A\u0629 \u0648\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0627\u0644\u062F\u0644\u062A\u0627",
      targetAudience: "\u0636\u064A\u0648\u0641 \u0627\u0644\u0633\u064A\u0627\u062D\u0629 \u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062A B2B",
      budgetTier: "15,000 - 50,000 \u062C.\u0645 (\u062D\u0645\u0644\u0629 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 FOOH + WebAR)",
      trafficGoal: TRAFFIC_GOAL_OPTIONS[3],
      customQuery: "\u0643\u064A\u0641 \u0623\u0637\u0628\u0642 \u0623\u0643\u0634\u0627\u0643 VR \u0623\u0648 \u0637\u0631\u0648\u062F B2B ABM \u0645\u0639 \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0644\u062C\u0644\u0628 \u062D\u062C\u0648\u0632\u0627\u062A \u0645\u0633\u062A\u0645\u0631\u0629\u061F"
    }
  }
];
function validateProjectBrief(raw) {
  const projectType = (raw.projectType ?? "").trim().slice(0, 140);
  const cityOrMarket = (raw.cityOrMarket ?? "").trim().slice(0, 120);
  const projectName = (raw.projectName ?? "").trim().slice(0, 100);
  const targetAudience = (raw.targetAudience ?? "").trim().slice(0, 160);
  const budgetTier = (raw.budgetTier ?? "3,000 - 15,000 \u062C.\u0645").trim().slice(0, 80);
  const trafficGoal = (raw.trafficGoal ?? "").trim().slice(0, 160);
  const customQuery = (raw.customQuery ?? "").trim().slice(0, 500);
  if (!projectType) {
    return { ok: false, errorAr: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0646\u0648\u0639 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0623\u0648 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0623\u0648\u0644\u0627\u064B." };
  }
  if (!cityOrMarket) {
    return { ok: false, errorAr: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0623\u0648 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641." };
  }
  if (!trafficGoal) {
    return { ok: false, errorAr: "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0623\u0648 \u0643\u062A\u0627\u0628\u0629 \u0647\u062F\u0641 \u0627\u0644\u062D\u0645\u0644\u0629 \u0648\u0627\u0644\u062A\u0631\u0627\u0641\u064A\u0643." };
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
      customQuery
    }
  };
}
function parseGroundingSources(chunks) {
  if (!Array.isArray(chunks)) return [];
  const seen = /* @__PURE__ */ new Set();
  const out = [];
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
function extractPlanSections(markdown) {
  const text = markdown.trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const sections = [];
  let currentTitle = "\u0645\u0644\u062E\u0635 \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629";
  let currentLines = [];
  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentLines.join("\n").trim().length > 0) {
        sections.push({
          title: currentTitle,
          body: currentLines.join("\n").trim()
        });
      }
      currentTitle = headingMatch[1].replace(/\*\*/g, "").trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.join("\n").trim().length > 0) {
    sections.push({
      title: currentTitle,
      body: currentLines.join("\n").trim()
    });
  }
  return sections;
}

// server.ts
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var PORT = Number(process.env.PORT) || 3e3;
var MODEL_ID = "gemini-4-hydrogen";
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "1mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      model: MODEL_ID,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY) && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    });
  });
  app.post("/api/guerrilla-plan", async (req, res) => {
    const validation = validateProjectBrief(req.body ?? {});
    if (validation.ok === false) {
      return res.status(400).json({ error: validation.errorAr });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(503).json({
        error: "\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (GEMINI_API_KEY) \u063A\u064A\u0631 \u0645\u0647\u064A\u0623 \u0639\u0644\u0649 \u0627\u0644\u062E\u0627\u062F\u0645 \u062D\u0627\u0644\u064A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0625\u0636\u0627\u0641\u062A\u0647 \u0641\u064A \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0628\u064A\u0626\u0629 (Secrets) \u0644\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u0639\u0644\u064A."
      });
    }
    const { brief } = validation;
    try {
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemInstruction = `\u0623\u0646\u062A \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u062A\u0633\u0648\u064A\u0642 \u063A\u0648\u0631\u064A\u0644\u0627 (Guerrilla Marketing) \u0648\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A \u0646\u0645\u0648 \u0648\u062C\u0644\u0628 \u062A\u0631\u0627\u0641\u064A\u0643 (Growth & Traffic Strategist) \u0645\u062D\u062A\u0631\u0641.
\u0645\u0647\u0645\u062A\u0643 \u0645\u0633\u0627\u0639\u062F\u0629 \u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u0627\u0644\u0637\u0644\u0627\u0628 \u0639\u0644\u0649 \u062A\u062D\u0648\u064A\u0644 \u0623\u064A \u0641\u0643\u0631\u0629 \u0645\u0634\u0631\u0648\u0639 \u0625\u0644\u0649 \u062E\u0637\u0629 \u062A\u0646\u0641\u064A\u0630 \u0639\u0645\u0644\u064A\u0629 \u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u062C\u0644\u0628 \u0627\u0644\u062A\u0631\u0627\u0641\u064A\u0643 \u0648\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0628\u0623\u0642\u0644 \u0645\u064A\u0632\u0627\u0646\u064A\u0629\u060C \u0628\u0627\u0644\u0631\u0628\u0637 \u0628\u064A\u0646 \u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0627\u0644\u063A\u0648\u0631\u064A\u0644\u0627 \u0648(UGC\u060C \u0648\u0627\u0644\u0640 WebAR\u060C \u0648FOOH\u060C \u0648\u0627\u0644\u0640 QR\u060C \u0648\u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0628\u0627\u0644\u0639\u0645\u0648\u0644\u0629 Affiliate\u060C \u0648\u0627\u0644\u0631\u0642\u0645\u064A\u060C \u0648\u0627\u0644\u0640 Local SEO).
\u0627\u0633\u062A\u062E\u062F\u0645 \u0628\u062D\u062B \u062C\u0648\u062C\u0644 \u0627\u0644\u062D\u064A (Google Search) \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u062A\u062C\u0627\u0647\u0627\u062A \u0627\u0644\u0633\u0648\u0642 \u0623\u0648 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646 \u0623\u0648 \u0623\u0641\u0643\u0627\u0631 \u0627\u0644\u062D\u0645\u0644\u0627\u062A \u0627\u0644\u0648\u0627\u0642\u0639\u064A\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637 \u0648\u0627\u0644\u0645\u0648\u0642\u0639.
\u0627\u0643\u062A\u0628 \u0627\u0644\u0631\u062F \u0628\u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u0627\u0636\u062D\u0629 \u0645\u0639 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0628\u062C\u0627\u0646\u0628\u0647\u0627.
\u0627\u0644\u062A\u0632\u0645 \u0628\u062A\u0642\u0633\u064A\u0645 \u0627\u0644\u0631\u062F \u0625\u0644\u0649 5 \u0623\u0642\u0633\u0627\u0645 \u0631\u0626\u064A\u0633\u064A\u0629 \u062A\u0628\u062F\u0623 \u062F\u0627\u0626\u0645\u0627\u064B \u0628\u0640 ## \u0628\u0647\u0630\u0627 \u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062F\u0642\u064A\u0642:
## 1. \u0641\u0643\u0631\u0629 \u0627\u0644\u063A\u0648\u0631\u064A\u0644\u0627 \u0627\u0644\u062E\u0627\u0637\u0641\u0629 \u0648\u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u062A\u0631\u0627\u0641\u064A\u0643 \u0627\u0644\u0645\u062C\u0627\u0646\u064A (Pattern Interrupt & Viral Hook)
## 2. \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 (\u0645\u0646 \u0627\u0644\u064A\u0648\u0645 1 \u0625\u0644\u0649 \u0627\u0644\u064A\u0648\u0645 14)
## 3. \u0645\u062D\u0631\u0643\u0627\u062A \u062C\u0644\u0628 \u0627\u0644\u062A\u0631\u0627\u0641\u064A\u0643 \u0648\u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644 (UGC + WebAR/FOOH + QR + Affiliate + Local SEO)
## 4. \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A\u0629 \u0627\u0644\u0630\u0643\u064A\u0629 \u0648\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0646\u0641\u0627\u0642
## 5. \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629 (Target KPIs: ROI, CAC, EMV, Traffic)`;
      const userPrompt = `\u0623\u0639\u062F \u062E\u0637\u0629 \u062A\u0633\u0648\u064A\u0642 \u063A\u0648\u0631\u064A\u0644\u0627 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0634\u0631\u0648\u0639:
- \u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 / \u0627\u0644\u0639\u0644\u0627\u0645\u0629: ${brief.projectName || "\u0645\u0634\u0631\u0648\u0639 \u062C\u062F\u064A\u062F"}
- \u0646\u0648\u0639 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 / \u0627\u0644\u0646\u0634\u0627\u0637: ${brief.projectType}
- \u0627\u0644\u0645\u062F\u064A\u0646\u0629 / \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641: ${brief.cityOrMarket}
- \u0627\u0644\u062C\u0645\u0647\u0648\u0631 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641: ${brief.targetAudience || "\u0627\u0644\u062C\u0645\u0647\u0648\u0631 \u0627\u0644\u0645\u062D\u0644\u064A \u0648\u0627\u0644\u0634\u0628\u0627\u0628 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0648\u0646"}
- \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A\u0629: ${brief.budgetTier}
- \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u062C\u0644\u0628 \u0627\u0644\u062A\u0631\u0627\u0641\u064A\u0643: ${brief.trafficGoal}
- \u0633\u0624\u0627\u0644 \u0623\u0648 \u062A\u0631\u0643\u064A\u0632 \u062E\u0627\u0635 \u0645\u0646 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${brief.customQuery || "\u062A\u0642\u062F\u064A\u0645 \u0623\u0633\u0631\u0639 \u0648\u0623\u0630\u0643\u0649 \u062E\u0637\u0629 \u0644\u062C\u0644\u0628 \u062A\u0631\u0627\u0641\u064A\u0643 \u0639\u0627\u0644\u064A \u0648\u0645\u0628\u064A\u0639\u0627\u062A \u0641\u0648\u0631\u064A\u0629"}`;
      let response;
      try {
        response = await ai.models.generateContent({
          model: MODEL_ID,
          contents: userPrompt,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
            temperature: 0.7
          }
        });
      } catch (searchErr) {
        const searchErrText = searchErr instanceof Error ? searchErr.message : String(searchErr);
        if (!searchErrText.includes("API_KEY_INVALID")) {
          response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
        } else {
          throw searchErr;
        }
      }
      const markdown = (response.text || "").trim();
      if (!markdown) {
        return res.status(502).json({
          error: "\u0644\u0645 \u064A\u064F\u0631\u062C\u0639 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0646\u062A\u064A\u062C\u0629 \u0646\u0635\u064A\u0629 \u0635\u0627\u0644\u062D\u0629. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629."
        });
      }
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = parseGroundingSources(groundingMetadata?.groundingChunks);
      const searchQueries = Array.isArray(groundingMetadata?.webSearchQueries) ? groundingMetadata.webSearchQueries : [];
      const sections = extractPlanSections(markdown);
      return res.json({
        markdown,
        sections,
        sources,
        searchQueries,
        model: MODEL_ID
      });
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.";
      console.error("Gemini guerrilla-plan error:", rawMessage);
      if (rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({
          error: "\u062A\u0645 \u0628\u0644\u0648\u063A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u0644\u062D\u0635\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u0644\u0645\u062D\u0631\u0643 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (429 Quota Exceeded). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F \u0642\u0644\u064A\u0644 \u0623\u0648 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0631\u0635\u064A\u062F \u0645\u0641\u062A\u0627\u062D GEMINI_API_KEY."
        });
      }
      if (rawMessage.includes("401") || rawMessage.includes("403") || rawMessage.includes("API_KEY")) {
        return res.status(403).json({
          error: "\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (GEMINI_API_KEY) \u0644\u0627 \u064A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0623\u0648 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D. \u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u062A\u0647 \u0641\u064A \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0628\u064A\u0626\u0629."
        });
      }
      return res.status(502).json({
        error: "\u062A\u0639\u0630\u0651\u0631 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u062E\u0644\u0627\u0644 \u0644\u062D\u0638\u0627\u062A."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distDir = import_path.default.resolve(__dirname, "dist");
    app.use(import_express.default.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(import_path.default.join(distDir, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
