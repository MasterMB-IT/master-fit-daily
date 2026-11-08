const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'exercise-catalog.json'),'utf8')).exercises;
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'technique-guide.js'),'utf8'),context);
const guides=context.window.MASTER_FIT_GUIDES;
assert.equal(Object.keys(guides).length,52);
for(const [id,guide] of Object.entries(guides)){
 assert.ok(catalog.some(x=>x.id===id),`ID inesistente: ${id}`);
 assert.ok(guide.steps.length>=3&&guide.errors.length>=2);
 for(const field of ['easier','harder','breathing'])assert.ok(guide[field].length>15,`${id}: ${field}`);
}
for(const id of ['squat-04','push-03','pull-09','lunge-06','core-01','glutes-07'])assert.ok(guides[id]);
console.log('PASS: 52 guide tecniche coerenti con il catalogo');
