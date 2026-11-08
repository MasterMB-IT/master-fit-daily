const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/../app.js','utf8');
const context={localStorage:{getItem:()=>null},alert:()=>{},document:{querySelector:()=>null},Date,console};
vm.createContext(context);
vm.runInContext(src.slice(0,src.indexOf('function header()'))+'\nthis.api={weekPlan,plusDays,exerciseTarget};',context);
const {weekPlan,plusDays,exerciseTarget}=context.api;
const profile={days:2,duration:60,equipment:[]};
let w=weekPlan(profile,'2026-11-02',null);
assert.equal(w.cycleWeek,1);assert.equal(w.phase,'base');assert.equal(w.sets,2);
for(let n=2;n<=4;n++){
 const finished=w.sessions.map(s=>({...s,completed:true,status:'done',feedback:{effort:'easy',pain:'no'}}));
 w=weekPlan(profile,plusDays(w.start,7),{...w,sessions:finished});
 assert.equal(w.cycleWeek,n);
}
assert.equal(w.phase,'recupero');assert.equal(w.sets,1);assert.equal(w.reps,10);
assert.equal(w.approved,false);
const e={catalogId:'squat-basic'};
const history=[{date:'2026-11-18',completed:true,feedback:{effort:'easy',pain:'no'},exercises:[{catalogId:'squat-basic',actual:[10,10]}]}];
assert.equal(exerciseTarget(e,w,history).reps,w.reps);
const next=weekPlan(profile,plusDays(w.start,7),w);
assert.equal(next.cycleWeek,1);assert.equal(next.sets,2);
console.log('PASS: quattro fasi, recupero, nessuna progressione nel recupero, reset ciclo');
