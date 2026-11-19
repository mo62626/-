import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACADEMIC_REFERENCES,
  computeSimulatorState,
  filterGlossary,
  GLOSSARY_TERMS,
  HISTORICAL_ERAS,
  PRESENTATION_AXES,
  SLIDES_META,
} from './presentationData';

test('presentation contains 27 sequential slides mapped to 6 axes with speaker notes', () => {
  assert.equal(SLIDES_META.length, 27);
  assert.equal(PRESENTATION_AXES.length, 6);

  assert.equal(SLIDES_META[15].axisId, 4); // Mind Map
  assert.equal(SLIDES_META[25].axisId, 6); // AI Strategy & Traffic Advisor
  assert.equal(SLIDES_META[26].axisId, 6); // Audience Rating

  SLIDES_META.forEach((slide, idx) => {
    assert.equal(slide.num, idx + 1);
    assert.ok(slide.axisId >= 1 && slide.axisId <= 6);
    assert.ok(slide.speakerNotes.keyHook.length > 10);
    assert.ok(slide.speakerNotes.points.length >= 2);
    assert.ok(slide.speakerNotes.durationSec > 0);
  });
});

test('historical eras (5), glossary (34 terms), and linked references (18 items) are complete', () => {
  assert.equal(HISTORICAL_ERAS.length, 5);
  assert.equal(GLOSSARY_TERMS.length, 34);
  assert.equal(ACADEMIC_REFERENCES.length, 18);

  ACADEMIC_REFERENCES.forEach((ref) => {
    assert.match(ref.url, /^https:\/\//);
    assert.ok(ref.sourceLabel.length > 0);
  });
});

test('filterGlossary matches Arabic and English queries accurately', () => {
  assert.equal(filterGlossary('').length, 34);
  const arMatches = filterGlossary('العمولة');
  assert.ok(arMatches.length >= 1);
  assert.ok(arMatches.some((t) => t.en.includes('Affiliate')));

  const enMatches = filterGlossary('webar');
  assert.ok(enMatches.length >= 1);
  assert.ok(enMatches.some((t) => t.en === 'Augmented Reality (AR) / WebAR'));

  const ugcMatches = filterGlossary('ugc');
  assert.ok(ugcMatches.some((t) => t.en.includes('User-Generated Content')));

  const vrMatches = filterGlossary('virtual reality');
  assert.ok(vrMatches.some((t) => t.en.includes('Virtual Reality (VR)')));

  assert.equal(filterGlossary('nonexistent_xyz_123').length, 0);
});

test('computeSimulatorState clamps bounds and computes visibility inverse curve', () => {
  const minState = computeSimulatorState(-20);
  assert.equal(minState.ratio, 0);
  assert.equal(minState.tradVisibilityPercent, 100);
  assert.equal(minState.guerrillaImpactPercent, 50);

  const maxState = computeSimulatorState(150);
  assert.equal(maxState.ratio, 100);
  assert.equal(maxState.tradVisibilityPercent, 45);
  assert.equal(maxState.guerrillaImpactPercent, 100);
});
