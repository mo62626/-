export type RatingSentiment = 'excellent' | 'good' | 'needs_improvement';

export interface PresentationReviewInput {
  authorName: string;
  authorRole: string;
  rating: number;
  sentiment: RatingSentiment;
  comment: string;
}

export interface PresentationReviewRecord extends PresentationReviewInput {
  id: string;
  authorId: string;
  isPublic: boolean;
  updatedAtMs: number;
}

export interface StarBucket {
  stars: 5 | 4 | 3 | 2 | 1;
  count: number;
  percent: number;
}

export interface RatingSummaryStats {
  totalCount: number;
  averageRating: number;
  positivePercent: number;
  breakdown: StarBucket[];
  sentimentCounts: Record<RatingSentiment, number>;
}

const VALID_SENTIMENTS: readonly RatingSentiment[] = [
  'excellent',
  'good',
  'needs_improvement',
];

export const RATING_LIMITS = {
  maxAuthorName: 60,
  maxAuthorRole: 40,
  maxComment: 400,
} as const;

export function validateReviewInput(
  input: PresentationReviewInput
):
  | { ok: true; sanitized: PresentationReviewInput }
  | { ok: false; errorAr: string } {
  const authorName = input.authorName.trim().slice(0, RATING_LIMITS.maxAuthorName);
  const authorRole = input.authorRole.trim().slice(0, RATING_LIMITS.maxAuthorRole);
  const comment = input.comment.trim().slice(0, RATING_LIMITS.maxComment);
  const rating = Math.round(Number(input.rating));

  if (!authorName) {
    return { ok: false, errorAr: 'يرجى كتابة اسمك أو لقبك لعرض التقييم.' };
  }
  if (!authorRole) {
    return { ok: false, errorAr: 'يرجى اختيار صفتك أو تخصصك.' };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, errorAr: 'يرجى اختيار تقييم من 1 إلى 5 نجوم.' };
  }
  if (!VALID_SENTIMENTS.includes(input.sentiment)) {
    return { ok: false, errorAr: 'يرجى تحديد انطباعك العام عن العرض.' };
  }

  return {
    ok: true,
    sanitized: {
      authorName,
      authorRole,
      rating,
      sentiment: input.sentiment,
      comment,
    },
  };
}

export function computeRatingStats(
  reviews: readonly Pick<PresentationReviewRecord, 'rating' | 'sentiment'>[]
): RatingSummaryStats {
  const totalCount = reviews.length;
  const counts: Record<5 | 4 | 3 | 2 | 1, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  const sentimentCounts: Record<RatingSentiment, number> = {
    excellent: 0,
    good: 0,
    needs_improvement: 0,
  };

  let sum = 0;
  let positiveCount = 0;

  for (const r of reviews) {
    const clamped = Math.max(1, Math.min(5, Math.round(r.rating))) as
      | 5
      | 4
      | 3
      | 2
      | 1;
    counts[clamped] += 1;
    sum += clamped;
    if (clamped >= 4) positiveCount += 1;
    if (VALID_SENTIMENTS.includes(r.sentiment)) {
      sentimentCounts[r.sentiment] += 1;
    }
  }

  const averageRating = totalCount > 0 ? Math.round((sum / totalCount) * 10) / 10 : 0;
  const positivePercent = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

  const starLevels: (5 | 4 | 3 | 2 | 1)[] = [5, 4, 3, 2, 1];
  const breakdown: StarBucket[] = starLevels.map((stars) => ({
    stars,
    count: counts[stars],
    percent: totalCount > 0 ? Math.round((counts[stars] / totalCount) * 100) : 0,
  }));

  return {
    totalCount,
    averageRating,
    positivePercent,
    breakdown,
    sentimentCounts,
  };
}

export function sentimentLabelAr(sentiment: RatingSentiment): {
  label: string;
  tone: 'emerald' | 'sky' | 'amber';
} {
  switch (sentiment) {
    case 'excellent':
      return { label: 'حلو وممتاز جداً', tone: 'emerald' };
    case 'good':
      return { label: 'جيد ومفيد', tone: 'sky' };
    case 'needs_improvement':
      return { label: 'يحتاج تحسين وإضافات', tone: 'amber' };
  }
}
