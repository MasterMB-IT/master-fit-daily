'use strict';
const KEY='masterfit-coach-v2';
const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toLocaleDateString('sv-SE');
const monday=d=>{let a=new Date(d+'T12:00:00');a.setDate(a.getDate()-((a.getDay()+6)%7));return a.toLocaleDateString('sv-SE')};
const plusDays=(d,n)=>{let x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toLocaleDateString('sv-SE')};
const initial=()=>({profile:null,week:null,sessions:[],active:null,view:'home',history:[],checkin:null});
let state;try{state={...initial(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=initial()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{alert('Salvataggio non riuscito. Esporta un backup e libera spazio nel browser.');return false}}
function change(patch){Object.assign(state,patch);save();render()}
const MOVES={
 squat:{name:'Gambe',variants:[['chair','Alzarsi dalla sedia','body'],['goblet','Squat con manubrio','dumbbells']]},
 push:{name:'Spinta',variants:[['wall','Piegamenti al muro','body'],['incline','Piegamenti inclinati','body'],['floorpress','Distensioni a terra con manubri','dumbbells']]},
 hinge:{name:'Glutei',variants:[['bridge','Ponte glutei','body'],['rdl','Stacco rumeno con manubri','dumbbells']]},
 pull:{name:'Schiena',variants:[['bandrow','Rematore con elastico','bands'],['dbrow','Rematore con manubrio','dumbbells']]},
 core:{name:'Stabilità',variants:[['deadbug','Dead bug facilitato','body'],['bird','Bird dog facilitato','body']]}
};
const TIPS={chair:'Siediti e rialzati lentamente, aiutandoti con le mani se serve.',goblet:'Mantieni il manubrio vicino al petto e scendi solo fin dove controlli.',wall:'Mani al muro, corpo allineato: piega e distendi i gomiti con controllo.',incline:'Mani su un supporto molto stabile, corpo allineato.',floorpress:'Sdraiati a terra e spingi i manubri verso l’alto senza forzare le spalle.',bridge:'Schiena a terra, piedi appoggiati: solleva il bacino senza inarcare.',rdl:'Piega leggermente le ginocchia e porta indietro il bacino, schiena neutra.',bandrow:'Tira l’elastico verso il busto mantenendo le spalle rilassate.',dbrow:'Sostieniti con una mano su un appoggio stabile e tira il manubrio verso il fianco.',deadbug:'Muovi lentamente braccio e gamba opposti senza staccare la zona lombare.',bird:'Da quadrupedia, allunga lentamente braccio e gamba opposti.'};
// Catalogo consultabile: selezione prudente per livello e attrezzatura, non diagnosi.
const CATALOG=typeof window!=='undefined'&&Array.isArray(window.MASTER_FIT_CATALOG)?window.MASTER_FIT_CATALOG:[];
function guideFor(id){return (typeof window!=='undefined'&&window.MASTER_FIT_GUIDES&&window.MASTER_FIT_GUIDES[id])||null}
function guideMarkup(item){
 const guide=guideFor(item?.id);if(!guide)return `<p class="small muted">Scheda tecnica dettagliata in preparazione. Le indicazioni sintetiche del catalogo non sostituiscono una dimostrazione professionale.</p>`;
 return `<div class="tech-guide"><p class="eyebrow">GUIDA TECNICA VERIFICABILE · ${escapeHtml(item.name)}</p><b>Esecuzione</b><ol>${guide.steps.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ol><b>Errori da evitare</b><ul>${guide.errors.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul><p><b>Più facile:</b> ${escapeHtml(guide.easier)}</p><p><b>Più impegnativo:</b> ${escapeHtml(guide.harder)}</p><p><b>Respirazione:</b> ${escapeHtml(guide.breathing)}</p></div>`;
}
function catalogAvailable(profile,pattern){
 const level=profile.level==='attivo'?3:2;
 return CATALOG.filter(x=>(!pattern||x.pattern===pattern)&&x.level<=level&&
   (x.equipment==='body'||(profile.equipment||[]).includes(x.equipment)));
}
function chooseCatalog(pattern,profile,exclude=[]){
 const list=catalogAvailable(profile,pattern).filter(x=>!exclude.includes(x.id));
 // A beginner gets simple, low-level variants first; never a random advanced lift.
 return list.sort((a,b)=>a.level-b.level||a.id.localeCompare(b.id))[0]||null;
}
function variants(k,p){return MOVES[k].variants.filter(v=>v[2]==='body'||p.equipment.includes(v[2]))}
// Prescrizione per pattern e obiettivo: indicazioni iniziali, non misure di capacità o carichi massimali.
const PATTERN_RULES={
 squat:{forza:1,muscolo:2,benessere:0,composizione:1},
 hinge:{forza:1,muscolo:2,benessere:0,composizione:1},
 push:{forza:1,muscolo:2,benessere:0,composizione:1},
 pull:{forza:1,muscolo:2,benessere:0,composizione:1},
 core:{forza:0,muscolo:0,benessere:0,composizione:0}
};
function movementPrescription(pattern,profile,week,exercise){
 const goal=profile?.goal||'benessere';
 const beginner=profile?.level!=='attivo';
 const accessory=pattern==='core';
 const base=Number(week?.reps)||8;
 const delta=(PATTERN_RULES[pattern]||PATTERN_RULES.core)[goal]||0;
 const reps=accessory?Math.max(6,Math.min(12,base+2)):Math.max(4,Math.min(15,base+delta));
 const baseRest=goal==='forza'?150:goal==='muscolo'?105:goal==='composizione'?75:90;
 const restSeconds=accessory?60:(beginner?Math.max(90,baseRest):baseRest);
 const cue=accessory?'Movimento controllato: interrompi se perdi la tecnica.':
  goal==='forza'?'Concentrati sulla qualità e sulla ripetibilità, non sul carico massimo.':
  goal==='muscolo'?'Mantieni un movimento controllato e un impegno gestibile.':
  'Privilegia continuità, controllo e respirazione regolare.';
 return {reps,restSeconds,cue,sets:Math.max(1,Number(week?.sets)||1),equipment:exercise?.equipment||'body'};
}
// Autovalutazione descrittiva, non test clinico né verifica della tecnica.
const CAPABILITY_OPTIONS={
 squat:{supported:'Alzarsi dalla sedia',basic:'Squat a box',comfortable:'Squat assistito a una porta stabile'},
 push:{supported:'Piegamenti al muro',basic:'Piegamenti su piano alto stabile',comfortable:'Piegamenti su piano alto stabile'},
 hinge:{supported:'Ponte glutei a terra',basic:'Hip hinge al muro',comfortable:'Ponte glutei con pausa'},
 core:{supported:'Dead bug facilitato',basic:'Bird dog facilitato',comfortable:'Plank su piano rialzato'}
};
function capabilityChoice(pattern,profile,candidates){
 const answer=profile?.capabilities?.[pattern];
 if(!['supported','basic','comfortable'].includes(answer))return null;
 const name=CAPABILITY_OPTIONS[pattern]?.[answer];
 return candidates.find(x=>x.name===name)||null;
}
function capabilitySummary(profile){
 const c=profile?.capabilities||{};
 const answered=['squat','push','hinge','core'].filter(k=>['supported','basic','comfortable'].includes(c[k]));
 return answered.length?`Autovalutazione iniziale: ${answered.length} aree descritte su 4. Le varianti sono proposte, non test di capacità o idoneità.`:'Nessuna autovalutazione iniziale: il Coach parte dalle varianti introduttive.';
}
function selectMovement(pattern,profile,goal,exclude=[]){
 const candidates=catalogAvailable(profile,pattern).filter(x=>!exclude.includes(x.id));
 const beginner=profile?.level!=='attivo';
 const selfReported=capabilityChoice(pattern,profile,candidates);
 if(beginner&&selfReported)return selfReported;
 // Nessuna scelta casuale e nessuna promozione automatica a esercizi avanzati.
 candidates.sort((a,b)=>{
  const score=x=>(beginner?Math.abs(x.level-2)*30:(goal==='forza'&&pattern!=='core'?Math.abs(x.level-2)*30:x.level*30))+
   (x.equipment==='body'?0:3);
  return score(a)-score(b)||a.id.localeCompare(b.id);
 });
 return candidates[0]||null;
}

// Calendario flessibile: giorni scelti dall'utente; fallback per profili precedenti.
function preferredOffsets(profile){
 const count=profile.days===3?3:2;
 const raw=Array.isArray(profile.trainingDays)?profile.trainingDays:[];
 const valid=[...new Set(raw.map(Number).filter(x=>Number.isInteger(x)&&x>=0&&x<=6))].sort((a,b)=>a-b);
 return valid.length===count?valid:(count===3?[1,3,5]:[1,3]);
}
// Pianificazione adattiva: preferenze, turni alternati e almeno un giorno libero tra sessioni quando possibile.
function adaptiveOffsets(profile,start){
 const count=profile.days===3?3:2;
 const preferred=preferredOffsets(profile);
 const raw=Array.isArray(profile.unavailableDays)?profile.unavailableDays:[];
 const unavailable=new Set(raw.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=6));
 const shift=profile.shiftMode||'none';
 const anchor=/^\d{4}-\d{2}-\d{2}$/.test(profile.shiftAnchor||'')?monday(profile.shiftAnchor):null;
 const weeks=anchor?Math.round((new Date(start+'T12:00:00')-new Date(anchor+'T12:00:00'))/604800000):0;
 const morning=shift==='morning'||(shift==='alternate'&&weeks%2===0);
 const afternoon=shift==='afternoon'||(shift==='alternate'&&weeks%2!==0);
 const candidates=[0,1,2,3,4,5,6].filter(d=>!unavailable.has(d));
 if(candidates.length<count)return {offsets:preferred,reason:'Disponibilità insufficiente: controlla i giorni esclusi; proposta provvisoria.'};
 let best=null,score=-Infinity;
 // Solo 35 combinazioni per 3 giorni: ricerca esaustiva, riproducibile e trasparente.
 function visit(chosen,from){
  if(chosen.length===count){
   let v=0;
   for(const d of chosen){
    if(preferred.includes(d))v+=7;
    if(d>=4)v+=1;
    if(morning&&d<=3)v-=1; // turno mattina: leggero favore per i giorni liberi
    if(afternoon&&d<=3)v-=2; // turno pomeriggio: più cautela sulla disponibilità
   }
   for(let i=1;i<chosen.length;i++){
    const gap=chosen[i]-chosen[i-1];
    v+=gap>=2?5:-9;
   }
   if(v>score){score=v;best=[...chosen]}
   return;
  }
  for(let i=from;i<candidates.length;i++)visit([...chosen,candidates[i]],i+1);
 }
 visit([],0);
 const shiftText=shift==='alternate'?(morning?'turno mattina':'turno pomeriggio'):morning?'turno mattina':afternoon?'turno pomeriggio':'nessun turno indicato';
 return {offsets:best,reason:`Calendario proposto considerando ${shiftText}, giorni disponibili e recupero tra le sessioni. ${best.some(d=>!preferred.includes(d))?'Alcuni giorni sono diversi dalle preferenze iniziali.':'Sono rispettati i giorni preferiti.'}`};
}
function movePlannedSession(week,id,target){
 const session=week.sessions.find(x=>x.id===id);
 if(!session||session.completed||week.sessions.some(x=>x.id!==id&&x.date===target))return false;
 if(target<week.start||target>plusDays(week.start,6))return false;
 session.date=target;
 week.sessions.sort((a,b)=>a.date.localeCompare(b.date));
 return true;
}
// Obiettivi distinti: indicazioni generali, non prescrizioni cliniche.
// La ripresa privilegia sempre un volume prudente, qualunque sia l'obiettivo dichiarato.
const GOAL_POLICIES={
 forza:{label:'Forza',reps:6,min:5,max:10,step:1,focus:'qualità del movimento e progressione controllata'},
 muscolo:{label:'Ipertrofia',reps:10,min:8,max:15,step:1,focus:'volume sostenibile e ripetizioni controllate'},
 benessere:{label:'Benessere',reps:8,min:6,max:12,step:1,focus:'regolarità, tecnica e recupero'},
 composizione:{label:'Composizione corporea',reps:10,min:8,max:15,step:1,focus:'forza di base, continuità e attività sostenibile'}
};
function goalPolicy(profile){return GOAL_POLICIES[profile?.goal]||GOAL_POLICIES.benessere}
function goalPrescription(profile,previous,signals,cycleWeek){
 const policy=goalPolicy(profile);
 const novice=profile?.level!=='attivo';
 const first=!previous;
 const prev=Number.isInteger(previous?.reps)?previous.reps:policy.reps;
 let reps=first?policy.reps:prev;
 if(!first&&signals.difficult)reps=Math.max(policy.min,prev-2);
 else if(!first&&signals.easy&&!signals.painful&&cycleWeek!==4)reps=Math.min(policy.max,prev+policy.step);
 if(signals.painful||cycleWeek===4)reps=Math.min(reps,prev);
 const duration=Number(profile?.duration)||30;
 const baseSets=duration>=45?2:1;
 // Per la ripresa: volume ridotto; per utenti attivi con obiettivo ipertrofia, volume moderato.
 const sets=cycleWeek===4?1:(!novice&&policy.label==='Ipertrofia'&&duration>=60?3:baseSets);
 return {policy,reps,sets,novice};
}
// La continuità distingue spostamenti, assenze e pause: nessuna seduta saltata è conteggiata come svolta.
function continuityAssessment(previous,nextStart,history=[]){
 if(!previous)return {kind:'first',weeks:0,missed:0,reason:'Primo programma.',resume:false};
 const elapsed=Math.max(0,Math.round((new Date(nextStart+'T12:00:00')-new Date(previous.start+'T12:00:00'))/604800000));
 const missed=(previous.sessions||[]).filter(x=>!x.completed).length;
 const done=(previous.sessions||[]).filter(x=>x.completed).length;
 const last=[...(history||[])].filter(x=>x.completed&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.date<nextStart).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const idleWeeks=last?Math.max(0,Math.floor((new Date(nextStart+'T12:00:00')-new Date(last.date+'T12:00:00'))/604800000)):elapsed;
 if(elapsed>1||(last&&idleWeeks>=2))return {kind:'pause',weeks:Math.max(elapsed,idleWeeks),missed,reason:'Ripresa dopo una pausa: propongo una settimana più leggera, senza incrementi automatici. Lo storico resta disponibile.',resume:true};
 if(missed&&done===0&&previous.approved)return {kind:'missed',weeks:elapsed,missed,reason:'Nessuna seduta completata nella settimana precedente: ripartiamo senza aumentare la difficoltà.',resume:true};
 if(missed)return {kind:'partial',weeks:elapsed,missed,reason:`${missed} seduta/e non completata/e: manteniamo la difficoltà e riprendiamo con gradualità.`,resume:false};
 return {kind:'regular',weeks:elapsed,missed:0,reason:'Continuità regolare: consideriamo i feedback delle sedute concluse.',resume:false};
}
// Il motivo della pausa è dichiarato dall’utente: non è una valutazione clinica.
function pauseGate(week){
 const c=week?.continuity;
 if(!c||!['pause','missed'].includes(c.kind))return {blocked:false,reason:''};
 if(!['logistics','physical'].includes(week.pauseReason))return {blocked:true,reason:'Indica prima il motivo dell’interruzione: il Coach non può dedurlo dai dati.'};
 if(week.pauseReason==='physical')return {blocked:true,reason:'Hai indicato un problema fisico. MASTER-Fit sospende la ripresa automatica: confrontati con un professionista sanitario prima di tornare ad allenarti. Per riprendere, serve una nuova valutazione del percorso.'};
 return {blocked:false,reason:'Pausa dovuta a impegni: settimana di rientro prudente, previa approvazione.'};
}
function setPauseReason(week,reason){
 if(!week?.continuity||!['pause','missed'].includes(week.continuity.kind)||!['logistics','physical'].includes(reason))return false;
 week.pauseReason=reason;week.approved=false;return true;
}
function continuityCard(week){
 const c=week?.continuity;if(!c||c.kind==='first'||c.kind==='regular')return '';
 const needsReason=['pause','missed'].includes(c.kind);
 const gate=pauseGate(week);
 return `<section class="card"><p class="eyebrow">✦ CONTINUITÀ DEL PERCORSO</p><h3>${c.kind==='pause'?'Bentornato':c.kind==='missed'?'Ripartiamo con calma':'Settimana incompleta'}</h3><p>${escapeHtml(c.reason)}</p>${needsReason?`<form id="pauseReasonForm"><label for="pauseReason">Perché hai interrotto gli allenamenti?</label><select id="pauseReason" required><option value="" ${!week.pauseReason?'selected':''}>Seleziona un motivo</option><option value="logistics" ${week.pauseReason==='logistics'?'selected':''}>Impegni, tempo o organizzazione</option><option value="physical" ${week.pauseReason==='physical'?'selected':''}>Dolore, infortunio, malessere o altro problema fisico</option></select><button class="btn alt" type="submit">Salva motivo</button></form><p class="small muted">${escapeHtml(gate.reason)}</p>`:''}<p class="small muted">I risultati precedenti restano nel diario. Questa proposta richiede la tua approvazione.</p></section>`;
}
function weekPlan(profile,start,previous,history=[]){
 const continuity=continuityAssessment(previous,start,history);
 const trained=(previous?.sessions||[]).filter(s=>s.status==='done'||s.status==='partial'||s.completed);
 const feedback=trained.map(s=>s.feedback).filter(Boolean);
 const painful=feedback.some(f=>f.pain==='yes');
 const difficult=feedback.some(f=>f.effort==='hard');
 const finished=trained.filter(s=>s.status==='done'||(!s.status&&s.completed&&!s.partial)).length;
 const easy=feedback.length>=2&&finished>=2&&trained.every(s=>s.status==='done'||(!s.status&&s.completed&&!s.partial))&&feedback.every(f=>f.effort==='easy'&&f.pain==='no');
 const cycleWeek=previous?((Number.isInteger(previous.cycleWeek)&&previous.cycleWeek>=1?previous.cycleWeek:1)%4)+1:1;
 const recoveryWeek=cycleWeek===4;
 const prescription=goalPrescription(profile,previous,{painful,difficult,easy:easy&&!continuity.resume&&continuity.missed===0},cycleWeek);
 const {policy}=prescription;
 let {reps,sets}=prescription;
 if(continuity.resume){reps=Math.min(reps,Number(previous?.reps)||reps,policy.reps);sets=Math.min(sets,1);}
 let reason=painful?'Hai segnalato dolore o fastidi insoliti: non aumento la difficoltà. Evita i movimenti che provocano sintomi e chiedi una valutazione professionale.':difficult?'Hai riferito fatica elevata: propongo un consolidamento con ripetizioni ridotte.':easy?'Hai completato gli allenamenti con facilità e senza fastidi: propongo una piccola progressione.':'Manteniamo il programma per consolidare tecnica e regolarità.';
 if(!previous)reason='Iniziamo gradualmente per conoscere il tuo livello attuale.';
 if(continuity.kind!=='first'&&continuity.kind!=='regular')reason=continuity.reason+' '+reason;
 if(recoveryWeek&&!painful)reason='Settimana 4/4: consolidamento e recupero programmato. Riduciamo il numero di serie e non aumentiamo le ripetizioni. '+reason;
 reason=`Obiettivo ${policy.label}: priorità a ${policy.focus}. ${reason} ${prescription.novice?'Dato il livello iniziale, privilegiamo un volume prudente.':''}`;
 const schedule=adaptiveOffsets(profile,start);
 const days=schedule.offsets;
 const sessions=days.map((offset,i)=>({id:`${start}-${i}`,date:plusDays(start,offset),label:i%2?'Forza B':'Forza A',completed:false,status:'planned',feedback:null}));
 return {start,continuity,decisionSource:previous?{start:previous.start,sessions:previous.sessions.map(x=>({date:x.date,status:x.status,completed:x.completed,partial:x.partial,feedback:x.feedback}))}:null,scheduleReason:schedule.reason,goal:profile.goal||'benessere',goalLabel:policy.label,reps,sets,sessions,reason,approved:false,previous:previous?.start||null,cycleWeek,phase:recoveryWeek?'recupero':cycleWeek===1?'base':cycleWeek===2?'consolidamento':'sviluppo'};
}
// Registro verificabile delle motivazioni: ogni dato è distinto dalle regole applicate.
function decisionEvidence(week,previous,sessions){
 const prior=(previous?.sessions||[]);
 const trained=prior.filter(x=>x.completed||x.status==='done'||x.status==='partial');
 const complete=trained.filter(x=>x.status==='done'||(!x.status&&x.completed&&!x.partial));
 const partial=trained.filter(x=>x.status==='partial'||x.partial);
 const feedback=trained.map(x=>x.feedback).filter(Boolean);
 const pain=feedback.filter(x=>x.pain==='yes').length;
 const hard=feedback.filter(x=>x.effort==='hard').length;
 const easy=feedback.filter(x=>x.effort==='easy').length;
 const sameWeek=(sessions||[]).filter(x=>x.date>= (previous?.start||'9999-12-31')&&x.date<=plusDays(previous?.start||'9999-12-31',6));
 const observed=previous?[`${complete.length} sedute complete, ${partial.length} parziali su ${prior.length} previste`,`${feedback.length} feedback ricevuti: ${easy} facili, ${hard} faticosi, ${pain} con fastidi`,`${sameWeek.length} registrazioni dettagliate nella settimana precedente`]:['Nessuna settimana precedente: non ci sono ancora prestazioni da confrontare'];
 const rules=[];
 if(pain)rules.push('Fastidi segnalati: la progressione viene sospesa; occorre una valutazione appropriata.');
 else if(hard)rules.push('Fatica elevata: priorità al consolidamento.');
 else if(previous&&feedback.length>=2&&complete.length>=2&&complete.length===prior.length&&easy===feedback.length)rules.push('Tutte le sedute completate con feedback facile: possibile piccolo incremento.');
 else rules.push('Dati insufficienti per aumentare: mantenimento e consolidamento.');
 if(week.cycleWeek===4)rules.push('Quarta settimana del ciclo: riduzione programmata delle serie.');
 rules.push('La proposta richiede approvazione: non è una misurazione fisiologica.');
 return {observed,rules,sourceWeek:previous?.start||null};
}
function evidenceCard(week,previous,sessions){
 const e=decisionEvidence(week,previous,sessions);
 return `<details class="card evidence-card"><summary>✦ Perché il Coach propone questo piano?</summary><h3>Dati osservati</h3><ul>${e.observed.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><h3>Regole applicate</h3><ul>${e.rules.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><p class="small muted">${e.sourceWeek?'Settimana di riferimento: '+escapeHtml(e.sourceWeek):'Prima programmazione'} · Nessuna stima di forza massima o recupero biologico.</p></details>`;
}
// Individual exercise targets: based on recorded repetitions, not assumed strength measurements.
function exerciseTarget(exercise,week,history){
 const base=week.reps;
 const cap=GOAL_POLICIES[week.goal]?.max||20;
 const matches=(history||[]).filter(session=>session.date<week.start&&session.feedback&&Array.isArray(session.exercises))
  .sort((a,b)=>b.date.localeCompare(a.date));
 const recent=matches.find(session=>session.exercises.some(x=>(x.catalogId||x.variant)===(exercise.catalogId||exercise.variant)&&Array.isArray(x.actual)&&x.actual.length));
 if(!recent)return {reps:base,reason:'Obiettivo iniziale: raccogliamo le prime prestazioni.'};
 const prev=recent.exercises.find(x=>(x.catalogId||x.variant)===(exercise.catalogId||exercise.variant)&&Array.isArray(x.actual)&&x.actual.length);
 const recorded=prev.actual.filter(n=>Number.isInteger(n)&&n>=0);
 if(!recorded.length)return {reps:base,reason:'Mancano ripetizioni effettive affidabili.'};
 const minimum=Math.min(...recorded);
 const pain=recent.feedback.pain==='yes';
 const partial=!recent.completed||prev.skipped;
 const hard=recent.feedback.effort==='hard';
 const easy=recent.feedback.effort==='easy';
 if(pain)return {reps:Math.min(base,minimum),reason:'Fastidi segnalati: nessuna progressione; verifica prima di riprendere.'};
 if(partial||hard||minimum<base)return {reps:Math.max(1,Math.min(base,minimum)),reason:'Consolidamento in base alle serie effettivamente registrate.'};
 if(easy&&minimum>=base&&week.phase!=='recupero'){const loads=prev.actualLoads||[];const comparable=(!loads.length)||loads.length===recorded.length&&(loads.every(x=>x===null)||loads.every(x=>typeof x==='number'&&x===loads[0]));if(!comparable)return {reps:base,reason:'Carichi variabili o incompleti: consolidiamo prima di aumentare le ripetizioni.'};return {reps:Math.min(cap,base+1),reason:'Piccola progressione delle ripetizioni proposta: serie precedenti completate facilmente, con carico uniforme.'};}
 return {reps:base,reason:'Manteniamo il livello per consolidare il movimento.'};
}
// Regole trasparenti: nessuna stima clinica del recupero.
// Carichi registrati per serie: null = corpo libero o dato non indicato.
// Il sistema non stima 1RM e non prescrive incrementi in kg senza dati affidabili.
function normalizeLoad(value){
 if(value===null||value===undefined||String(value).trim()==='')return null;
 const n=Number(String(value).replace(',','.'));
 return Number.isFinite(n)&&n>=0&&n<=500&&Math.round(n*4)===n*4?n:NaN;
}
function loadSummary(exercise){
 const loads=(exercise?.actualLoads||[]).filter(n=>typeof n==='number'&&Number.isFinite(n));
 if(!loads.length)return 'Carico non registrato';
 const unique=[...new Set(loads)];
 return unique.length===1?`${unique[0]} kg registrati`:`Carichi: ${loads.join(' / ')} kg`;
}
function loadAdvice(exercise,history){
 const key=exercise.catalogId||exercise.variant;
 const previous=(history||[]).filter(s=>s.feedback?.pain==='no'&&s.completed).slice().reverse().flatMap(s=>s.exercises||[]).find(e=>(e.catalogId||e.variant)===key&&(e.actualLoads||[]).some(n=>typeof n==='number'));
 if(!previous)return 'Nessun carico precedente registrato. Scegli solo un carico che controlli bene; non serve un test massimale.';
 return `Ultima seduta completa: ${loadSummary(previous)}. Riparti da un carico gestibile; nessun aumento automatico in kg.`;
}
// Confronto descrittivo fra due sessioni: nessuna stima di 1RM o forza massima.
function compareExercisePerformance(previous,current){
 const valid=e=>Array.isArray(e?.actual)&&e.actual.length>0&&e.actual.every(n=>Number.isInteger(n)&&n>=0)&&!e.skipped;
 if(!valid(previous)||!valid(current))return {kind:'insufficient',label:'Dati insufficienti',reason:'Mancano serie registrate o il movimento è stato saltato.'};
 const a=previous.actual,b=current.actual;
 if(a.length!==b.length)return {kind:'different-volume',label:'Serie diverse',reason:'Numero di serie differente: confronto diretto non affidabile.'};
 const load=e=>{const v=e.actualLoads;if(!Array.isArray(v)||v.length!==e.actual.length||!v.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0))return null;return v.every(n=>n===v[0])?v[0]:null};
 const oldLoad=load(previous),newLoad=load(current);
 const oldReps=a.reduce((x,y)=>x+y,0),newReps=b.reduce((x,y)=>x+y,0);
 if(oldLoad===null||newLoad===null){
  if(oldLoad!==newLoad)return {kind:'incomparable',label:'Carichi non confrontabili',reason:'Carico assente o variabile in almeno una sessione.'};
  if(newReps>oldReps)return {kind:'reps-up',label:`+${newReps-oldReps} ripetizioni`,reason:'Più ripetizioni totali a parità di numero di serie; carico esterno non documentato.'};
  if(newReps<oldReps)return {kind:'reps-down',label:`${newReps-oldReps} ripetizioni`,reason:'Meno ripetizioni totali; carico esterno non documentato.'};
  return {kind:'stable',label:'Ripetizioni stabili',reason:'Stesso numero di serie e ripetizioni; carico esterno non documentato.'};
 }
 if(newLoad>oldLoad&&newReps>=oldReps)return {kind:'load-up',label:`Carico +${+(newLoad-oldLoad).toFixed(2)} kg`,reason:'Carico esterno maggiore con ripetizioni totali non inferiori.'};
 if(newLoad<oldLoad&&newReps<=oldReps)return {kind:'load-down',label:`Carico ${+(newLoad-oldLoad).toFixed(2)} kg`,reason:'Carico esterno inferiore e ripetizioni non superiori.'};
 if(newLoad===oldLoad&&newReps>oldReps)return {kind:'reps-up',label:`+${newReps-oldReps} ripetizioni`,reason:'Più ripetizioni totali con lo stesso carico esterno.'};
 if(newLoad===oldLoad&&newReps<oldReps)return {kind:'reps-down',label:`${newReps-oldReps} ripetizioni`,reason:'Meno ripetizioni totali con lo stesso carico esterno.'};
 if(newLoad===oldLoad&&newReps===oldReps)return {kind:'stable',label:'Prestazione stabile',reason:'Stesse serie, ripetizioni e carico esterno.'};
 return {kind:'tradeoff',label:'Prestazione diversa',reason:'Carico e ripetizioni sono cambiati in direzioni diverse: non è possibile dichiarare un progresso univoco.'};
}
function performanceComparisons(sessions){
 const latest=new Map(),out=[];
 for(const session of [...(sessions||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date)))){
  if(!session.completed||session.feedback?.pain==='yes')continue;
  for(const e of session.exercises||[]){
   const key=e.catalogId||e.variant;if(!key||!Array.isArray(e.actual)||!e.actual.length||e.skipped)continue;
   const old=latest.get(key);
   if(old){const result=compareExercisePerformance(old.exercise,e);out.push({key,name:e.name||key,date:session.date,...result});}
   latest.set(key,{exercise:e,date:session.date});
  }
 }
 return out;
}
// Diario narrativo basato esclusivamente su eventi registrati: niente traguardi inventati.
function coachDiary(sessions,limit=12){
 const events=[];
 const ordered=[...(sessions||[])].filter(s=>s&&s.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 const lastByExercise=new Map();
 let completed=0;
 for(const s of ordered){
  const date=String(s.date),label=String(s.label||'Allenamento');
  const finished=!!s.completed;
  if(finished)completed++;
  events.push({date,kind:finished?'session':'partial',title:finished?'Sessione completata':'Sessione parziale',detail:label+(s.feedback?.effort==='hard'?' · Hai segnalato fatica elevata.':'')});
  if(s.feedback?.pain==='yes')events.push({date,kind:'caution',title:'Fastidio segnalato',detail:'Il feedback segnala dolore o fastidi. Non usarlo come indicazione per aumentare il carico; valuta i sintomi con un professionista.'});
  if(!finished||s.feedback?.pain==='yes')continue;
  for(const e of s.exercises||[]){
   const key=e.catalogId||e.variant;
   if(!key||e.skipped||!Array.isArray(e.actual)||!e.actual.length)continue;
   const prior=lastByExercise.get(key);
   if(prior){
    const result=compareExercisePerformance(prior,e);
    if(['load-up','reps-up','stable'].includes(result.kind)){
     events.push({date,kind:result.kind==='stable'?'stable':'progress',title:result.kind==='stable'?'Prestazione consolidata':'Progressione registrata',detail:String(e.name||key)+' · '+result.label+'. '+result.reason});
    }
   }else{
    events.push({date,kind:'first',title:'Primo riferimento',detail:String(e.name||key)+' · Registrazione iniziale utile per i confronti futuri.'});
   }
   lastByExercise.set(key,e);
  }
  if([5,10,20,50,100].includes(completed))events.push({date,kind:'milestone',title:completed+' sessioni completate',detail:'Traguardo di costanza registrato nel diario.'});
 }
 return events.slice(-Math.max(0,Math.min(100,Number(limit)||12))).reverse();
}
function diaryCard(){
 const events=coachDiary(state.sessions,12);
 return `<section class="card diary-card"><p class="eyebrow">MASTER COACH · MEMORIA DEL PERCORSO</p><h2>Il tuo diario evolutivo</h2><p class="small muted">Una cronologia di risultati realmente registrati, senza punteggi di recupero inventati.</p>${events.map(e=>`<article class="diary-event diary-${escapeHtml(e.kind)}"><div class="diary-dot" aria-hidden="true"></div><div><time>${escapeHtml(e.date)}</time><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.detail)}</p></div></article>`).join('')||'<p class="muted">Il diario si riempirà dopo il primo allenamento. Ogni risultato sarà basato sui dati che registri.</p>'}</section>`;
}
function readinessProposal(checkin,week){
 if(!checkin||checkin.symptoms==='yes')return {kind:'stop',reason:'Hai segnalato dolore o sintomi insoliti: non avviare la sessione e richiedi una valutazione professionale.'};
 if(checkin.energy==='low'||checkin.sleep==='poor'){
  if(week.sets>1)return {kind:'lighter',sets:week.sets-1,reps:week.reps,reason:'Energia bassa o sonno insufficiente: propongo una serie in meno per esercizio, solo per la prossima sessione.'};
  return {kind:'lighter',sets:1,reps:Math.max(3,week.reps-2),reason:'Energia bassa o sonno insufficiente: propongo due ripetizioni in meno per serie, solo per la prossima sessione.'};
 }
 return {kind:'normal',sets:week.sets,reps:week.reps,reason:'Nessuna modifica proposta sulla base del check-in. Procedi ascoltando le tue sensazioni.'};
}
function currentReadiness(){return state.checkin?.date===today()?readinessProposal(state.checkin,state.week):null}
function readinessCard(){
 const r=currentReadiness();if(!r)return '<div class="card"><h3>Come ti senti oggi?</h3><p class="muted small">Il check-in facoltativo aiuta a valutare se alleggerire la sessione.</p><button class="btn alt" id="openReadiness">Fai il check-in →</button></div>';
 return `<div class="card ${r.kind==='stop'?'notice':''}"><p class="eyebrow">CHECK-IN DI OGGI</p><h3>${r.kind==='stop'?'Allenamento da sospendere':r.kind==='lighter'?'Il Coach propone una seduta più leggera':'Programma invariato'}</h3><p>${escapeHtml(r.reason)}</p>${r.kind==='lighter'?`<p class="small muted">${r.sets} serie · ${r.reps} ripetizioni base. La modifica riguarda una sola seduta.</p><button class="btn ${state.checkin.approved?'alt':''}" id="approveReadiness">${state.checkin.approved?'✓ Riduzione approvata':'Approva seduta alleggerita'}</button><button class="btn ghost" id="declineReadiness">${state.checkin.declined?'✓ Proposta rifiutata':'Mantieni la scheda originale'}</button>`:''}</div>`;
}
// Proposta di calendario: usa solo dati dichiarati e registrati, senza stimare il recupero fisiologico.
function scheduleAdvice(week,checkin,history,referenceDate){
 if(!week?.approved||!Array.isArray(week.sessions))return null;
 const next=week.sessions.filter(x=>!x.completed&&x.date>=referenceDate).sort((a,b)=>a.date.localeCompare(b.date))[0];
 if(!next)return null;
 if(checkin?.date===referenceDate&&checkin.symptoms==='yes')return {kind:'stop',reason:'Hai segnalato sintomi insoliti. Non riprogrammare automaticamente: richiedi una valutazione professionale.'};
 const recent=(history||[]).filter(x=>x.feedback&&x.date<=referenceDate).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const low=next.date===referenceDate&&checkin?.date===referenceDate&&(checkin.energy==='low'||checkin.sleep==='poor');
 const strained=recent&&recent.date>=plusDays(referenceDate,-7)&&(recent.feedback.effort==='hard'||!recent.completed);
 if(!low&&!strained)return null;
 const reasons=[];
 if(low)reasons.push('oggi hai segnalato energia bassa o sonno insufficiente');
 if(strained)reasons.push('l’ultima sessione è stata faticosa o parziale');
 const occupied=new Set(week.sessions.filter(x=>x.id!==next.id).map(x=>x.date));
 let target=null;
 for(let n=1;n<=3;n++){
  const candidate=plusDays(next.date,n);
  if(candidate<=plusDays(week.start,6)&&candidate>=referenceDate&&!occupied.has(candidate)){
   target=candidate;break;
  }
 }
 const reason='Ti propongo di rivedere la prossima seduta perché '+reasons.join(' e ')+'. Non è una misurazione del recupero.';
 return target?{kind:'move',sessionId:next.id,from:next.date,to:target,reason}: {kind:'review',reason:reason+' Non trovo una data libera vicina in questa settimana: valuta una seduta alleggerita o una ripianificazione manuale.'};
}
function currentScheduleAdvice(){return scheduleAdvice(state.week,state.checkin,state.sessions,today())}
function scheduleAdviceCard(){
 const a=currentScheduleAdvice();if(!a||a.kind==='move'&&state.scheduleDismissed===a.sessionId+'|'+a.from+'|'+a.to+'|'+today())return '';
 return `<section class="card ${a.kind==='stop'?'notice':'feature'}"><p class="eyebrow">✦ CALENDARIO ADATTIVO</p><h3>${a.kind==='move'?'Proposta di rinvio':a.kind==='stop'?'Prima la sicurezza':'Rivediamo il calendario'}</h3><p>${escapeHtml(a.reason)}</p>${a.kind==='move'?`<p class="small muted">Dal ${escapeHtml(a.from)} al ${escapeHtml(a.to)} · nessuna modifica senza conferma.</p><button class="btn" id="acceptScheduleAdvice">Approva lo spostamento</button><button class="btn ghost" id="dismissScheduleAdvice">Mantieni la data attuale</button>`:''}</section>`;
}
function header(){return `<div class="topbar"><div class="logo-mark">M<span>✓</span></div><div class="brand">MASTER<span>-Fit</span><small>EVOLVE · PERSONAL TRAINER</small></div><button class="avatar" id="coachOpen" aria-label="Apri Coach">✦</button></div>`}

