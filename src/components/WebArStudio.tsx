import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, Layers, RotateCw, Sparkles, ZoomIn } from 'lucide-react';
import { ASSET_IMAGES } from './EditorialVisual';

export type ArPresetId = 'menu' | 'hotel' | 'fooh';

interface ArPreset {
  id: ArPresetId;
  label: string;
  title: string;
  subtitle: string;
  badge: string;
  priceTag: string;
  ctaLabel: string;
  backdropImg: number;
  accentHex: string;
}

const AR_PRESETS: ArPreset[] = [
  {
    id: 'menu',
    label: '🍔 منيو 3D',
    title: 'منيو الواقع المعزز — وجبة المشاية 3D',
    subtitle: 'مجسم ثلاثي الأبعاد فوق طاولة المطعم بمجرد مسح QR',
    badge: 'WebAR MENU · 3D .GLB',
    priceTag: '190 ج.م · خصم 20% الآن',
    ctaLabel: 'اطلب الوجبة بالعمولة (CPS 15%)',
    backdropImg: 26,
    accentHex: '#dc2626',
  },
  {
    id: 'hotel',
    label: '🏨 بطاقة الفندق',
    title: 'جولة الجناح الفندقي — AR Keycard',
    subtitle: 'توجيه الكاميرا على البطاقة يفتح بوابة الغرفة على النيل',
    badge: 'PHYGITAL AR · 360° PORTAL',
    priceTag: 'ليلتان + الثالثة مجاناً',
    ctaLabel: 'احجز العرض (CPL 40 ج.م)',
    backdropImg: 22,
    accentHex: '#0284c7',
  },
  {
    id: 'fooh',
    label: '🚀 مجسم FOOH',
    title: 'مجسم عملاق فوق الشارع — CGI / FOOH',
    subtitle: 'دمج ثلاثي الأبعاد فوق واجهة شارع المشاية بالمنصورة',
    badge: 'FOOH · STREET CGI',
    priceTag: '+2.4M مشاهدة متوقعة',
    ctaLabel: 'تفعيل كود العرض في الشارع',
    backdropImg: 20,
    accentHex: '#059669',
  },
];

