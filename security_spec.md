# Security Specification — Guerrilla Marketing Presentation Ratings

## 1. Data Invariants
1. Every document in `/presentation_ratings/{ratingId}` contains zero PII (no email, phone, or IP address) and must explicitly carry `isPublic: true` for public review visibility.
2. Each verified Google-authenticated user (`request.auth.token.email_verified == true`) may own at most one review document whose document ID `{ratingId}` strictly equals `request.auth.uid` and `authorId`.
3. `rating` must be an integer between `1` and `5`.
4. `sentiment` must belong to `['excellent', 'good', 'needs_improvement']`.
5. String lengths are strictly bounded (`authorName` 1..60, `authorRole` 1..40, `comment` 0..400).
6. Timestamps (`createdAt`, `updatedAt`) must equal server `request.time`, and `createdAt` + `authorId` are immutable after creation.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: Unauthenticated user attempts `create /presentation_ratings/anon_1` -> Denied (`isVerifiedUser()` false).
2. **Unverified Email Spoof**: Signed-in token with `email_verified: false` attempts `create` -> Denied.
3. **UID Impersonation (Doc ID Mismatch)**: User A (`uidA`) attempts `create /presentation_ratings/uidB` -> Denied (`ratingId == request.auth.uid` false).
4. **UID Impersonation (Field Mismatch)**: User A (`uidA`) creates `/presentation_ratings/uidA` with `authorId: "uidB"` -> Denied (`data.authorId == request.auth.uid` false).
5. **Shadow / Ghost Field Injection**: Valid payload plus `isFeatured: true` -> Denied (`hasOnly(...)` false).
6. **Out-of-Bounds Rating (High/Float)**: `rating: 99` or `rating: 4.5` -> Denied (`is int && >= 1 && <= 5`).
7. **Invalid Sentiment Enum**: `sentiment: "spam_override"` -> Denied.
8. **Resource Exhaustion (1MB Comment)**: `comment` string length `> 400` -> Denied.
9. **Empty Author Name**: `authorName: ""` -> Denied (`size() >= 1`).
10. **ID Poisoning**: Document path ID with `1.5KB` payload or illegal characters (`$bad!`) -> Denied (`isValidId()`).
11. **Client Timestamp Tampering**: Client submits custom `createdAt` not matching `request.time` -> Denied.
12. **Immutable Field Mutation on Update**: User updates their own review trying to alter `createdAt` or `isPublic: false` -> Denied (`affectedKeys().hasOnly(...)` + immutability check).
