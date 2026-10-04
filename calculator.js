(function (root) {
  'use strict';
  const labels = { x: '狗體重', y: '目標磷輸注速率', p: '磷原液濃度', r: '輸液速率', z: '最終總液量' };
  function calculate(input) {
    const values = {}, errors = {};
    for (const [key, label] of Object.entries(labels)) {
      const raw = input[key];
      const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
      if (!Number.isFinite(value)) errors[key] = `${label}：請輸入有限數值。`;
      else if (value < 0 || (key !== 'y' && value === 0)) errors[key] = `${label}：${key === 'y' ? '不得小於 0' : '必須大於 0'}。`;
      values[key] = value;
    }
    if (Object.keys(errors).length) return { ok: false, errors };
    const { x, y, p, r, z } = values;
    const hourly = x * y;
    const concentration = hourly / r;
    const total = concentration * z;
    const stock = total / p;
    const diluent = z - stock;
    const duration = z / r;
    const actual = ((stock * p / z) * r) / x;
    const results = { hourly, concentration, total, stock, diluent, duration, actual };
    if (Object.values(results).some(v => !Number.isFinite(v)) || duration <= 0 ||
        (y > 0 && [hourly, concentration, total, stock, actual].some(v => v <= 0))) {
      return { ok: false, errors: { calculation: '數值超出可可靠計算的範圍，請檢查單位與輸入。' } };
    }
    if (stock > z) return { ok: false, errors: { calculation: '磷原液體積大於最終總液量，無法依此條件配製。請重新核對處方、原液濃度、輸液速率與總液量。' } };
    const tolerance = Math.max(Number.MIN_VALUE, Math.abs(y) * 1e-12);
    const difference = Math.abs(actual - y);
    if (difference > tolerance) return { ok: false, errors: { calculation: '反向驗算未通過，請停止使用此結果並檢查數值。' } };
    return { ok: true, values, ...results, difference, tolerance, verified: true };
  }
  function format(value) {
    if (value === 0) return '0';
    if (Math.abs(value) < 0.001 || Math.abs(value) >= 1e7) return value.toExponential(5);
    return value.toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false });
  }
  const api = { calculate, format };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PhosphorusCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