export const WebArStudio: React.FC = () => {
  const [presetId, setPresetId] = useState<ArPresetId>('menu');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [rotY, setRotY] = useState(18);
  const [rotX, setRotX] = useState(10);
  const [scale, setScale] = useState(1);
  const [autoSpin, setAutoSpin] = useState(true);
  const [arConversions, setArConversions] = useState(12);
  const [ctaConfirmed, setCtaConfirmed] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseY: number; baseX: number }>({
    active: false,
    startX: 0,
    startY: 0,
    baseY: 18,
    baseX: 10,
  });

  const activePreset = AR_PRESETS.find((p) => p.id === presetId) ?? AR_PRESETS[0];
  const phaseRef = useRef(0);

  // Smooth spatial AR hover sway (-28deg to +28deg) when auto-spin is active
  useEffect(() => {
    if (!autoSpin) return;
    const id = window.setInterval(() => {
      phaseRef.current += 0.08;
      const angle = Math.round(Math.sin(phaseRef.current) * 28);
      setRotY((angle + 360) % 360);
    }, 60);
    return () => window.clearInterval(id);
  }, [autoSpin]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleLiveCamera = async () => {
    if (cameraActive) {
      stopCamera();
      setCameraError(null);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('المتصفح يعمل حالياً في وضع المحاكاة الثلاثية بدون كاميرا متصلة.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraError(null);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 40);
    } catch {
      setCameraError('تم الإبقاء على بيئة المحاكاة التفاعلية لعدم توفر إذن كاميرا مباشر.');
      setCameraActive(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setAutoSpin(false);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseY: rotY,
      baseX: rotX,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setRotY(Math.round((dragRef.current.baseY + dx * 0.65 + 360) % 360));
    setRotX(Math.max(-25, Math.min(25, Math.round(dragRef.current.baseX - dy * 0.35))));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const handleTriggerArAction = () => {
    setArConversions((c) => c + 1);
    setCtaConfirmed(true);
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div
      data-testid="webar-live-studio"
      className="flex h-full flex-col justify-between gap-2.5"
    >
      {/* Top Bar: Title + Camera Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-display text-xs font-black text-slate-950 dark:text-white">
          <Sparkles className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
          <span>محاكي الواقع المعزز الحي (<span className="en">Live WebAR</span>)</span>
        </div>

        <button
          type="button"
          onClick={toggleLiveCamera}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-display text-[11px] font-extrabold transition-colors ${
            cameraActive
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border border-red-500/40 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {cameraActive ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
          <span>{cameraActive ? 'إيقاف الكاميرا' : 'تفعيل كاميرا AR'}</span>
        </button>
      </div>

      {/* AR Experience Preset Selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {AR_PRESETS.map((p) => {
          const isSelected = p.id === presetId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPresetId(p.id)}
              className={`rounded-lg px-2 py-1.5 font-display text-[11px] font-extrabold transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'border border-slate-300/80 bg-slate-50 text-slate-800 hover:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Interactive 3D WebAR Camera Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative h-52 w-full cursor-grab select-none overflow-hidden rounded-2xl border-2 border-red-500/55 bg-slate-950 shadow-[0_0_22px_rgba(239,68,68,0.22)] active:cursor-grabbing"
      >
        {/* Backdrop: Live Camera Feed OR Real Project Scene Photo */}
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={ASSET_IMAGES[activePreset.backdropImg]}
            alt={activePreset.title}
            className="h-full w-full object-cover opacity-80"
          />
        )}

        {/* AR Spatial Grid & Tracking HUD */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(6,10,20,0.68)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-white/35"
        />

        {/* HUD Top Telemetry */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2 text-[10px]">
          <span className="en rounded-md bg-slate-950/80 px-2 py-0.5 font-black text-emerald-400 backdrop-blur-xs">
            ● SLAM SURFACE LOCK · {rotY}°
          </span>
          <span className="en rounded-md bg-red-600/90 px-2 py-0.5 font-black text-white">
            {activePreset.badge}
          </span>
        </div>

        {/* 3D Floating Augmented Reality Double-Sided Hologram Card */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ perspective: '820px' }}
        >
          <div
            data-testid="webar-3d-object"
            className="relative h-32 w-56 transition-transform duration-75"
            style={{
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-white/85 bg-slate-950/86 p-3 text-center text-white shadow-[0_18px_36px_rgba(0,0,0,0.65)] backdrop-blur-md"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 shadow-inner"
                style={{ backgroundColor: activePreset.accentHex }}
              >
                <Layers className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <div className="font-display text-xs font-black text-white">{activePreset.title}</div>
              <div className="mt-0.5 line-clamp-2 text-[10px] font-semibold text-slate-200">{activePreset.subtitle}</div>
              <div className="en mt-1.5 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950">
                {activePreset.priceTag}
              </div>
            </div>

            {/* Back Face (readable when rotated 90°–270°) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-300/80 bg-slate-900/92 p-3 text-center text-white shadow-[0_18px_36px_rgba(0,0,0,0.65)] backdrop-blur-md"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="en rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                AFFILIATE UTM LINKED
              </span>
              <div className="mt-1.5 font-display text-xs font-black text-amber-300">
                تتبع مبيعات الواقع المعزز
              </div>
              <p className="mt-1 text-[10px] font-semibold leading-snug text-slate-200">
                مسح QR ← عرض 3D فوري ← احتساب عمولة المسوّق تلقائياً بدون أي تطبيق!
              </p>
            </div>
          </div>
        </div>

        {/* Interactive In-Scene CTA Button */}
        <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleTriggerArAction}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 font-display text-[11px] font-black text-white shadow-md transition-colors hover:bg-red-700"
          >
            {ctaConfirmed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : null}
            <span>{ctaConfirmed ? 'تم تسجيل طلب AR!' : activePreset.ctaLabel}</span>
          </button>

          <span
            data-testid="webar-conversions-badge"
            className="tabular-nums rounded-lg bg-slate-950/85 px-2 py-1 font-display text-[10px] font-extrabold text-emerald-300 backdrop-blur-xs"
          >
            طلبات AR: {arConversions}
          </span>
        </div>
      </div>

      {/* 3D Rotation + Scale Sliders */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-2 dark:border-slate-800 dark:bg-slate-900/80">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 dark:text-slate-200">
            <span className="inline-flex items-center gap-1">
              <RotateCw className="h-3 w-3 text-red-600" aria-hidden="true" />
              تدوير 3D
            </span>
            <button
              type="button"
              onClick={() => setAutoSpin((s) => !s)}
              className="text-[10px] font-extrabold text-red-700 underline dark:text-red-400"
            >
              {autoSpin ? 'تثبيت' : 'دوران تلقائي'}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={359}
            value={rotY}
            aria-label="زاوية تدوير المجسم ثلاثي الأبعاد"
            onChange={(e) => {
              setAutoSpin(false);
              setRotY(Number(e.target.value));
            }}
            className="mt-1 w-full accent-red-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 dark:text-slate-200">
            <span className="inline-flex items-center gap-1">
              <ZoomIn className="h-3 w-3 text-sky-600" aria-hidden="true" />
              حجم المجسم
            </span>
            <span className="en tabular-nums">{scale.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={0.75}
            max={1.3}
            step={0.05}
            value={scale}
            aria-label="حجم المجسم ثلاثي الأبعاد"
            onChange={(e) => setScale(Number(e.target.value))}
            className="mt-1 w-full accent-sky-600"
          />
        </div>
      </div>

      {cameraError && (
        <div className="rounded-lg bg-amber-50 px-2.5 py-1 text-[10.5px] font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {cameraError}
        </div>
      )}
    </div>
  );
};
