import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  filterNodesByPreset,
  getIntersectionsForNode,
  getNextNodeId,
  MIND_MAP_CENTER,
  MIND_MAP_NODES,
  MIND_MAP_PRESETS,
  MindMapNode,
  MindMapPresetId,
  NodeAccent,
  STRATEGIC_INTERSECTIONS,
} from '../data/mindMapData';
import { ArrowLeftRight, GitBranch, Pause, Play, SkipBack } from 'lucide-react';

const ACCENT_STYLES: Record<
  NodeAccent,
  {
    stroke: string;
    activeFillLight: string;
    badgeBg: string;
    metricText: string;
    curveStroke: string;
  }
> = {
  amber: {
    stroke: '#d97706',
    activeFillLight: 'stroke-amber-600 dark:stroke-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-900 dark:bg-amber-500/25 dark:text-amber-200',
    metricText: 'fill-amber-700 dark:fill-amber-300',
    curveStroke: '#d97706',
  },
  indigo: {
    stroke: '#4f46e5',
    activeFillLight: 'stroke-indigo-600 dark:stroke-indigo-400',
    badgeBg: 'bg-indigo-500/15 text-indigo-900 dark:bg-indigo-500/25 dark:text-indigo-200',
    metricText: 'fill-indigo-700 dark:fill-indigo-300',
    curveStroke: '#4f46e5',
  },
  red: {
    stroke: '#dc2626',
    activeFillLight: 'stroke-red-600 dark:stroke-red-400',
    badgeBg: 'bg-red-600/15 text-red-800 dark:bg-red-500/25 dark:text-red-200',
    metricText: 'fill-red-700 dark:fill-red-300',
    curveStroke: '#dc2626',
  },
  emerald: {
    stroke: '#059669',
    activeFillLight: 'stroke-emerald-600 dark:stroke-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-200',
    metricText: 'fill-emerald-700 dark:fill-emerald-300',
    curveStroke: '#059669',
  },
  sky: {
    stroke: '#0284c7',
    activeFillLight: 'stroke-sky-600 dark:stroke-sky-400',
    badgeBg: 'bg-sky-500/15 text-sky-900 dark:bg-sky-500/25 dark:text-sky-200',
    metricText: 'fill-sky-700 dark:fill-sky-300',
    curveStroke: '#0284c7',
  },
};

function buildRadialCurve(nx: number, ny: number): string {
  const cx = MIND_MAP_CENTER.x;
  const cy = MIND_MAP_CENTER.y;
  const dx = nx - cx;
  const dy = ny - cy;
  const mx = cx + dx * 0.52 - dy * 0.09;
  const my = cy + dy * 0.52 + dx * 0.09;
  return `M ${cx} ${cy} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${nx} ${ny}`;
}

function buildSynergyCurve(a: MindMapNode, b: MindMapNode): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const cx = MIND_MAP_CENTER.x;
  const cy = MIND_MAP_CENTER.y;
  // Pull slightly toward center or push slightly outward for smooth readability
  const pullX = mx + (mx - cx) * 0.18;
  const pullY = my + (my - cy) * 0.18;
  return `M ${a.x} ${a.y} Q ${pullX.toFixed(1)} ${pullY.toFixed(1)} ${b.x} ${b.y}`;
}

