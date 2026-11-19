import React from 'react';

export const ASSET_IMAGES: Record<number, string> = {
  1: '/assets/aistudio/IMG-01_df3c067e.jpg',
  2: '/assets/aistudio/IMG-02_9892c722.jpg',
  3: '/assets/aistudio/IMG-03_e8f9b637.jpg',
  4: '/assets/aistudio/IMG-04_46fb2a3c.jpg',
  5: '/assets/aistudio/IMG-05_5882830c.jpg',
  6: '/assets/aistudio/IMG-06_3d5299fb.jpg',
  7: '/assets/aistudio/IMG-07_5e624c8b.jpg',
  8: '/assets/aistudio/IMG-08_90caeb90.jpg',
  9: '/assets/aistudio/IMG-09_5bf1b86d.jpg',
  10: '/assets/aistudio/IMG-10_7116bc0a.jpg',
  11: '/assets/aistudio/IMG-11_e76b1238.jpg',
  12: '/assets/aistudio/IMG-12_2f783b85.jpg',
  13: '/assets/aistudio/IMG-13_24d3cd6c.jpg',
  14: '/assets/aistudio/IMG-14_c4d92ddc.jpg',
  15: '/assets/aistudio/IMG-15_671680e0.jpg',
  16: '/assets/aistudio/IMG-16_0b7e919e.jpg',
  17: '/assets/aistudio/IMG-17_ccf14e7b.jpg',
  18: '/assets/aistudio/IMG-18_7feb83f1.jpg',
  19: '/assets/aistudio/IMG-19_9d8f2b41.jpg',
  20: '/assets/aistudio/IMG-20_885e4cdb.jpg',
  21: '/assets/aistudio/IMG-21_53e89142.jpg',
  22: '/assets/aistudio/IMG-22_3611b17b.jpg',
  23: '/assets/aistudio/IMG-23_9df6a3ae.jpg',
  24: '/assets/aistudio/IMG-24_144c84fe.jpg',
  25: '/assets/aistudio/IMG-25_a635c403.jpg',
  26: '/src/assets/images/ar_real_table_1795092155552.jpg',
  27: '/src/assets/images/vr_guerrilla_booth_1795092155324.jpg',
  28: '/src/assets/images/ugc_crowd_filming_1795092155066.jpg',
};

export const INTRO_VIDEO_SRC = '/assets/aistudio/LOGO-INTRO_4f6323a6.mp4';
export const BG_VIDEO_SRC = '/assets/aistudio/BG-SLIDE_7ec58d4d.mp4';

interface EditorialVisualProps {
  imageNum: number;
  customMediaUrl?: string;
  compact?: boolean;
  tall?: boolean;
  alt?: string;
}

export const EditorialVisual: React.FC<EditorialVisualProps> = ({
  imageNum,
  customMediaUrl,
  compact = false,
  tall = false,
  alt = '',
}) => {
  const src = customMediaUrl || ASSET_IMAGES[imageNum] || ASSET_IMAGES[1];
  const heightClass = tall ? 'h-64 lg:h-full min-h-[290px]' : compact ? 'h-32' : 'h-44';

  return (
    <figure
      className={`relative w-full ${heightClass} overflow-hidden rounded-xl border border-red-500/25 bg-slate-100 shadow-xs dark:border-red-500/30 dark:bg-slate-900`}
    >
      <img
        src={src}
        alt={alt || `توضيح بصري رقم ${imageNum}`}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
      />
    </figure>
  );
};