function field(name,label,value,type='text'){return `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${type==='number'?'min="1"':''} required>`}
function onboarding(){return `${header()}<p class="eyebrow">Benvenuto</p><h1 class="hero">Conosciamoci.<br>Al resto penso io.</h1><p class="muted">Solo la prima volta: preparo il programma in base ai tuoi obiettivi e a quello che hai a disposizione.</p><form id="setup" class="card">${field('name','Come vuoi essere chiamato?','')}${field('age','Età (anni)','','number')}<div class="grid"><div>${field('height','Altezza (cm)','','number')}</div><div>${field('weight','Peso (kg)','','number')}</div></div><label for="goal">Obiettivo principale</label><select id="goal"><option value="forza">Recuperare forza</option><option value="muscolo">Aumentare massa muscolare</option><option value="benessere">Migliorare energia e forma</option><option value="composizione">Migliorare composizione corporea</option></select><label for="level">Situazione attuale</label><select id="level"><option value="ripresa">Riprendo dopo una lunga pausa</option><option value="inizio">Non mi sono mai allenato</option><option value="attivo">Mi alleno già</option></select><details class="card assessment"><summary><b>Come ti muovi oggi?</b> · 4 risposte facoltative</summary><p class="small muted">Non eseguire prove fisiche: scegli solo ciò che sai già fare comodamente. Se hai dolore o sintomi insoliti, chiedi una valutazione prima di allenarti.</p>${[['squat','Sederti e rialzarti'],['push','Spingere con le braccia'],['hinge','Movimenti di anche e glutei'],['core','Stabilità del tronco']].map(([key,label])=>`<label for="cap_${key}">${label}</label><select id="cap_${key}"><option value="">Non so / preferisco iniziare facile</option><option value="supported">Preferisco una versione molto facilitata</option><option value="basic">Gestisco movimenti semplici</option><option value="comfortable">Mi sento a mio agio con varianti di base</option></select>`).join('')}</details><label for="duration">Tempo che vorresti dedicare</label><select id="duration"><option value="30">30 minuti</option><option value="45">45 minuti</option><option value="60" selected>60 minuti</option></select><label for="days">Giorni di allenamento settimanali</label><select id="days"><option value="2" selected>2 giorni</option><option value="3">3 giorni</option></select><label for="trainingDays">Giorni preferiti (facoltativo)</label><p class="small muted">Scegli 2 o 3 giorni; se non scegli nulla il Coach li distribuirà nella settimana.</p><div class="weekday-options">${[0,1,2,3,4,5,6].map((d)=>`<label><input type="checkbox" name="trainingDay" value="${d}"> ${['Lun','Mar','Mer','Gio','Ven','Sab','Dom'][d]}</label>`).join('')}</div><label for="shiftMode">Turni di lavoro (facoltativo)</label><select id="shiftMode"><option value="none">Nessun turno da considerare</option><option value="morning">Turno mattina</option><option value="afternoon">Turno pomeriggio</option><option value="alternate">Alternanza settimanale mattina / pomeriggio</option></select><label for="shiftAnchor">Se alterni i turni: lunedì di una settimana con turno mattina</label><input id="shiftAnchor" type="date"><label>Giorni in cui non puoi allenarti (facoltativo)</label><div class="weekday-options">${[0,1,2,3,4,5,6].map(d=>`<label><input type="checkbox" name="unavailableDay" value="${d}"> ${['Lun','Mar','Mer','Gio','Ven','Sab','Dom'][d]}</label>`).join('')}</div><label>Attrezzatura disponibile</label><p class="small muted">Il corpo libero è sempre incluso.</p><label><input type="checkbox" name="eq" value="dumbbells"> Manubri</label><label><input type="checkbox" name="eq" value="bands"> Elastici</label><label><input type="checkbox" name="eq" value="barbell"> Bilanciere e supporti adeguati</label><label><input type="checkbox" name="eq" value="machines"> Macchine da palestra</label><label><input type="checkbox" name="eq" value="pullup"> Barra per trazioni stabile</label><p class="notice small">Se hai dolore, sintomi neurologici o altri problemi in corso, chiedi una valutazione medica prima di iniziare. L'app non sostituisce un professionista.</p><button class="btn">Prepara il mio percorso</button></form>`}
function home(){
 const w=state.week,p=state.profile,next=w.sessions.find(s=>!s.completed),done=w.sessions.filter(s=>s.completed).length;
 const name=escapeHtml(p.name||'Atleta');const pct=Math.round(100*done/w.sessions.length);
 const goal=({forza:'Recuperare la forza',muscolo:'Costruire muscolo',benessere:'Energia e forma',composizione:'Composizione corporea'})[p.goal]||'Benessere';
 return `${header()}<section class="hero-panel"><div class="hero-scene" aria-hidden="true"><div class="hero-scene-rome"></div><div class="hero-scene-athlete"></div></div><div class="hero-brand" aria-hidden="true"><span>MF</span><small>EVOLVE</small></div><p class="eyebrow">IL TUO PERCORSO · SETTIMANA ${Math.max(1,Math.floor((new Date(w.start)-new Date(state.sessions[0]?.date||w.start))/604800000)+1)}</p><h1>Ciao, ${name}<span class="lime">.</span></h1><p>Ogni passo conta. Il tuo prossimo progresso inizia qui.</p><div class="hero-progress" role="img" aria-label="${pct}% delle sessioni settimanali completate" style="--hero-pct:${pct}%"><strong>${pct}%</strong><small>Settimana</small></div><div class="stat-strip"><div><b>${done}</b><small>Sessioni svolte</small></div><div><b>${p.days}</b><small>Obiettivo settimanale</small></div><div><b>${state.sessions.length}</b><small>Allenamenti totali</small></div></div></section>
 ${!w.approved?`<section class="card feature"><p class="eyebrow">✦ FASE ${escapeHtml(w.phase||'base').toUpperCase()} · ${w.cycleWeek||1}/4</p><h2>La tua settimana è pronta</h2><p>${escapeHtml(w.reason)}</p><div class="mini-row">${w.sessions.length} sessioni · ${w.sets} serie per esercizio · obiettivo ${escapeHtml(goal)}</div><button class="btn" id="approve">Approva il mio piano →</button></section>`:next?`<section class="card feature"><p class="eyebrow">✦ ALLENAMENTO IN PROGRAMMA</p><h2>${escapeHtml(next.label)}</h2><p>Sessione guidata · ${p.duration} minuti disponibili · ${w.sessions.length-done} sessioni da svolgere</p><button class="btn" id="start">Inizia allenamento →</button></section>`:`<section class="card feature"><p class="eyebrow">✓ SETTIMANA CONCLUSA</p><h2>Ottimo lavoro.</h2><p>Le tue risposte aiuteranno il coach a preparare la prossima proposta.</p><button class="btn" id="nextweek">Prepara la prossima settimana →</button></section>`}
 <section class="cinematic-summary" aria-label="Riepilogo della settimana"><div class="summary-ring" style="--completion:${pct}%"><strong>${pct}%</strong><small>Completamento<br>settimana</small></div><div class="summary-copy"><span class="eyebrow">IL TUO OBIETTIVO</span><h3>${escapeHtml(goal)}</h3><p>${done} di ${w.sessions.length} sessioni completate. Il Coach usa solo i dati registrati.</p></div></section>${continuityCard(w)}${evidenceCard(w,w.decisionSource,state.sessions)}${movementReviewCard()}${readinessCard()}${scheduleAdviceCard()}<section class="card coach-teaser"><div class="coach-icon">✦</div><div><p class="eyebrow">MASTER COACH</p><h3>Il perché di ogni scelta</h3><p>Ti spiego il programma e come lo adatteremo ai tuoi risultati.</p><button class="text-button" id="coachCard">Parla con il Coach →</button></div></section>
 <div class="section-heading"><h2>Il tuo percorso</h2><button class="text-button" data-view="program">Vedi settimana →</button></div><div class="three-stats"><div class="card"><span>◎</span><small>Obiettivo</small><b>${escapeHtml(goal)}</b></div><div class="card"><span>◈</span><small>Peso</small><b>${p.weight} kg</b></div><div class="card"><span>↗</span><small>Costanza</small><b>${done}/${w.sessions.length}</b></div></div>
 <div class="card tip"><p class="eyebrow">CONSIGLIO DEL TRAINER</p><p>La progressione nasce dalla continuità. Dopo ogni sessione raccontami com'è andata: adatteremo il programma con prudenza.</p></div>${navigation('home')}`
}


