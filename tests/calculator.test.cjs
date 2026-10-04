const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, format } = require('../calculator.js');
const base = { x: 10, y: 0.06, p: 3, r: 3, z: 20 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-12 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
const cases = [
  ['指定範例', base, [0.6, 0.2, 4, 4/3, 56/3, 20/3]],
  ['5 kg 範例', {x:5,y:0.06,p:3,r:3,z:30}, [0.3,0.1,3,1,29,10]],
  ['較低目標速率', {x:10,y:0.02,p:3,r:3,z:20}, [0.2,1/15,4/3,4/9,176/9,20/3]],
  ['可修改原液濃度', {x:12.5,y:0.04,p:2,r:5,z:50}, [0.5,0.1,5,2.5,47.5,10]],
  ['小數體重與速率', {x:2.3,y:0.03,p:1.5,r:2.5,z:12}, [0.069,0.0276,0.3312,0.2208,11.7792,4.8]],
  ['零目標速率', {...base,y:0}, [0,0,0,0,20,20/3]],
  ['剛好無其他輸液', {x:10,y:0.06,p:0.2,r:3,z:20}, [0.6,0.2,4,20,0,20/3]]
];
for (const [name,input,expected] of cases) test(name, () => {
  const result = calculate(input); assert.equal(result.ok,true);
  ['hourly','concentration','total','stock','diluent','duration'].forEach((key,i)=>near(result[key],expected[i]));
  near(result.actual,input.y); near(result.stock+result.diluent,input.z); assert.ok(result.difference<=result.tolerance);
});
for (const key of Object.keys(base)) {
  for (const bad of ['', ' ', null, undefined, -1, NaN, Infinity, 'abc']) test(`${key} 拒絕 ${String(bad)}`,()=>assert.equal(calculate({...base,[key]:bad}).ok,false));
  if(key!=='y') test(`${key} 拒絕零`,()=>assert.equal(calculate({...base,[key]:0}).ok,false));
}
test('拒絕原液超過總液量',()=>assert.equal(calculate({...base,p:0.1}).ok,false));
test('修改 Y 後每小時磷量同步更新，回歸 Excel 錯誤',()=>{
  near(calculate({...base,y:0.02}).hourly,0.2); near(calculate({...base,y:0.06}).hourly,0.6);
});
test('拒絕數值溢位',()=>assert.equal(calculate({...base,x:1e308,y:1e308}).ok,false));
test('拒絕正數計算下溢為零',()=>assert.equal(calculate({...base,x:1e-300,y:1e-300}).ok,false));
test('接受完整數字字串',()=>assert.equal(calculate(Object.fromEntries(Object.entries(base).map(([k,v])=>[k,String(v)]))).ok,true));
test('微小結果不顯示成零',()=>assert.notEqual(format(1e-8),'0'));
test('計算不採用顯示後的四捨五入值',()=>assert.equal(calculate(base).stock,4/3));
test('120 組條件的獨立守恆與反向驗算',()=>{
  for(const x of [1,2.3,10,40]) for(const y of [0.02,0.03,0.04,0.05,0.06]) for(const p of [1.5,3]) for(const r of [2,5,10]) {
    const result=calculate({x,y,p,r,z:20}); assert.equal(result.ok,true);
    near(result.stock*p,result.hourly*result.duration);
    near(result.actual,y); near(result.stock+result.diluent,20);
  }
});
