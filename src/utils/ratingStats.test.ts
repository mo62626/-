import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRatingStats,
  sentimentLabelAr,
  validateReviewInput,
} from './ratingStats';

test('validateReviewInput rejects empty fields and out-of-range stars', () => {
  const emptyName = validateReviewInput({
    authorName: '   ',
    authorRole: 'طالب',
    rating: 5,
    sentiment: 'excellent',
    comment: 'ممتاز',
  });
  assert.equal(emptyName.ok, false);

  const badRating = validateReviewInput({
    authorName: 'أحمد',
    authorRole: 'محكم',
    rating: 6,
    sentiment: 'excellent',
    comment: '',
  });
  assert.equal(badRating.ok, false);

  const valid = validateReviewInput({
    authorName: 'د. سارة محمد',
    authorRole: 'لجنة التحكيم',
    rating: 5,
    sentiment: 'excellent',
    comment: 'عرض علمي وتطبيقي رائع ومتكامل.',
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.sanitized.rating, 5);
    assert.equal(valid.sanitized.authorName, 'د. سارة محمد');
  }
});

test('computeRatingStats calculates average, star distribution, and sentiment counts', () => {
  const empty = computeRatingStats([]);
  assert.equal(empty.totalCount, 0);
  assert.equal(empty.averageRating, 0);
  assert.equal(empty.breakdown.length, 5);

  const stats = computeRatingStats([
    { rating: 5, sentiment: 'excellent' },
    { rating: 5, sentiment: 'excellent' },
    { rating: 4, sentiment: 'good' },
    { rating: 2, sentiment: 'needs_improvement' },
  ]);

  assert.equal(stats.totalCount, 4);
  assert.equal(stats.averageRating, 4.0);
  assert.equal(stats.positivePercent, 75);
  assert.equal(stats.breakdown[0].stars, 5);
  assert.equal(stats.breakdown[0].count, 2);
  assert.equal(stats.breakdown[0].percent, 50);
  assert.equal(stats.sentimentCounts.excellent, 2);
  assert.equal(stats.sentimentCounts.good, 1);
  assert.equal(stats.sentimentCounts.needs_improvement, 1);
  assert.equal(sentimentLabelAr('excellent').tone, 'emerald');
});
