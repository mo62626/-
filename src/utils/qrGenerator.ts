/**
 * Pure ISO/IEC 18004 QR Code Matrix Generator & Affiliate Campaign Calculator.
 * Decoupled from DOM/Canvas so it can be unit-tested deterministically.
 */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

function rsGenPoly(deg: number): number[] {
  let p = [1];
  for (let i = 0; i < deg; i++) {
    const next = new Array(p.length + 1).fill(0);
    for (let j = 0; j < p.length; j++) {
      next[j] ^= p[j];
      next[j + 1] ^= gfMul(p[j], EXP[i]);
    }
    p = next;
  }
  return p;
}

function rsEncode(data: Uint8Array, eccLen: number): Uint8Array {
  const gen = rsGenPoly(eccLen);
  const res = new Uint8Array(data.length + eccLen);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

type VersionSpec = [
  version: number,
  size: number,
  totalData: number,
  eccLen: number,
  blocks: number,
  align: number[],
  verBits: number
];

const VERSIONS: Array<VersionSpec | null> = [
  null,
  [1, 21, 19, 7, 1, [], 0],
  [2, 25, 34, 10, 1, [6, 18], 0],
  [3, 29, 55, 15, 1, [6, 22], 0],
  [4, 33, 80, 20, 1, [6, 26], 0],
  [5, 37, 108, 26, 1, [6, 30], 0],
  [6, 41, 136, 18, 2, [6, 34], 0],
  [7, 45, 156, 20, 2, [6, 22, 38], 0x07c94],
  [8, 49, 194, 24, 2, [6, 24, 42], 0x085bc],
];

export interface QrMatrixResult {
  version: number;
  size: number;
  quiet: number;
  modules: boolean[][];
}

export function generateQrMatrix(text: string): QrMatrixResult {
  const bytes = new TextEncoder().encode(text);
  let v = 1;
  while (v <= 8 && (VERSIONS[v] as VersionSpec)[2] < bytes.length + 2) {
    v++;
  }
  if (v > 8) v = 8;

  const [version, size, totalData, eccLen, blocks, align, verBits] = VERSIONS[v] as VersionSpec;
  const payload = bytes.slice(0, totalData - 2);

  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  pushBits(0b0100, 4);
  pushBits(payload.length, 8);
  payload.forEach((b) => pushBits(b, 8));
  pushBits(0, Math.min(4, totalData * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataBytes.push(b);
  }
  const pads = [0xec, 0x11];
  let pi = 0;
  while (dataBytes.length < totalData) {
    dataBytes.push(pads[pi % 2]);
    pi++;
  }

  const bSize = Math.floor(totalData / blocks);
  const dBlocks: Uint8Array[] = [];
  const eBlocks: Uint8Array[] = [];
  for (let b = 0; b < blocks; b++) {
    const slice = new Uint8Array(dataBytes.slice(b * bSize, (b + 1) * bSize));
    dBlocks.push(slice);
    eBlocks.push(rsEncode(slice, eccLen));
  }

  const finalBytes: number[] = [];
  for (let i = 0; i < bSize; i++) {
    for (let b = 0; b < blocks; b++) finalBytes.push(dBlocks[b][i]);
  }
  for (let i = 0; i < eccLen; i++) {
    for (let b = 0; b < blocks; b++) finalBytes.push(eBlocks[b][i]);
  }

  const M = Array.from({ length: size }, () => new Uint8Array(size));
  const setF = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) M[r][c] = dark ? 2 : 1;
  };

  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const dark =
          r >= 0 &&
          r <= 6 &&
          c >= 0 &&
          c <= 6 &&
          (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        setF(r0 + r, c0 + c, dark);
      }
    }
  };

  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    setF(6, i, i % 2 === 0);
    setF(i, 6, i % 2 === 0);
  }

  for (const r of align) {
    for (const c of align) {
      if (M[r][c] !== 0) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          setF(r + dr, c + dc, Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
        }
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    if (M[8][i] === 0) M[8][i] = 1;
    if (M[i][8] === 0) M[i][8] = 1;
  }
  for (let i = 0; i < 8; i++) {
    if (M[8][size - 1 - i] === 0) M[8][size - 1 - i] = 1;
    if (M[size - 1 - i][8] === 0) M[size - 1 - i][8] = 1;
  }
  setF(size - 8, 8, true);

  if (verBits) {
    for (let i = 0; i < 18; i++) {
      const dark = ((verBits >> i) & 1) === 1;
      const a = Math.floor(i / 3);
      const b = i % 3;
      setF(a, size - 11 + b, dark);
      setF(size - 11 + b, a, dark);
    }
  }

  const allBits: number[] = [];
  finalBytes.forEach((b) => {
    for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1);
  });

  let bi = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const r = up ? size - 1 - i : i;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (M[r][c] === 0) {
          const bit = bi < allBits.length ? allBits[bi++] : 0;
          const masked = bit ^ ((r + c) % 2 === 0 ? 1 : 0);
          M[r][c] = masked ? 4 : 3;
        }
      }
    }
    up = !up;
  }

  const fmt = 0x77c4;
  const fCoords1: Array<[number, number]> = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  const fCoords2: Array<[number, number]> = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4],
    [8, size - 5], [8, size - 6], [8, size - 7], [8, size - 8],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8],
    [size - 3, 8], [size - 2, 8], [size - 1, 8],
  ];

  for (let i = 0; i < 15; i++) {
    const dark = ((fmt >> i) & 1) === 1;
    setF(fCoords1[i][0], fCoords1[i][1], dark);
    setF(fCoords2[i][0], fCoords2[i][1], dark);
  }

  const modules: boolean[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => M[r][c] === 2 || M[r][c] === 4)
  );

  return { version, size, quiet: 3, modules };
}

