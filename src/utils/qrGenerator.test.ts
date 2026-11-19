import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateQrMatrix,
  sanitizeAffiliateCode,
  buildAffiliateUrl,
  calculateAffiliateMetrics,
} from './qrGenerator';

test('generateQrMatrix produces valid square matrix with finder patterns', () => {
  const result = generateQrMatrix('https://mansoura-grill.com/offer?aff_id=VIP_01');
  assert.ok(result.size >= 21 && result.size <= 49);
  assert.equal(result.modules.length, result.size);
  assert.equal(result.modules[0].length, result.size);

  // Top-left finder pattern corner (0,0) and center (3,3) must be dark
  assert.equal(result.modules[0][0], true);
  assert.equal(result.modules[3][3], true);
  assert.equal(result.modules[1][1], false);

  // Top-right and bottom-left finder pattern corners must be dark
  assert.equal(result.modules[0][result.size - 1], true);
  assert.equal(result.modules[result.size - 1][0], true);
});

test('sanitizeAffiliateCode normalizes whitespace and preserves valid tokens', () => {
  assert.equal(sanitizeAffiliateCode(' mansoura vip 01 '), 'MANSOURA_VIP_01');
  assert.equal(sanitizeAffiliateCode(''), 'MANSOURA_VIP_01');
  assert.equal(sanitizeAffiliateCode('delta-hotel-2026'), 'DELTA-HOTEL-2026');
});

test('buildAffiliateUrl prepends https and appends UTM tracking params cleanly', () => {
  const url1 = buildAffiliateUrl('mansoura-grill.com/offer', 'vip 1', 'CPS_15');
  assert.equal(
    url1,
    'https://mansoura-grill.com/offer?utm_source=guerrilla_qr&aff_id=VIP_1&plan=CPS_15'
  );

  const url2 = buildAffiliateUrl('https://hotel.com/book?branch=delta', 'agent2', 'CPL_40');
  assert.equal(
    url2,
    'https://hotel.com/book?branch=delta&utm_source=guerrilla_qr&aff_id=AGENT2&plan=CPL_40'
  );
});

test('calculateAffiliateMetrics computes exact CPS (15%) and CPL (40 EGP) figures', () => {
  const cps = calculateAffiliateMetrics({
    baseUrl: 'https://mansoura-grill.com/offer',
    affiliateCode: 'MANSOURA_VIP_01',
    model: 'CPS_15',
    expectedOrders: 150,
  });
  assert.equal(cps.totalSales, 28500); // 150 * 190
  assert.equal(cps.commission, 4275); // 15% of 28500
  assert.equal(cps.netMerchantRevenue, 24225);

  const cpl = calculateAffiliateMetrics({
    baseUrl: 'https://mansoura-grill.com/offer',
    affiliateCode: 'MANSOURA_VIP_01',
    model: 'CPL_40',
    expectedOrders: 150,
  });
  assert.equal(cpl.totalSales, 28500);
  assert.equal(cpl.commission, 6000); // 150 * 40
  assert.equal(cpl.netMerchantRevenue, 22500);
});