export const GuerrillaMindMap: React.FC = () => {
  const [activePreset, setActivePreset] = useState<MindMapPresetId>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ugc');
  const [showCrossLinks, setShowCrossLinks] = useState<boolean>(true);
  const [autoTour, setAutoTour] = useState<boolean>(false);

  const visibleNodes = useMemo(
    () => filterNodesByPreset(activePreset),
    [activePreset]
  );

  const visibleIdSet = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  const selectedNode = useMemo(
    () => MIND_MAP_NODES.find((n) => n.id === selectedNodeId) ?? MIND_MAP_NODES[0],
    [selectedNodeId]
  );

  const nodeIntersections = useMemo(
    () => getIntersectionsForNode(selectedNode.id),
    [selectedNode.id]
  );

  const activePresetMeta = useMemo(
    () => MIND_MAP_PRESETS.find((p) => p.id === activePreset) ?? MIND_MAP_PRESETS[0],
    [activePreset]
  );

  useEffect(() => {
    if (!autoTour) return;
    const timer = window.setInterval(() => {
      setSelectedNodeId((prev) => getNextNodeId(prev, visibleNodes));
    }, 4200);
    return () => window.clearInterval(timer);
  }, [autoTour, visibleNodes]);

  const handleSelectPreset = (presetId: MindMapPresetId) => {
    setActivePreset(presetId);
    setAutoTour(false);
    const matching = filterNodesByPreset(presetId);
    if (matching.length > 0 && !matching.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(matching[0].id);
    }
  };

  const handleSelectNode = (nodeId: string) => {
    setAutoTour(false);
    setSelectedNodeId(nodeId);
  };

  const handleStepNext = () => {
    setAutoTour(false);
    setSelectedNodeId((prev) => getNextNodeId(prev, visibleNodes));
  };

  return (
    <div
      data-testid="guerrilla-mind-map"
      className="flex flex-col gap-2.5"
    >
      {/* Top Interactive Control & Perspective Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-300/85 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-[#0f172a]/90">
        <div
          role="tablist"
          aria-label="أوضاع الخريطة الذهنية الاستراتيجية"
          className="flex flex-wrap items-center gap-1.5"
        >
          {MIND_MAP_PRESETS.map((preset) => {
            const isActive = preset.id === activePreset;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectPreset(preset.id)}
                className={`min-h-[38px] rounded-xl px-3.5 py-1.5 font-display text-xs font-black whitespace-nowrap transition-all lg:text-[13px] ${
                  isActive
                    ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(220,38,38,0.35)]'
                    : 'border border-slate-300/80 bg-slate-50/90 text-slate-900 hover:border-red-500/60 hover:bg-red-50/60 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={showCrossLinks}
            onClick={() => setShowCrossLinks((v) => !v)}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 font-display text-xs font-extrabold whitespace-nowrap transition-colors ${
              showCrossLinks
                ? 'border-sky-500/60 bg-sky-50/95 text-sky-900 dark:border-sky-500/50 dark:bg-sky-950/45 dark:text-sky-200'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
            <span>مسارات التقاطع البينية</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoTour((t) => !t)}
            aria-pressed={autoTour}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 font-display text-xs font-extrabold whitespace-nowrap transition-colors ${
              autoTour
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            }`}
          >
            {autoTour ? (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{autoTour ? 'إيقاف الاستعراض' : 'استعراض آلي'}</span>
          </button>

          <button
            type="button"
            onClick={handleStepNext}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 font-display text-xs font-extrabold whitespace-nowrap text-white transition-colors hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <span>التالي</span>
            <SkipBack className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Split Sandbox: Interactive Neural Mind Map + Inspector */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
        {/* Right/Top Stage in RTL: Interactive Vector Mind Map */}
        <div className="flex flex-col justify-start gap-2 rounded-2xl border border-slate-300/85 bg-white/92 p-2.5 shadow-sm backdrop-blur-md lg:col-span-7 dark:border-slate-700/80 dark:bg-[#0c1322]/92">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-xs font-extrabold text-slate-700 lg:text-[13px] dark:text-slate-200">
              {activePresetMeta.summary}
            </p>
            <span className="en text-xs font-black text-red-700 dark:text-red-400">
              اضغط على أي عقدة لاستعراض التقاطع
            </span>
          </div>

          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50/90 via-white to-red-50/40 dark:border-slate-800 dark:from-[#090f1c] dark:via-[#0e1526] dark:to-[#1a0b10]">
            <svg
              viewBox="0 0 860 540"
              role="img"
              aria-label="خريطة ذهنية تفاعلية للربط بين التسويق الغوريلا وأنواع التسويق الأخرى"
              className="h-auto max-h-[410px] w-full select-none"
            >
              <defs>
                <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#dc2626" floodOpacity="0.22" />
                </filter>
                <filter id="hubGlow" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#dc2626" floodOpacity="0.34" />
                </filter>
              </defs>

              {/* Concentric Orbital Rings */}
              <ellipse
                cx={MIND_MAP_CENTER.x}
                cy={MIND_MAP_CENTER.y}
                rx={195}
                ry={124}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                strokeDasharray="5 6"
                className="text-slate-300/80 dark:text-slate-700/70"
              />
              <ellipse
                cx={MIND_MAP_CENTER.x}
                cy={MIND_MAP_CENTER.y}
                rx={308}
                ry={202}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                strokeDasharray="4 8"
                className="text-slate-300/70 dark:text-slate-700/60"
              />

              {/* Cross-Branch Strategic Synergy Intersections */}
              {showCrossLinks &&
                STRATEGIC_INTERSECTIONS.map((edge) => {
                  const fromNode = MIND_MAP_NODES.find((n) => n.id === edge.fromId);
                  const toNode = MIND_MAP_NODES.find((n) => n.id === edge.toId);
                  if (!fromNode || !toNode) return null;

                  const inPreset =
                    visibleIdSet.has(fromNode.id) && visibleIdSet.has(toNode.id);
                  const touchesSelected =
                    selectedNodeId === fromNode.id || selectedNodeId === toNode.id;

                  const pathD = buildSynergyCurve(fromNode, toNode);

                  return (
                    <g
                      key={edge.id}
                      style={{
                        opacity: inPreset ? (touchesSelected ? 1 : 0.34) : 0.08,
                        transition: 'opacity 220ms ease',
                      }}
                    >
                      <path
                        d={pathD}
                        fill="none"
                        stroke={touchesSelected ? '#dc2626' : '#64748b'}
                        strokeWidth={touchesSelected ? 2.8 : 1.5}
                        strokeDasharray={touchesSelected ? '8 4' : '4 5'}
                      />
                      {touchesSelected && inPreset && (
                        <circle r="4.5" fill="#dc2626">
                          <animateMotion dur="2.6s" repeatCount="indefinite" path={pathD} />
                        </circle>
                      )}
                    </g>
                  );
                })}

              {/* Radial Connectors: Guerrilla Core -> 8 Branches */}
              {MIND_MAP_NODES.map((node) => {
                const inPreset = visibleIdSet.has(node.id);
                const isSelected = selectedNodeId === node.id;
                const style = ACCENT_STYLES[node.accent];
                const d = buildRadialCurve(node.x, node.y);

                return (
                  <g
                    key={`radial-${node.id}`}
                    style={{
                      opacity: inPreset ? (isSelected ? 1 : 0.72) : 0.15,
                      transition: 'opacity 220ms ease',
                    }}
                  >
                    <path
                      d={d}
                      fill="none"
                      stroke={style.curveStroke}
                      strokeWidth={isSelected ? 3.8 : 2}
                      strokeLinecap="round"
                    />
                    {isSelected && (
                      <circle r="5" fill={style.stroke}>
                        <animateMotion dur="1.9s" repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Central Hub Node: Guerrilla Marketing Core */}
              <g filter="url(#hubGlow)">
                <rect
                  x={MIND_MAP_CENTER.x - 102}
                  y={MIND_MAP_CENTER.y - 44}
                  width={204}
                  height={88}
                  rx={20}
                  fill="#b91c1c"
                  stroke="#ffffff"
                  strokeWidth={3}
                />
                <text
                  x={MIND_MAP_CENTER.x}
                  y={MIND_MAP_CENTER.y - 10}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="19"
                  fontWeight="900"
                  fontFamily="Alexandria, sans-serif"
                >
                  {MIND_MAP_CENTER.arTitle}
                </text>
                <text
                  x={MIND_MAP_CENTER.x}
                  y={MIND_MAP_CENTER.y + 13}
                  textAnchor="middle"
                  fill="#fee2e2"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="Outfit, sans-serif"
                >
                  {MIND_MAP_CENTER.enTitle}
                </text>
                <text
                  x={MIND_MAP_CENTER.x}
                  y={MIND_MAP_CENTER.y + 32}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11.5"
                  fontWeight="700"
                  fontFamily="Alexandria, sans-serif"
                >
                  {MIND_MAP_CENTER.subtitle}
                </text>
              </g>

              {/* 8 Outer Interactive Marketing Nodes */}
              {MIND_MAP_NODES.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const inPreset = visibleIdSet.has(node.id);
                const isConnectedToSelected = nodeIntersections.some(
                  (e) => e.fromId === node.id || e.toId === node.id
                );
                const style = ACCENT_STYLES[node.accent];
                const boxW = 176;
                const boxH = 68;
                const rx = node.x - boxW / 2;
                const ry = node.y - boxH / 2;

                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    data-testid={`mindmap-node-${node.id}`}
                    aria-pressed={isSelected}
                    aria-label={`${node.arTitle} (${node.enTitle}) - ${node.primaryMetric}`}
                    onClick={() => handleSelectNode(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectNode(node.id);
                      }
                    }}
                    filter={isSelected ? 'url(#nodeGlow)' : undefined}
                    style={{
                      cursor: 'pointer',
                      opacity: inPreset ? 1 : 0.25,
                      transition: 'opacity 220ms ease',
                    }}
                    className="focus:outline-none"
                  >
                    {isSelected && (
                      <rect
                        x={rx - 5}
                        y={ry - 5}
                        width={boxW + 10}
                        height={boxH + 10}
                        rx={18}
                        fill="none"
                        stroke={style.stroke}
                        strokeWidth={2.5}
                        strokeDasharray="6 3"
                      />
                    )}
                    <rect
                      x={rx}
                      y={ry}
                      width={boxW}
                      height={boxH}
                      rx={14}
                      stroke={style.stroke}
                      strokeWidth={isSelected ? 3 : isConnectedToSelected ? 2.2 : 1.6}
                      className="fill-white dark:fill-slate-900"
                    />
                    <text
                      x={node.x}
                      y={node.y - 11}
                      textAnchor="middle"
                      fontSize="14.5"
                      fontWeight="900"
                      fontFamily="Alexandria, sans-serif"
                      className="fill-slate-950 dark:fill-white"
                    >
                      {node.arTitle}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 8}
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight="800"
                      fontFamily="Outfit, sans-serif"
                      className="fill-slate-600 dark:fill-slate-300"
                    >
                      {node.abbr}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 25}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="900"
                      fontFamily="Outfit, sans-serif"
                      className={style.metricText}
                    >
                      {node.primaryMetric} · {node.metricLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right/Bottom Zone: Strategic Intersection Inspector */}
        <motion.aside
          key={selectedNode.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-live="polite"
          data-testid="mindmap-inspector"
          className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-300/85 border-t-4 border-t-red-600 bg-white/92 p-3 shadow-sm backdrop-blur-md lg:col-span-5 dark:border-slate-700/80 dark:border-t-red-500 dark:bg-[#0f172a]/92"
        >
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
              <div>
                <span className={`inline-block rounded-lg px-2.5 py-0.5 font-display text-xs font-black ${ACCENT_STYLES[selectedNode.accent].badgeBg}`}>
                  <span className="en">{selectedNode.enTitle}</span>
                </span>
                <h2 className="mt-1 font-display text-base font-black text-slate-950 lg:text-[17px] dark:text-white">
                  تقاطع الغوريلا × {selectedNode.arTitle}
                </h2>
              </div>
              <div className="rounded-xl border border-red-500/35 bg-red-50/90 px-2.5 py-1 text-center dark:bg-red-950/40">
                <div className="en tabular-nums text-sm font-black text-red-700 dark:text-red-300">
                  {selectedNode.primaryMetric}
                </div>
                <div className="text-[10.5px] font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedNode.metricLabel}
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-1.5 text-[12.5px] font-bold leading-relaxed text-slate-900 lg:text-[13px] dark:text-slate-100">
              <div className="rounded-xl bg-red-50/85 p-2 dark:bg-red-950/30">
                <strong className="text-red-800 dark:text-red-300">ماذا يمنح الغوريلا لـ {selectedNode.arTitle}؟</strong>{' '}
                {selectedNode.guerrillaGives}
              </div>

              <div className="rounded-xl bg-sky-50/85 p-2 dark:bg-sky-950/30">
                <strong className="text-sky-900 dark:text-sky-300">ماذا يضيف {selectedNode.arTitle} للغوريلا؟</strong>{' '}
                {selectedNode.channelGives}
              </div>

              <div className="rounded-xl bg-slate-100/90 p-2 dark:bg-slate-900/75">
                <strong className="text-slate-950 dark:text-white">التطبيق الميداني:</strong>{' '}
                {selectedNode.executionPlaybook}
              </div>

              <div className="rounded-xl bg-emerald-50/90 p-2 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100">
                <strong className="text-emerald-800 dark:text-emerald-300">الدليل الرقمي الموثق:</strong>{' '}
                {selectedNode.proofEvidence}
              </div>
            </div>
          </div>

          {/* Connected Cross-Intersections */}
          <div className="border-t border-slate-200 pt-2.5 dark:border-slate-800">
            <div className="mb-1.5 flex items-center gap-1.5 font-display text-xs font-black text-slate-900 dark:text-slate-100">
              <ArrowLeftRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
              <span>التقاطعات المباشرة مع القنوات الأخرى (اضغط للانتقال):</span>
            </div>
            <div className="space-y-1.5">
              {nodeIntersections.map((edge) => {
                const partnerId = edge.fromId === selectedNode.id ? edge.toId : edge.fromId;
                const partnerNode = MIND_MAP_NODES.find((n) => n.id === partnerId);
                if (!partnerNode) return null;
                return (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => handleSelectNode(partnerNode.id)}
                    className="flex w-full items-start justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/95 p-2 text-right transition-colors hover:border-red-500 hover:bg-red-50/60 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-red-500/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-black text-slate-950 dark:text-white">
                        <span>{edge.titleAr}</span>
                        <span className="en text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                          ({edge.impactMetric})
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11.5px] font-bold leading-snug text-slate-700 dark:text-slate-300">
                        {edge.mechanism}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-red-600/12 px-2 py-1 font-display text-[11px] font-black text-red-700 dark:bg-red-500/20 dark:text-red-300">
                      ← {partnerNode.arTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};