export function drawQrToCanvas(canvas: HTMLCanvasElement | null, text: string): void {
  if (!canvas) return;
  const { size, quiet, modules } = generateQrMatrix(text);
  const total = size + quiet * 2;
  const scale = Math.max(4, Math.floor(220 / total));
  canvas.width = total * scale;
  canvas.height = total * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) {
        ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
      }
    }
  }
}

export type CommissionModel = 'CPS_15' | 'CPL_40';

export interface AffiliateParams {
  baseUrl: string;
  affiliateCode: string;
  model: CommissionModel;
  expectedOrders: number;
  avgOrderValue?: number;
}

export interface AffiliateCalculation {
  sanitizedCode: string;
  trackingUrl: string;
  orders: number;
  totalSales: number;
  commission: number;
  netMerchantRevenue: number;
}

export function sanitizeAffiliateCode(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return (cleaned || 'MANSOURA_VIP_01').toUpperCase();
}

export function buildAffiliateUrl(
  baseUrl: string,
  affiliateCode: string,
  model: CommissionModel
): string {
  let base = (baseUrl || 'https://mansoura-grill.com/offer').trim();
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  const code = sanitizeAffiliateCode(affiliateCode);
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}utm_source=guerrilla_qr&aff_id=${encodeURIComponent(code)}&plan=${model}`;
}

export function calculateAffiliateMetrics(params: AffiliateParams): AffiliateCalculation {
  const orders = Math.max(1, Math.floor(Number.isFinite(params.expectedOrders) ? params.expectedOrders : 1));
  const avgOrder = params.avgOrderValue ?? 190;
  const sanitizedCode = sanitizeAffiliateCode(params.affiliateCode);
  const trackingUrl = buildAffiliateUrl(params.baseUrl, sanitizedCode, params.model);
  const totalSales = orders * avgOrder;
  const commission = params.model === 'CPS_15' ? Math.round(totalSales * 0.15) : orders * 40;
  const netMerchantRevenue = totalSales - commission;

  return {
    sanitizedCode,
    trackingUrl,
    orders,
    totalSales,
    commission,
    netMerchantRevenue,
  };
}
