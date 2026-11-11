import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBespokePrice,
  convertAndFormatPrice,
  calculateCartSummary,
  isAtelierAdmin,
  SILHOUETTE_PRICES
} from './shopLogic';

test('calculateBespokePrice computes base price accurately', () => {
  const config = {
    silhouette: 'Cafe Racer',
    leatherType: 'Full Grain Sheepskin',
    hardware: 'Antiqued Brass',
    lining: 'Quilted Thermal Silk-Satin',
  };
  assert.equal(calculateBespokePrice(config), 54900);
});

test('calculateBespokePrice includes surcharges for upgrades and monogramming', () => {
  const config = {
    silhouette: 'Aviator Shearling', // 79900
    leatherType: 'Merino Wool Shearling', // +12000
    hardware: 'Matte Gunmetal', // +1500
    lining: 'Genuine Merino Shearling Wool', // +9500
    monogram: 'HAS' // +2500
  };
  const expected = 79900 + 12000 + 1500 + 9500 + 2500;
  assert.equal(calculateBespokePrice(config), expected);
});

test('calculateCartSummary applies valid promo codes correctly', () => {
  const items = [
    { pricePKR: 50000, quantity: 1 },
    { pricePKR: 10000, quantity: 2 },
  ]; // subtotal = 70000

  const withoutPromo = calculateCartSummary(items);
  assert.equal(withoutPromo.subtotal, 70000);
  assert.equal(withoutPromo.discount, 0);
  assert.equal(withoutPromo.total, 70000);

  const with10 = calculateCartSummary(items, 'JACKET10');
  assert.equal(with10.discountPercent, 10);
  assert.equal(with10.discount, 7000);
  assert.equal(with10.total, 63000);

  const with15 = calculateCartSummary(items, 'BESPOKE15');
  assert.equal(with15.discountPercent, 15);
  assert.equal(with15.discount, 10500);
  assert.equal(with15.total, 59500);
});

test('convertAndFormatPrice formats currencies properly', () => {
  const pkrFormatted = convertAndFormatPrice(50000, 'PKR');
  assert.equal(pkrFormatted, 'Rs. 50,000');

  const usdFormatted = convertAndFormatPrice(100000, 'USD');
  assert.match(usdFormatted, /^\$360/);
});

test('isAtelierAdmin identifies admin privileges safely', () => {
  assert.equal(isAtelierAdmin(null), false);
  assert.equal(isAtelierAdmin(undefined), false);
  assert.equal(isAtelierAdmin({ role: 'customer', email: 'umar@thejacketmaker.pk' }), false);
  assert.equal(isAtelierAdmin({ role: 'admin', email: 'admin@thejacketmaker.pk' }), true);
  assert.equal(isAtelierAdmin({ role: 'manager', email: 'admin@thejacketmaker.pk' }), true);
});