function navigation(active){
 const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',program:'<path d="m6 5 12 14M18 5 6 19M4 3l4 4M16 17l4 4M16 7l4-4M4 21l4-4"/>',history:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>',library:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h6"/>',settings:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'};
 const links=[['home','Home'],['program','Allenati'],['history','Progressi'],['library','Esercizi'],['settings','Profilo']];
 return `<nav class="bottom-nav" aria-label="Navigazione principale">${links.map(([id,label])=>`<button type="button" data-view="${id}" class="${active===id?'selected':''}" aria-label="${label}" ${active===id?'aria-current="page"':''}><span class="nav-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg></span><small>${label}</small></button>`).join('')}</nav>`;
}
function program(){const w=state.week;return `${header()}<p class="eyebrow">LA TUA STRATEGIA</p><h1 class="hero">Programma settimanale</h1><div class="card feature"><p class="eyebrow">SETTIMANA DAL ${escapeHtml(w.start)} · ${escapeHtml(w.phase||'base').toUpperCase()} ${w.cycleWeek||1}/4</p><h2>${w.approved?'Piano approvato':'In attesa della tua approvazione'}</h2><p>${escapeHtml(w.reason)}</p><p class="small muted">${escapeHtml(w.scheduleReason||'Giorni distribuiti secondo le preferenze del profilo.')}</p><p class="small muted">${escapeHtml(capabilitySummary(state.profile))}</p><p class="small muted">Strategia: ${escapeHtml(w.goalLabel||goalPolicy(state.profile).label)} · ${w.sets} serie per esercizio · ${w.reps} ripetizioni iniziali indicative</p>${!w.approved&&!pauseGate(w).blocked?'<button class="btn" id="approve">Approva il programma →</button>':''}</div>${continuityCard(w)}${evidenceCard(w,w.decisionSource,state.sessions)}${movementReviewCard()}<div class="week-visual" aria-label="Giorni della settimana">${[0,1,2,3,4,5,6].map(i=>{const d=plusDays(w.start,i),entry=w.sessions.find(x=>x.date===d);return `<div class="week-day ${entry?'planned':''} ${entry?.completed?'complete':''}"><small>${['L','M','M','G','V','S','D'][i]}</small><strong>${Number(d.slice(-2))}</strong><span>${entry?(entry.completed?'✓':'●'):'·'}</span></div>`}).join('')}</div><div class="card">${w.sessions.map((x,i)=>`<div class="session-row"><span class="session-day">${i+1}</span><div><b>${escapeHtml(x.label)}</b><small>${escapeHtml(x.date)}</small></div><strong class="${x.completed?'lime':''}">${x.completed?(x.status==='partial'?'Parziale':'✓ Fatto'):'Da fare'}</strong></div>`).join('')}</div>${w.approved?`<div class="card"><h3>Imprevisto? Sposta una sessione</h3><p class="small muted">Puoi cambiare giorno senza perdere il programma. La modifica vale soltanto per questa settimana.</p><form id="reschedule"><label for="moveId">Allenamento</label><select id="moveId">${w.sessions.filter(x=>!x.completed).map(x=>`<option value="${escapeHtml(x.id)}">${escapeHtml(x.label)} · ${escapeHtml(x.date)}</option>`).join('')}</select><label for="moveDate">Nuova data</label><input id="moveDate" type="date" min="${w.start}" max="${plusDays(w.start,6)}" required><button class="btn alt">Sposta allenamento</button></form></div>`:''}${w.approved&&!pauseGate(w).blocked&&w.sessions.some(x=>!x.completed)?'<button class="btn" id="start">Inizia prossima sessione →</button>':''}${w.approved&&w.sessions.every(x=>x.completed)?'<button class="btn" id="nextweek">Prepara la prossima settimana →</button>':''}${navigation('program')}`}
function coach(){let w=state.week,c=state.checkin;return `${header()}<section class="coach-hero"><div class="coach-status"><span class="live-dot"></span> MASTER COACH <b>BETA</b></div><div class="coach-helmet" aria-hidden="true"></div><div class="coach-message">Ti aiuto a scegliere, capire e adattare il tuo allenamento.</div><div class="coach-signal" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><p class="eyebrow">MASTER COACH · EVOLVE</p><h1>Il tuo percorso.<br><span class="lime">Le tue regole.</span></h1><p>Ti accompagno in ogni sessione e ti spiego le proposte basate sui risultati che registri.</p></section><div class="coach-quick" aria-label="Azioni del Coach"><button type="button" data-view="program"><span class="quick-icon">▦</span>Visualizza il programma<span class="quick-arrow">›</span></button><button type="button" id="coachCheckin"><span class="quick-icon">♡</span>Controlla come stai oggi<span class="quick-arrow">›</span></button><button type="button" data-view="history"><span class="quick-icon">↗</span>Rivedi i tuoi progressi<span class="quick-arrow">›</span></button><button type="button" data-view="library"><span class="quick-icon">◎</span>Consulta le guide tecniche<span class="quick-arrow">›</span></button></div><div class="card feature"><p class="eyebrow">PERCHÉ QUESTO PROGRAMMA?</p><h2>La strategia della settimana · ${escapeHtml(w.phase||'base')} ${w.cycleWeek||1}/4</h2><p>${escapeHtml(w.reason)}</p><p class="small muted">Il Coach utilizza regole trasparenti, non una diagnosi medica o sensori di recupero.</p></div>${continuityCard(w)}${evidenceCard(w,w.decisionSource,state.sessions)}${movementReviewCard()}${readinessCard()}${scheduleAdviceCard()}<div class="card"><h2>Come ti senti oggi?</h2><p class="muted">Tre risposte per segnalare al trainer come stai.</p><form id="readiness"><label for="energy">Energia</label><select id="energy"><option value="normal" ${c?.energy==='normal'?'selected':''}>Normale</option><option value="low" ${c?.energy==='low'?'selected':''}>Bassa</option><option value="high" ${c?.energy==='high'?'selected':''}>Alta</option></select><label for="sleep">Sonno</label><select id="sleep"><option value="ok">Adeguato</option><option value="poor" ${c?.sleep==='poor'?'selected':''}>Insufficiente</option></select><label for="symptoms">Dolore o sintomi insoliti?</label><select id="symptoms"><option value="no">No</option><option value="yes" ${c?.symptoms==='yes'?'selected':''}>Sì</option></select><button class="btn">Salva check-in</button></form>${c?`<p class="small muted">Ultimo check-in: ${escapeHtml(c.date)}${c.symptoms==='yes'?' · Hai segnalato fastidi':''}</p>`:''}</div><button class="btn ghost" id="coachBack">Torna alla Home</button>${navigation('home')}`}
function exerciseList(label,profile){const hasPull=variants('pull',profile).length>0;return label==='Forza B'?(hasPull?['hinge','pull','squat','core']:['hinge','squat','push','core']):['squat','push','hinge','core']}
function buildExercises(label){
 let p=state.profile,keys=exerciseList(label,p);
 return keys.map(k=>{
  const choice=selectMovement(k,p,p.goal);
  if(choice){const e={key:k,catalogId:choice.id,name:choice.name,variant:choice.id,tip:choice.cue,done:0,actual:[],alternatives:catalogAvailable(p,k).filter(x=>x.id!==choice.id).slice(0,8).map(x=>x.id)};e.prescription=movementPrescription(k,p,state.week,choice);e.target=exerciseTarget(e,state.week,state.sessions);if(e.target.reason.startsWith('Obiettivo iniziale'))e.target={...e.target,reps:e.prescription.reps};return e;}
  const opts=variants(k,p),fallback=opts[0];
  const e={key:k,name:fallback?fallback[1]:MOVES[k].name+' (alternativa da definire)',variant:fallback?.[0]||null,tip:fallback?TIPS[fallback[0]]:'Nessuna variante compatibile disponibile.',done:0,actual:[]};e.prescription=movementPrescription(k,p,state.week,{equipment:fallback?.[2]});e.target=exerciseTarget(e,state.week,state.sessions);if(e.target.reason.startsWith('Obiettivo iniziale'))e.target={...e.target,reps:e.prescription.reps};return e;
 });
}
// Evoluzione prudente: usa solo sessioni concluse, senza dolore e con serie registrate.
// La proposta non viene applicata senza consenso; una scelta rifiutata non viene ripetuta per gli stessi dati.
function movementReview(pattern,profile,sessions,decisions={}){
 const usable=(sessions||[]).filter(s=>s.completed&&s.feedback?.pain==='no'&&!s.readinessApplied);
 const records=usable.map(s=>({session:s,exercise:(s.exercises||[]).find(e=>e.key===pattern&&!e.skipped&&e.catalogId)})).filter(x=>x.exercise);
 if(records.length<2)return null;
 const recent=records.slice(-2),[a,b]=recent.map(x=>x.exercise);
 if(a.catalogId!==b.catalogId)return null;
 const current=CATALOG.find(x=>x.id===b.catalogId);if(!current)return null;
 const consistent=recent.every(({session,exercise})=>session.feedback.effort!=='hard'&&exercise.actual?.length>=2&&exercise.actual.every(n=>Number.isInteger(n)&&n>=Number(exercise.target?.reps||999)));
 const struggling=recent.every(({session,exercise})=>session.feedback.effort==='hard'||(exercise.actual?.length>=2&&exercise.actual.some(n=>n<Number(exercise.target?.reps||0))));
 if(!consistent&&!struggling)return null;
 const direction=consistent?'progress':'simplify';
 const pool=catalogAvailable(profile,pattern).filter(x=>x.id!==current.id&&x.equipment===current.equipment&&(direction==='progress'?x.level>current.level:x.level<current.level));
 pool.sort((x,y)=>direction==='progress'?x.level-y.level:y.level-x.level);
 const choice=pool[0];if(!choice)return null;
 const token=pattern+'|'+direction+'|'+recent.map(x=>x.session.id).join('|')+'|'+current.id;
 if(decisions[token])return null;
 const reason=direction==='progress'?`Due sessioni complete senza dolore segnalato, con ripetizioni obiettivo raggiunte e fatica non eccessiva. Proposta: provare una variante di livello indicativo superiore.`:`Due sessioni con fatica elevata o ripetizioni sotto l’obiettivo. Proposta: una variante di livello indicativo inferiore.`;
 return {pattern,current,choice,direction,reason,token};
}
function movementReviews(profile,sessions,decisions){return ['squat','push','hinge','pull','core'].map(k=>movementReview(k,profile,sessions,decisions)).filter(Boolean)}
function movementDecisionHistory(){
 const entries=Object.entries(state.movementDecisionLog||{}).sort((a,b)=>String(b[1].date).localeCompare(String(a[1].date))).slice(0,6);
 if(!entries.length)return '';
 return `<section class="card"><p class="eyebrow">MEMORIA DEL COACH</p><h3>Le tue decisioni</h3><p class="small muted">Le scelte restano nello storico. Una proposta approvata viene rivalutata prima dell'applicazione.</p>${entries.map(([token,d])=>`<div class="item"><strong>${escapeHtml(d.from||'Esercizio')} → ${escapeHtml(d.to||'Variante')}</strong><p class="small muted">${escapeHtml(d.status==='approved'?'Approvata':d.status==='declined'?'Mantenuto esercizio attuale':d.status==='applied'?'Applicata':d.status==='expired'?'Non più appropriata':d.status)} · ${escapeHtml(d.date||'')}</p>${d.note?`<p class="small">${escapeHtml(d.note)}</p>`:''}</div>`).join('')}</section>`;
}
function movementReviewCard(){
 if(!state.profile||!state.week?.approved||!state.week.sessions.some(s=>!s.completed))return movementDecisionHistory();
 const reviews=movementReviews(state.profile,state.sessions,state.movementDecisions||{});
 const proposals=reviews.length?`<section class="card"><p class="eyebrow">✦ EVOLUZIONE DEL MOVIMENTO</p><h2>Il Coach ti propone una scelta</h2><p class="small muted">Valutazione basata sulle ripetizioni e sul feedback, non sulla tecnica osservata. Puoi decidere ora, prima di allenarti.</p>${reviews.map(r=>`<div class="item"><strong>${escapeHtml(r.current.name)} → ${escapeHtml(r.choice.name)}</strong><p class="small">${escapeHtml(r.reason)}</p><div class="mini-row"><button class="btn alt" data-review-accept="${escapeHtml(r.token)}">Approva</button><button class="btn ghost" data-review-decline="${escapeHtml(r.token)}">Mantieni attuale</button></div></div>`).join('')}</section>`:'';
 return proposals+movementDecisionHistory();
}
function resolveMovementReview(token,accepted){
 const review=movementReviews(state.profile,state.sessions,state.movementDecisions||{}).find(r=>r.token===token);
 if(!review)return false;
 state.movementDecisions=state.movementDecisions||{};
 state.movementDecisions[token]=accepted?'approved':'declined';
 state.movementDecisionLog=state.movementDecisionLog||{};
 state.movementDecisionLog[token]={date:today(),status:accepted?'approved':'declined',from:review.current.name,to:review.choice.name,note:accepted?'Da verificare prima della prossima sessione.':'Scelta rispettata per queste prestazioni.'};
 if(accepted){state.pendingMovementReviews=state.pendingMovementReviews||{};state.pendingMovementReviews[review.pattern]={token,choiceId:review.choice.id,currentId:review.current.id,sessionIds:state.sessions.filter(x=>x.completed).slice(-2).map(x=>x.id),reason:review.reason};}
 save();return true;
}
function pendingReviewStillValid(item,exercise,profile,sessions){
 if(!item||!exercise||exercise.catalogId!==item.currentId)return false;
 if(!catalogAvailable(profile,exercise.key).some(x=>x.id===item.choiceId))return false;
 // A newer painful or difficult session invalidates a previously approved progression.
 const latest=(sessions||[]).filter(s=>s.completed);
 const reviewed=latest.filter(s=>(s.exercises||[]).some(e=>e.key===exercise.key));
 const last=reviewed[reviewed.length-1];
 if(last&&(last.feedback?.pain!=='no'||last.feedback?.effort==='hard'))return false;
 if(item.sessionIds?.length&&reviewed.some(s=>!item.sessionIds.includes(s.id)))return false;
 return true;
}
function applyPendingMovementReviews(exercises,profile,week,pending,sessions=[],log={}){
 for(const e of exercises){const item=pending?.[e.key];if(!item)continue;
  if(!pendingReviewStillValid(item,e,profile,sessions)){
   if(log[item.token]){log[item.token].status='expired';log[item.token].note='Dati, esercizio o compatibilità cambiati: proposta annullata, serve una nuova valutazione.';}
   delete pending[e.key];continue;
  }
  const choice=catalogAvailable(profile,e.key).find(x=>x.id===item.choiceId);
  e.catalogId=choice.id;e.variant=choice.id;e.name=choice.name;e.tip=choice.cue;
  e.prescription=movementPrescription(e.key,profile,week,choice);
  e.target={reps:e.prescription.reps,reason:'Variante approvata in anticipo nel Coach.'};e.reviewApproved=true;
  if(log[item.token]){log[item.token].status='applied';log[item.token].note='Variante applicata alla sessione.';}
  delete pending[e.key];
 }
 return exercises;
}
function applyMovementReviews(exercises,profile,sessions,decisions,ask){
 for(const review of movementReviews(profile,sessions,decisions)){
  if(!exercises.some(e=>e.key===review.pattern))continue;
  const approved=ask(`${review.current.name} → ${review.choice.name}\n\n${review.reason}\n\nÈ una proposta basata su dati dichiarati, non una verifica della tecnica. Vuoi provarla in questa sessione?`);
  decisions[review.token]=approved?'approved':'declined';
  if(!approved)continue;
  const e=exercises.find(x=>x.key===review.pattern);
  e.catalogId=review.choice.id;e.variant=review.choice.id;e.name=review.choice.name;e.tip=review.choice.cue;
  e.prescription=movementPrescription(e.key,profile,state.week,review.choice);
  e.target={reps:e.prescription.reps,reason:'Variante proposta dal Coach e approvata per questa sessione.'};
  e.reviewApproved=true;
 }
 return exercises;
}
function alternativeCandidates(exercise,profile){
 const current=CATALOG.find(x=>x.id===exercise.catalogId);
 const maxLevel=profile.level==='attivo'?3:1;
 const used=new Set([exercise.catalogId,...(exercise.triedAlternatives||[])]);
 return catalogAvailable(profile,exercise.key)
  .filter(x=>!used.has(x.id)&&x.level<=maxLevel&&(!current||x.level<=current.level))
  .sort((a,b)=>{
   const score=x=>(current?Math.abs(current.level-x.level)*10:0)+(x.equipment==='body'?0:2)+(guideFor(x.id)?-1:0);
   return score(a)-score(b)||a.id.localeCompare(b.id);
  });
}
function alternativeReason(original,choice){
 const sameLevel=original&&choice.level===original.level;
 const difficulty=!original?'una variante iniziale compatibile':choice.level<original.level?'una variante di livello indicativamente inferiore':sameLevel?'una variante dello stesso livello indicativo':'una variante alternativa';
 return `Ti propongo ${difficulty} dello stesso schema di movimento (${choice.group}), compatibile con l’attrezzatura dichiarata (${choice.equipment}). Non posso verificare che sia adatta a eventuali dolori o limitazioni.`;
}
function replaceExercise(){
 const a=state.active,e=a.exercises[a.index];
 if(e.done>0){alert('Hai già iniziato questo esercizio. Per non perdere i dati, termina o salta il movimento prima di cambiarlo.');return;}
 const options=alternativeCandidates(e,state.profile);
 if(!options.length){alert('Non ci sono altre varianti di livello uguale o inferiore compatibili con la tua attrezzatura. Puoi saltare questo movimento.');return;}
 const choice=options[0],original=CATALOG.find(x=>x.id===e.catalogId);
 if(!confirm(`${choice.name}\n\n${alternativeReason(original,choice)}\n\nVuoi utilizzare questa variante?`))return;
 e.triedAlternatives=[...(e.triedAlternatives||[]),e.catalogId].filter(Boolean);
 e.catalogId=choice.id;e.name=choice.name;e.variant=choice.id;e.tip=choice.cue;
 e.changed=true;e.prescription=movementPrescription(e.key,state.profile,state.week,choice);e.target=exerciseTarget(e,state.week,state.sessions);save();render();
}

