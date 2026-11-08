const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(require('path').join(__dirname,'../app.js'),'utf8');
const ctx={localStorage:{getItem:()=>null},window:{MASTER_FIT_CATALOG:[]},document:{querySelector:()=>({innerHTML:''}),querySelectorAll:()=>[]},navigator:{},location:{protocol:'file:'},alert:()=>{}};
vm.createContext(ctx);vm.runInContext(src.replace(/render\(\);if\('serviceWorker'[\s\S]*$/,''),ctx);
const week={approved:true,start:'2026-11-02',sessions:[{id:'a',date:'2026-11-05',completed:false},{id:'b',date:'2026-11-07',completed:false}]};
const checkin={date:'2026-11-05',energy:'low',sleep:'poor',symptoms:'no'};
let a=ctx.scheduleAdvice(week,checkin,[],'2026-11-05');
assert.strictEqual(a.kind,'move');assert.strictEqual(a.to,'2026-11-06');
assert.strictEqual(week.sessions[0].date,'2026-11-05'); // proposta non modifica il piano
assert.strictEqual(ctx.scheduleAdvice(week,{...checkin,symptoms:'yes'},[],'2026-11-05').kind,'stop');
assert.strictEqual(ctx.scheduleAdvice({...week,approved:false},checkin,[],'2026-11-05'),null);
assert.strictEqual(ctx.scheduleAdvice(week,{date:'2026-11-05',energy:'normal',sleep:'ok',symptoms:'no'},[],'2026-11-05'),null);
const history=[{date:'2026-11-04',completed:false,feedback:{effort:'hard'}}];
assert.strictEqual(ctx.scheduleAdvice(week,null,history,'2026-11-05').kind,'move');
assert.strictEqual(ctx.movePlannedSession(week,a.sessionId,a.to),true);
assert.strictEqual(week.sessions[0].date,'2026-11-06');
console.log('PASS: calendario adattivo, consenso, sintomi, nessuna modifica silenziosa');
