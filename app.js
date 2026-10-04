'use strict';
const { calculate, format } = PhosphorusCalculator;
const keys = ['x', 'y', 'p', 'r', 'z'];
const byId = id => document.getElementById(id);
let touched = false;
function update() {
  const input = Object.fromEntries(keys.map(key => [key, byId(key).value]));
  const result = calculate(input);
  for (const key of keys) {
    const error = result.errors?.[key] || '';
    byId(key).setAttribute('aria-invalid', String(Boolean(error && touched)));
    byId(`${key}-error`).textContent = touched ? error : '';
  }
  byId('result-content').hidden = !result.ok;
  byId('empty').hidden = result.ok;
  const message = byId('message');
  message.classList.toggle('error', touched && !result.ok);
  if (!result.ok) {
    document.querySelectorAll('output').forEach(output => { output.textContent = '—'; });
    byId('state').textContent = touched ? '尚無有效結果' : '等待輸入';
    message.textContent = touched ? Object.values(result.errors).join(' ') : '請填寫所有條件，完成後自動計算。';
    return;
  }
  byId('state').textContent = '已即時更新';
  message.textContent = '數學驗算通過；請另行確認處方與臨床安全。';
  for (const key of ['stock', 'diluent', 'hourly', 'concentration', 'total', 'duration', 'actual']) byId(key).textContent = format(result[key]);
  byId('target').textContent = format(result.values.y);
  byId('final-volume').textContent = format(result.values.z);
  byId('difference').textContent = result.difference.toExponential(3);
  byId('tolerance').textContent = result.tolerance.toExponential(3);
  const notes = [];
  if (result.values.y === 0) notes.push('目前目標速率為 0，因此不含磷補充量。');
  else if (result.values.y < 0.02 || result.values.y > 0.06) notes.push('目標速率超出使用者提供的常用輸入範圍 0.02–0.06。此範圍不代表安全界線，請核對獸醫處方。');
  if (result.diluent === 0) notes.push('其他輸液體積為 0：僅表示數學上總量相符，不代表原液可直接輸注。');
  byId('rate-notice').hidden = notes.length === 0;
  byId('rate-notice').textContent = notes.join(' ');
}
byId('calculator').addEventListener('input', () => { touched = true; update(); });
byId('calculator').addEventListener('submit', event => { event.preventDefault(); touched = true; update(); });
byId('example').addEventListener('click', () => {
  const example = { x: 10, y: 0.06, p: 3, r: 3, z: 20 };
  for (const key of keys) byId(key).value = example[key];
  touched = true; update();
});
byId('clear').addEventListener('click', () => {
  for (const key of keys) byId(key).value = key === 'p' ? '3' : '';
  touched = false; update(); byId('x').focus();
});
update();