function trainer(){
 const a=state.active,w=state.week,e=a.exercises[a.index],total=a.exercises.length;
 const effectiveSets=a.sets||w.sets;const progress=Math.round(100*(a.index+(e.done/effectiveSets))/total);
 const notes=(CATALOG.find(x=>x.id===e.catalogId)||{});
 return `${header()}<div class="row"><p class="eyebrow">${escapeHtml(a.label)} · ${a.index+1}/${total} esercizi</p><span class="pill">${progress}%</span></div><div class="progress"><div style="width:${progress}%"></div></div>
 <section class="exercise-stage"><div class="stage-art" aria-hidden="true"><div class="movement-figure"><span class="figure-head"></span><span class="figure-torso"></span><span class="figure-arms"></span><span class="figure-legs"></span></div><strong>${escapeHtml(e.key.toUpperCase())}</strong></div><p class="eyebrow">IL TUO MOVIMENTO</p><h1>${escapeHtml(e.name)}</h1><p class="muted">${escapeHtml(e.tip)}</p>${notes.muscle?`<div class="muscle-chip">◎ ${escapeHtml(notes.muscle)}</div>`:''}<details class="adjust"><summary>Come eseguirlo e cosa evitare</summary>${guideMarkup(notes.id?notes:{id:e.catalogId,name:e.name})}</details></section>
 <section class="card series-panel"><div class="row"><div><p class="eyebrow">SERIE ATTUALE</p><h2>${Math.min(e.done+1,effectiveSets)} <span class="muted">/ ${effectiveSets}</span></h2></div><div class="rep-number"><strong>${e.target?.reps??w.reps}</strong><small>ripetizioni proposte</small></div></div><p class="small muted">${escapeHtml(e.target?.reason||"Obiettivo settimanale")}</p><p class="small muted">${escapeHtml(e.prescription?.cue||"")} · Recupero suggerito: ${e.prescription?.restSeconds||90} secondi, adattabile alle tue sensazioni.</p><div class="set-dots">${Array.from({length:effectiveSets},(_,i)=>`<span class="${i<e.done?'finished':i===e.done?'current':''}">${i<e.done?'✓':i+1}</span>`).join('')}</div>
 <p class="small muted">${escapeHtml(loadAdvice(e,state.sessions))}</p>
 ${a.rest?`<div class="rest-box"><span>◷</span><div><b>Recupero suggerito: ${e.prescription?.restSeconds||90} secondi</b><p>È un riferimento, non un conto alla rovescia obbligatorio. Riprendi quando ti senti pronto.</p></div></div><button class="btn" id="ready">Sono pronto →</button>`:`<details class="adjust"><summary>Hai fatto ripetizioni diverse?</summary><label for="actualReps">Ripetizioni effettive</label><input id="actualReps" type="number" min="0" max="100" value="${e.target?.reps??w.reps}"></details><details class="adjust"><summary>Hai usato un peso? (facoltativo)</summary><label for="actualLoad">Carico utilizzato (kg, totale esterno)</label><input id="actualLoad" type="number" inputmode="decimal" min="0" max="500" step="0.25" placeholder="Lascia vuoto per corpo libero" value="${e.actualLoads?.length&&typeof e.actualLoads[e.actualLoads.length-1]==='number'?e.actualLoads[e.actualLoads.length-1]:''}"><p class="small muted">Indica il peso totale esterno, non il peso corporeo. Con due manubri somma i pesi.</p></details><button class="btn" id="series">✓ Ho finito la serie</button>`}
 </section><div class="training-actions"><button class="btn alt" id="difficulty">Ho difficoltà o fastidio</button><button class="btn ghost" id="alternative">↻ Cambia esercizio</button></div><button class="text-button stop-training" id="finishEarly">Termina prima l'allenamento</button>`
}
function feedback(){return `${header()}<p class="eyebrow">Allenamento concluso</p><h1 class="hero">Come è andata?</h1><p class="muted">Tre risposte rapide: serviranno per il programma della prossima settimana.</p><form id="feedback" class="card"><label for="effort">Quanto è stato impegnativo?</label><select id="effort"><option value="easy">Facile</option><option value="ok" selected>Giusto</option><option value="hard">Troppo faticoso</option></select><label for="pain">Hai avuto dolore o fastidi insoliti?</label><select id="pain"><option value="no">No</option><option value="yes">Sì</option></select><label for="comment">Vuoi aggiungere qualcosa? (facoltativo)</label><input id="comment" maxlength="240" placeholder="Es. le gambe erano stanche"><button class="btn">Salva e concludi</button></form>`}
function history(){const all=state.sessions,completed=all.filter(s=>s.completed).length;return `${header()}<p class="eyebrow">LA TUA EVOLUZIONE</p><h1 class="hero">I tuoi progressi</h1><div class="three-stats"><div class="card"><span>↗</span><b>${all.length}</b><small>Sessioni registrate</small></div><div class="card"><span>✓</span><b>${completed}</b><small>Complete</small></div><div class="card"><span>◎</span><b>${all.length-completed}</b><small>Parziali</small></div></div><div class="card history-visual"><p class="eyebrow">ANDAMENTO REALE</p><h2>Le tue ultime sessioni</h2><div class="history-bars">${all.slice(-8).map(s=>`<div class="history-bar ${s.completed?'complete':'partial'}" title="${escapeHtml(s.label)} · ${escapeHtml(s.date)}"><span></span><small>${escapeHtml(s.date.slice(5))}</small></div>`).join('')||'<p class="muted">Il grafico apparirà dopo il primo allenamento.</p>'}</div><p class="small muted">Barra alta: sessione completata. Barra bassa: sessione parziale. Non rappresenta forza o recupero.</p></div><div class="card"><h2>Diario allenamenti</h2>${all.slice().reverse().map(s=>`<div class="session-row"><div><b>${escapeHtml(s.label)}</b><small>${escapeHtml(s.date)} · ${s.completed?'Completato':'Parziale'} · ${escapeHtml((s.exercises||[]).filter(e=>(e.actualLoads||[]).some(n=>typeof n==='number')).length+' esercizi con carico registrato')}</small></div><span class="lime">${s.feedback?.effort==='easy'?'Facile':s.feedback?.effort==='hard'?'Intenso':'Regolare'}</span></div>`).join('')||'<p class="muted">Dopo il primo allenamento vedrai qui i tuoi risultati.</p>'}</div>${diaryCard()}<div class="card"><h2>Confronto delle prestazioni</h2><p class="small muted">Confrontiamo lo stesso esercizio tra sessioni complete e senza fastidi segnalati. Non stimiamo il massimale.</p>${performanceComparisons(all).slice(-8).reverse().map(c=>`<div class="session-row"><div><b>${escapeHtml(c.name)}</b><small>${escapeHtml(c.date)} · ${escapeHtml(c.reason)}</small></div><span class="lime">${escapeHtml(c.label)}</span></div>`).join('')||'<p class="muted">Servono almeno due sessioni complete con lo stesso esercizio per vedere un confronto.</p>'}</div><div class="card tip"><p>Un aumento delle ripetizioni non equivale necessariamente a un aumento della forza. Considera anche tecnica, recupero e carico registrato.</p></div><button class="btn alt" id="export">Esporta backup</button>${navigation('history')}`}


