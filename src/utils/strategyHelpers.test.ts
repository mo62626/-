import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractPlanSections,
  parseGroundingSources,
  PROJECT_PRESETS,
  validateProjectBrief,
} from './strategyHelpers';

test('validateProjectBrief requires non-empty core fields and trims cleanly', () => {
  const invalid = validateProjectBrief({
    projectType: '  ',
    cityOrMarket: 'المنصورة',
    trafficGoal: 'جلب عملاء',
  });
  assert.equal(invalid.ok, false);

  const valid = validateProjectBrief(PROJECT_PRESETS[0].brief);
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.brief.projectType.includes('مطعم'), true);
  }
});

test('parseGroundingSources deduplicates links and rejects non-http URIs', () => {
  const sources = parseGroundingSources([
    { web: { uri: 'https://example.com/guerrilla', title: 'Guerrilla Guide' } },
    { web: { uri: 'https://example.com/guerrilla', title: 'Duplicate' } },
    { web: { uri: 'javascript:alert(1)', title: 'Bad' } },
    { web: { uri: 'https://marketing.org/ugc', title: '' } },
  ]);

  assert.equal(sources.length, 2);
  assert.equal(sources[0].title, 'Guerrilla Guide');
  assert.equal(sources[1].title, 'marketing.org');
});

test('extractPlanSections splits ## headings into clean cards', () => {
  const md = `
## 1. فكرة الغوريلا الخاطفة
- تنفيذ مشهد بصري في الشارع

## 2. خطة جلب الترافيك (Traffic Funnel)
- كود QR + ريلز تيك توك
- تتبع UTM وعمولة 15%
`;
  const sections = extractPlanSections(md);
  assert.equal(sections.length, 2);
  assert.equal(sections[0].title, '1. فكرة الغوريلا الخاطفة');
  assert.ok(sections[1].body.includes('UTM'));
});
