'use strict';
const { calculate, format } = PhosphorusCalculator;
const keys = ['x', 'y', 'p', 'r', 'z'];
const byId = id => document.getElementById(id);
let touched = false;
function setInputs(values) {
  for (const key of keys) {
    if (key === 'y') {
      document.querySelectorAll('input[name="y"]').forEach(radio => {
        radio.checked = radio.value === String(values.y);
      });
    } else byId(key).value = values[key];
  }
}
function update() {
  const input = Object.fromEntries(keys.map(key => [key, key === 'y'
    ? document.querySelector('input[name="y"]:checked')?.value || ''
    : byId(key).value]));
  const result = calculate(input);
  if (result.errors?.y && !input.y) result.errors.y = '目標磷輸注速率：請選擇一個速率。';
  byId('rate-selection').textContent = input.y
    ? `已選擇 ${input.y} mmol/kg/hr`
    : '請依獸醫處方點選速率';
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
  if (result.diluent === 0) notes.push('其他輸液體積為 0：僅表示數學上總量相符，不代表原液可直接輸注。');
  byId('rate-notice').hidden = notes.length === 0;
  byId('rate-notice').textContent = notes.join(' ');
}
byId('calculator').addEventListener('input', () => { touched = true; update(); });
byId('calculator').addEventListener('submit', event => { event.preventDefault(); touched = true; update(); });
byId('example').addEventListener('click', () => {
  const example = { x: 10, y: 0.06, p: 3, r: 3, z: 20 };
  setInputs(example);
  touched = true; update();
});
byId('clear').addEventListener('click', () => {
  setInputs({ x: '', y: '', p: '3', r: '', z: '' });
  touched = false; update(); byId('x').focus();
});
update();