function library(){
 const p=state.profile;
 const patterns=[...new Set(CATALOG.map(x=>x.pattern))];
 const art={squat:'◩',hinge:'◇',push:'⬡',pull:'⟷',core:'◎'};
 return `${header()}<div class="screen-heading"><p class="eyebrow">LABORATORIO MASTER-FIT</p><h1 class="hero">Esercizi</h1><p class="muted small">${CATALOG.length} varianti disponibili nel catalogo. Il Coach sceglie soltanto quelle compatibili con il tuo profilo.</p></div><div class="library-spotlight"><span class="spotlight-icon">✦</span><div><b>La tecnica prima del carico</b><small>Apri una categoria e consulta le istruzioni. Le guide approfondite sono indicate nella scheda.</small></div></div><div class="library-categories">${patterns.map(k=>{const all=CATALOG.filter(x=>x.pattern===k),compatible=catalogAvailable(p,k);return `<details class="card category-card"><summary><span class="category-glyph" aria-hidden="true">${art[k]||'✧'}</span><span class="category-info"><strong>${escapeHtml(all[0].group)}</strong><small>${compatible.length} compatibili · ${all.length} varianti</small></span><span class="category-chevron">›</span></summary><div class="category-items">${all.map(x=>`<div class="item"><strong>${escapeHtml(x.name)}</strong><div class="small muted">${escapeHtml(x.muscle)} · ${escapeHtml(x.equipment)} · livello ${x.level}/4</div><p class="small">${escapeHtml(x.cue)}</p><details class="adjust"><summary>${guideFor(x.id)?'Istruzioni, errori e varianti':'Dettagli tecnici'}</summary>${guideMarkup(x)}</details></div>`).join('')}</div></details>`}).join('')}</div>${navigation('library')}`;
}
function settings(){let p=state.profile;const count=state.sessions.filter(x=>x.completed).length;return `${header()}<p class="eyebrow">IL TUO PERCORSO</p><h1 class="hero">Profilo atleta</h1><section class="athlete-card"><div class="athlete-portrait" aria-hidden="true"></div><div class="athlete-identity"><span class="eyebrow">MASTER-FIT EVOLVE</span><h2>${escapeHtml(p.name||'Atleta')}</h2><p>Il tuo percorso, al tuo ritmo.</p></div><div class="athlete-facts"><div><b>${p.age}</b><small>Età</small></div><div><b>${p.height} <em>cm</em></b><small>Altezza</small></div><div><b>${p.weight} <em>kg</em></b><small>Peso dichiarato</small></div></div></section><div class="profile-section-title"><span>◎</span><h3>Il tuo allenamento</h3></div><div class="card profile-details"><div class="session-row"><span>◎</span><div><b>Obiettivo</b><small>${escapeHtml(p.goal)}</small></div></div><div class="session-row"><span>▣</span><div><b>Programma</b><small>${p.days} giorni a settimana · ${p.duration} minuti</small></div></div><div class="session-row"><span>◈</span><div><b>Attrezzatura</b><small>${escapeHtml((p.equipment||[]).join(', ')||'Corpo libero')}</small></div></div><div class="session-row"><span>✓</span><div><b>Allenamenti completati</b><small>${count} registrati nello storico</small></div></div><p class="small muted">${escapeHtml(capabilitySummary(p))}</p><button class="btn alt" id="reconfigure">Modifica il profilo</button></div><div class="card privacy-panel"><h3>Privacy e backup</h3><p class="muted small">I dati restano su questo dispositivo, salvo esportazione manuale.</p><label for="import">Importa un backup JSON</label><input id="import" type="file" accept="application/json,.json"><button class="btn ghost" id="export">Esporta backup JSON</button></div>${navigation('settings')}`}


