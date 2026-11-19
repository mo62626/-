import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  computeRatingStats,
  PresentationReviewRecord,
  RATING_LIMITS,
  RatingSentiment,
  sentimentLabelAr,
  validateReviewInput,
} from '../utils/ratingStats';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  MessageSquareQuote,
  Star,
  ThumbsUp,
  Trash2,
} from 'lucide-react';

const ROLE_OPTIONS = [
  'عضو لجنة التحكيم / دكتور',
  'طالب / باحث علمي',
  'مسوّق / صانع محتوى',
  'صاحب مشروع / مستثمر',
];

export const PresentationRating: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [reviews, setReviews] = useState<PresentationReviewRecord[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [sentiment, setSentiment] = useState<RatingSentiment>('excellent');
  const [authorName, setAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<string>(ROLE_OPTIONS[0]);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection().catch(() => {});

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        setAuthorName((prev) => prev || currentUser.displayName || '');
      }
    });

    const ratingsPath = 'presentation_ratings';
    const ratingsQuery = query(
      collection(db, ratingsPath),
      where('isPublic', '==', true),
      limit(100)
    );

    const unsubSnapshot = onSnapshot(
      ratingsQuery,
      (snapshot) => {
        const loaded: PresentationReviewRecord[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const updatedAtMs =
            d.updatedAt && typeof d.updatedAt.toMillis === 'function'
              ? d.updatedAt.toMillis()
              : Date.now();
          return {
            id: docSnap.id,
            authorId: String(d.authorId ?? docSnap.id),
            authorName: String(d.authorName ?? 'مشارك'),
            authorRole: String(d.authorRole ?? 'حاضر بالعرض'),
            rating: Number(d.rating ?? 5),
            sentiment:
              d.sentiment === 'good' || d.sentiment === 'needs_improvement'
                ? d.sentiment
                : 'excellent',
            comment: String(d.comment ?? ''),
            isPublic: Boolean(d.isPublic),
            updatedAtMs,
          };
        });

        loaded.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
        setReviews(loaded);
        setLoadingReviews(false);
        setDbError(null);
      },
      (error) => {
        setLoadingReviews(false);
        setDbError('تعذّر تحميل التقييمات من قاعدة البيانات حالياً.');
        try {
          handleFirestoreError(error, OperationType.LIST, ratingsPath);
        } catch {
          // Structured error logged via handleFirestoreError
        }
      }
    );

    return () => {
      unsubAuth();
      unsubSnapshot();
    };
  }, []);

  // Pre-fill user's own existing review if present
  useEffect(() => {
    if (!user) return;
    const mine = reviews.find((r) => r.id === user.uid);
    if (mine) {
      setRating(mine.rating);
      setSentiment(mine.sentiment);
      setAuthorName(mine.authorName);
      setAuthorRole(mine.authorRole);
      setComment(mine.comment);
    }
  }, [user, reviews]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setFormError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'تعذّر تسجيل الدخول بحساب جوجل.';
      setFormError(`تعذّر إتمام تسجيل الدخول: ${msg}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setFeedbackMsg(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFeedbackMsg(null);

    if (!user) {
      setFormError('يرجى تسجيل الدخول بحساب جوجل أولاً لحفظ تقييمك بالنجوم في السجل الدائم.');
      return;
    }

    const validation = validateReviewInput({
      authorName,
      authorRole,
      rating,
      sentiment,
      comment,
    });

    if (validation.ok === false) {
      setFormError(validation.errorAr);
      return;
    }

    setSubmitting(true);
    const docPath = `presentation_ratings/${user.uid}`;
    const existingMine = reviews.find((r) => r.id === user.uid);

    try {
      await setDoc(doc(db, 'presentation_ratings', user.uid), {
        authorId: user.uid,
        authorName: validation.sanitized.authorName,
        authorRole: validation.sanitized.authorRole,
        rating: validation.sanitized.rating,
        sentiment: validation.sanitized.sentiment,
        comment: validation.sanitized.comment,
        isPublic: true,
        createdAt: existingMine ? serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedbackMsg(
        existingMine
          ? 'تم تحديث تقييمك بالنجوم بنجاح!'
          : 'شكراً لك! تم حفظ تقييمك ورأيك في سجل العرض بنجاح.'
      );
    } catch (error) {
      setFormError('لم يُحفظ التقييم بسبب صلاحيات القاعدة أو الاتصال. يرجى التأكد من تفعيل الحساب.');
      try {
        handleFirestoreError(
          error,
          existingMine ? OperationType.UPDATE : OperationType.CREATE,
          docPath
        );
      } catch {
        // Logged via handleFirestoreError
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOwnReview = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'presentation_ratings', user.uid));
      setComment('');
      setRating(5);
      setSentiment('excellent');
      setFeedbackMsg('تم حذف تقييمك.');
    } catch (error) {
      setFormError('تعذّر حذف التقييم حالياً.');
      try {
        handleFirestoreError(error, OperationType.DELETE, `presentation_ratings/${user.uid}`);
      } catch {
        // Logged
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stats = computeRatingStats(reviews);
  const myExistingReview = user ? reviews.find((r) => r.id === user.uid) : undefined;
  const activeDisplayRating = hoverRating || rating;

  const cardBase =
    'rounded-2xl border border-slate-300/85 bg-white/92 p-4 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-[#0f172a]/90';

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
      {/* Column 1: Live Aggregated Star Rating Summary & Breakdown */}
      <section
        aria-label="ملخص تقييم الجمهور للعرض"
        className={`${cardBase} flex flex-col justify-between gap-3 border-t-4 border-t-amber-500 lg:col-span-4`}
      >
        <div>
          <span className="inline-block rounded-lg bg-amber-500/20 px-3 py-1 font-display text-xs font-black text-amber-950 dark:text-amber-300">
            مؤشر تقييم الحضور والمحكمين (Live)
          </span>

          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-amber-300/60 bg-amber-50/75 p-4 dark:border-amber-700/50 dark:bg-amber-950/30">
            <div className="text-center">
              <div className="en tabular-nums text-4xl font-black text-slate-950 dark:text-white">
                {stats.totalCount > 0 ? stats.averageRating.toFixed(1) : '—'}
              </div>
              <div className="text-xs font-extrabold text-slate-600 dark:text-slate-300">من 5.0</div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1" aria-label={`متوسط التقييم ${stats.averageRating} من 5`}>
                {[1, 2, 3, 4, 5].map((starNum) => {
                  const filled = stats.averageRating >= starNum - 0.35;
                  return (
                    <Star
                      key={starNum}
                      className={`h-5 w-5 ${
                        filled
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <div className="mt-1.5 tabular-nums text-xs font-black text-slate-800 dark:text-slate-200">
                إجمالي التقييمات المسجلة: {stats.totalCount} تقييم
              </div>
              {stats.totalCount > 0 && (
                <div className="mt-0.5 tabular-nums text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  نسبة الرضا العام (4★ فأعلى): {stats.positivePercent}%
                </div>
              )}
            </div>
          </div>

          {/* 5..1 Star Distribution Bars */}
          <div className="mt-3 space-y-2">
            {stats.breakdown.map((bucket) => (
              <div key={bucket.stars} className="flex items-center gap-2 text-xs font-extrabold">
                <span className="en tabular-nums w-9 shrink-0 text-slate-900 dark:text-slate-100">
                  {bucket.stars} ★
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
                <span className="en tabular-nums w-10 text-left text-slate-700 dark:text-slate-300">
                  {bucket.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict Sentiment Counts */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-emerald-50/90 p-2 dark:bg-emerald-950/35">
            <div className="tabular-nums text-base font-black text-emerald-700 dark:text-emerald-300">
              {stats.sentimentCounts.excellent}
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">
              حلو وممتاز
            </div>
          </div>
          <div className="rounded-xl bg-sky-50/90 p-2 dark:bg-sky-950/35">
            <div className="tabular-nums text-base font-black text-sky-700 dark:text-sky-300">
              {stats.sentimentCounts.good}
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">
              جيد ومفيد
            </div>
          </div>
          <div className="rounded-xl bg-amber-50/90 p-2 dark:bg-amber-950/35">
            <div className="tabular-nums text-base font-black text-amber-800 dark:text-amber-300">
              {stats.sentimentCounts.needs_improvement}
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">
              مقترح تحسين
            </div>
          </div>
        </div>
      </section>

      {/* Column 2: Interactive Star & Opinion Submission Form */}
      <section
        aria-label="إضافة تقييمك ورأيك في العرض"
        className={`${cardBase} flex flex-col justify-between gap-2.5 border-t-4 border-t-red-600 lg:col-span-4`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
          <h2 className="font-display text-sm font-black text-slate-950 lg:text-[15px] dark:text-white">
            قيّم العرض التقديمي الآن
          </h2>
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <LogOut className="h-3 w-3" />
              <span>خروج</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitReview} className="flex flex-1 flex-col gap-2.5">
          {/* Interactive 1..5 Stars */}
          <div>
            <div className="mb-1 text-xs font-extrabold text-slate-900 dark:text-slate-100">
              اختر عدد النجوم (1 إلى 5):
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isSelected = activeDisplayRating >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starValue)}
                    aria-label={`تقييم ${starValue} من 5 نجوم`}
                    aria-pressed={rating === starValue}
                    className="rounded-lg p-1.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-red-500"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        isSelected
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="en tabular-nums mr-auto text-sm font-black text-amber-700 dark:text-amber-300">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Sentiment Selector ("حلو ولا وحش") */}
          <div>
            <div className="mb-1 text-xs font-extrabold text-slate-900 dark:text-slate-100">
              انطباعك السريع عن العرض:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['excellent', 'good', 'needs_improvement'] as RatingSentiment[]).map((s) => {
                const info = sentimentLabelAr(s);
                const selected = sentiment === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSentiment(s)}
                    aria-pressed={selected}
                    className={`rounded-xl border px-2 py-1.5 font-display text-xs font-extrabold transition-colors ${
                      selected
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-900 hover:border-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="review-author-name"
                className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
              >
                الاسم
              </label>
              <input
                id="review-author-name"
                type="text"
                maxLength={RATING_LIMITS.maxAuthorName}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="اسمك الكريم"
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="review-author-role"
                className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100"
              >
                الصفة
              </label>
              <select
                id="review-author-role"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-slate-100">
              <label htmlFor="review-comment">رأيك أو ملاحظتك للتحسين</label>
              <span className="en tabular-nums text-[11px] text-slate-600 dark:text-slate-400">
                {comment.length}/{RATING_LIMITS.maxComment}
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={2}
              maxLength={RATING_LIMITS.maxComment}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ما أكثر جزء أعجبك؟ وما الذي تقترح إضافته؟"
              className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="flex items-start gap-1.5 rounded-xl border border-red-300 bg-red-50 px-2.5 py-2 text-xs font-bold text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {feedbackMsg && (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {!user ? (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 font-display text-xs font-black text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {authLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              <span>سجّل بجوجل لنشر تقييمك بالنجوم</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-display text-xs font-black text-white transition-colors hover:bg-red-700 disabled:opacity-65"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
                <span>{myExistingReview ? 'تحديث تقييمك المنشور' : 'نشر التقييم الآن'}</span>
              </button>

              {myExistingReview && (
                <button
                  type="button"
                  onClick={handleDeleteOwnReview}
                  disabled={submitting}
                  aria-label="حذف تقييمك"
                  className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-red-300 bg-red-50 px-3 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </form>
      </section>

      {/* Column 3: Public Verified Audience Reviews Feed */}
      <section
        aria-label="آراء وتقييمات الجمهور"
        className={`${cardBase} flex flex-col border-t-4 border-t-emerald-500 lg:col-span-4`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <MessageSquareQuote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-display text-sm font-black text-slate-950 lg:text-[15px] dark:text-white">
              آراء الجمهور والحضور ({reviews.length})
            </h2>
          </div>
        </div>

        <div className="editorial-scroll mt-2.5 flex max-h-[380px] flex-1 flex-col gap-2 overflow-y-auto pl-1">
          {loadingReviews && (
            <div className="flex flex-1 items-center justify-center gap-2 py-8 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جارٍ تحميل تقييمات الحضور...</span>
            </div>
          )}

          {dbError && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {dbError}
            </div>
          )}

          {!loadingReviews && !dbError && reviews.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/75 p-6 text-center dark:border-slate-700 dark:bg-slate-900/45">
              <Star className="mb-2 h-8 w-8 text-amber-400" />
              <div className="font-display text-sm font-black text-slate-950 dark:text-white">
                لا توجد تقييمات مسجلة بعد
              </div>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                كن أول الحاضرين الذين يسجلون تقييمهم بالنجوم ورأيهم في هذا العرض العلمي ليظهر هنا للجميع فوراً!
              </p>
            </div>
          )}

          {reviews.map((rev) => {
            const info = sentimentLabelAr(rev.sentiment);
            const pillTone =
              info.tone === 'emerald'
                ? 'bg-emerald-500/16 text-emerald-900 dark:text-emerald-300'
                : info.tone === 'sky'
                ? 'bg-sky-500/16 text-sky-900 dark:text-sky-300'
                : 'bg-amber-500/20 text-amber-950 dark:text-amber-300';

            return (
              <article
                key={rev.id}
                className="rounded-xl border border-slate-200 bg-slate-50/95 p-3 dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-xs font-black text-slate-950 dark:text-white">
                      {rev.authorName}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {rev.authorRole}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          rev.rating >= s
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10.5px] font-black ${pillTone}`}>
                    {info.label}
                  </span>
                </div>

                {rev.comment && (
                  <p className="mt-1.5 text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-200">
                    «{rev.comment}»
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