function rolloverIfNeeded(){
 if(!state.profile||!state.week||state.active)return;
 const currentMonday=monday(today());
 if(state.week.start>=currentMonday)return;
 // Only the most recent finished week informs the next proposal.
 // Do not mark missed sessions as completed or silently approve changes.
 const old=state.week;
 state.week=weekPlan(state.profile,currentMonday,old,state.sessions);
 state.week.approved=false;
 save();
}
function render(){rolloverIfNeeded();let view=!state.profile?'setup':state.active?.phase==='feedback'?'feedback':state.active?'trainer':state.view;if($('#app').dataset)$('#app').dataset.screen=view;$('#app').innerHTML=({setup:onboarding,home,program,coach,trainer,feedback,history,settings,library})[view]();bind(view)}
function bind(view){if($('#pauseReasonForm'))$('#pauseReasonForm').onsubmit=e=>{e.preventDefault();if(!setPauseReason(state.week,$('#pauseReason').value)){alert('Seleziona un motivo valido.');return;}save();render()};if(view==='setup'){$('#setup').onsubmit=e=>{e.preventDefault();const f=e.target;const age=+f.age.value,height=+f.height.value,weight=+f.weight.value;if(age<18||age>110||height<100||height>240||weight<25||weight>350){alert('Controlla i dati inseriti. Questa beta è destinata a persone adulte.');return}const profile={name:f.elements.namedItem('name').value.trim().slice(0,32)||'Atleta',age,height,weight,goal:f.goal.value,level:f.level.value,capabilities:Object.fromEntries(['squat','push','hinge','core'].map(k=>[k,f.querySelector('#cap_'+k).value])),duration:+f.duration.value,days:+f.days.value,equipment:[...f.querySelectorAll('[name=eq]:checked')].map(x=>x.value),trainingDays:[...f.querySelectorAll('[name=trainingDay]:checked')].map(x=>+x.value),unavailableDays:[...f.querySelectorAll('[name=unavailableDay]:checked')].map(x=>+x.value),shiftMode:f.shiftMode.value,shiftAnchor:f.shiftAnchor.value};if(profile.trainingDays.length&&profile.trainingDays.length!==profile.days){alert('Seleziona esattamente '+profile.days+' giorni, oppure lascia tutti i giorni deselezionati.');return;}if(profile.shiftMode==='alternate'&&!/^\d{4}-\d{2}-\d{2}$/.test(profile.shiftAnchor)){alert('Per alternare i turni, indica il lunedì di una settimana con turno mattina.');return;}if(profile.shiftMode==='alternate'&&monday(profile.shiftAnchor)!==profile.shiftAnchor){alert('Seleziona un lunedì come riferimento per il turno mattina.');return;}if(7-profile.unavailableDays.length<profile.days){alert('Lascia disponibili almeno tanti giorni quanti sono gli allenamenti.');return;}const previous=state.week;const keepSessions=state.sessions||[];state={...initial(),profile,week:weekPlan(profile,monday(today()),previous),sessions:keepSessions};save();render()};return}
if(view==='home'||view==='program'){if($('#reschedule'))$('#reschedule').onsubmit=e=>{e.preventDefault();if(!movePlannedSession(state.week,$('#moveId').value,$('#moveDate').value)){alert('Data non valida, già occupata o fuori dalla settimana.');return;}save();render()};if($('#approve'))$('#approve').onclick=()=>{if(pauseGate(state.week).blocked){alert(pauseGate(state.week).reason);return;}state.week.approved=true;save();render()};if($('#start'))$('#start').onclick=()=>{if(pauseGate(state.week).blocked){alert(pauseGate(state.week).reason);return;}if(state.checkin?.date===today()&&state.checkin.symptoms==='yes'){alert('Hai segnalato dolore o sintomi insoliti oggi. Prima di allenarti chiedi una valutazione professionale.');return;}const s=state.week.sessions.find(s=>!s.completed);if(!s){alert('Nessun allenamento in programma.');return;}const readiness=currentReadiness();if(readiness?.kind==='stop'){alert(readiness.reason);return;}const reduced=readiness?.kind==='lighter'&&state.checkin.approved===true;const exercises=buildExercises(s.label);if(!reduced){state.movementDecisions=state.movementDecisions||{};state.pendingMovementReviews=state.pendingMovementReviews||{};applyPendingMovementReviews(exercises,state.profile,state.week,state.pendingMovementReviews,state.sessions,state.movementDecisionLog||{});}if(reduced){for(const e of exercises){e.target={...e.target,reps:Math.min(e.target?.reps??state.week.reps,readiness.reps),reason:'Adattamento giornaliero approvato: '+readiness.reason};}}state.active={id:s.id,label:s.label,date:s.date,index:0,exercises,sets:reduced?readiness.sets:state.week.sets,readinessApplied:reduced,phase:'exercise',rest:false};save();render()};if($('#nextweek'))$('#nextweek').onclick=()=>{let old=state.week;state.week=weekPlan(state.profile,plusDays(old.start,7),old,state.sessions);save();render()}}
if(view==='trainer'){if($('#alternative'))$('#alternative').onclick=replaceExercise;if($('#ready'))$('#ready').onclick=()=>{state.active.rest=false;save();render()};if($('#series'))$('#series').onclick=()=>{let a=state.active,e=a.exercises[a.index];const actualInput=$('#actualReps');const actual=actualInput?Number(actualInput.value):(e.target?.reps??state.week.reps);if(!Number.isInteger(actual)||actual<0||actual>100){alert('Inserisci un numero valido di ripetizioni.');return}const load=normalizeLoad($('#actualLoad')?.value);if(Number.isNaN(load)){alert('Carico non valido: usa un valore tra 0 e 500 kg, a passi di 0,25 kg.');return;}e.actual=e.actual||[];e.actualLoads=e.actualLoads||[];e.actual.push(actual);e.actualLoads.push(load);e.done++;if(e.done>=(a.sets||state.week.sets)){if(a.index+1<a.exercises.length){a.index++;a.rest=true}else{a.phase='feedback'}}else{a.rest=true}save();render()};$('#difficulty').onclick=()=>{const a=state.active,e=a.exercises[a.index];if(confirm('Se senti dolore o sintomi insoliti, interrompi l’esercizio. Vuoi saltare questo movimento?')){e.skipped=true;if(a.index+1<a.exercises.length){a.index++;a.rest=false}else a.phase='feedback';save();render()}};$('#finishEarly').onclick=()=>{if(confirm('Vuoi terminare e registrare la sessione come parziale?')){state.active.phase='feedback';save();render()}}}
if(view==='feedback'){$('#feedback').onsubmit=e=>{e.preventDefault();let a=state.active;const completed=a.exercises.every(x=>x.done>=(a.sets||state.week.sets)&&!x.skipped);const s={id:a.id,date:a.date,label:a.label,completed,exercises:a.exercises,setsPlanned:a.sets,readinessApplied:!!a.readinessApplied,feedback:{effort:$('#effort').value,pain:$('#pain').value,comment:$('#comment').value.slice(0,240)}};state.sessions.push(s);let entry=state.week.sessions.find(x=>x.id===a.id);entry.completed=true;entry.status=completed?'done':'partial';entry.partial=!completed;entry.feedback=s.feedback;state.active=null;state.view='home';save();render()}}
if(view==='settings'){if($('#catalog'))$('#catalog').onclick=()=>change({view:'library'});$('#reconfigure').onclick=()=>{if(confirm('Vuoi reimpostare il profilo? Lo storico rimarrà conservato.')){state.profile=null;state.active=null;state.view='home';save();render()}};$('#import').onchange=async e=>{let file=e.target.files[0];if(!file)return;try{let v=JSON.parse(await file.text());if(!v||typeof v!=='object'||!Array.isArray(v.sessions)||!v.profile||!v.week||!Array.isArray(v.week.sessions))throw Error('Formato non valido');if(confirm('Sostituire tutti i dati attuali con il backup?')){const old=state;state={...initial(),...v,active:null,view:'home'};if(!save()){state=old;return}render()}}catch{alert('Backup non valido. Nessun dato modificato.')}}}
if($('#export'))$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MASTER-Fit-backup-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
document.querySelectorAll('[data-review-accept],[data-review-decline]').forEach(b=>b.onclick=()=>{if(resolveMovementReview(b.dataset.reviewAccept||b.dataset.reviewDecline,!!b.dataset.reviewAccept))render()});if($('#acceptScheduleAdvice'))$('#acceptScheduleAdvice').onclick=()=>{const a=currentScheduleAdvice();if(!a||a.kind!=='move'||!movePlannedSession(state.week,a.sessionId,a.to)){alert('Proposta non più disponibile.');return;}state.scheduleDismissed=null;save();render()};if($('#dismissScheduleAdvice'))$('#dismissScheduleAdvice').onclick=()=>{const a=currentScheduleAdvice();if(a?.kind==='move'){state.scheduleDismissed=a.sessionId+'|'+a.from+'|'+a.to+'|'+today();save();render()}};if($('#openReadiness'))$('#openReadiness').onclick=()=>change({view:'coach'});if($('#approveReadiness'))$('#approveReadiness').onclick=()=>{state.checkin.approved=true;state.checkin.declined=false;save();render()};if($('#declineReadiness'))$('#declineReadiness').onclick=()=>{state.checkin.approved=false;state.checkin.declined=true;save();render()};if($('#coachOpen'))$('#coachOpen').onclick=()=>change({view:'coach'});if($('#coachCard'))$('#coachCard').onclick=()=>change({view:'coach'});if($('#coachBack'))$('#coachBack').onclick=()=>change({view:'home'});if($('#coachCheckin'))$('#coachCheckin').onclick=()=>$('#readiness')?.scrollIntoView({behavior:'smooth',block:'start'});if($('#readiness'))$('#readiness').onsubmit=e=>{e.preventDefault();state.checkin={date:today(),energy:$('#energy').value,sleep:$('#sleep').value,symptoms:$('#symptoms').value,approved:false,declined:false};save();alert(state.checkin.symptoms==='yes'?'Check-in salvato. Non allenarti attraverso il dolore: valuta i sintomi con un professionista.':'Check-in salvato. Controlla la proposta del Coach prima di allenarti.');render()};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>change({view:b.dataset.view}))}
window.MASTER_FIT_CREATE_PLAN = function(profile){return weekPlan(profile,monday(today()),null,[])};
