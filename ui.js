/* MASTER-Fit EVOLVE 2.0 — React shell, progressive migration. */
(function(){'use strict';
var h=React.createElement, KEY='masterfit-coach-v2';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function downloadBackup(){
 var raw=localStorage.getItem(KEY);
 if(!raw){window.alert('Non ci sono dati da esportare su questo indirizzo.');return}
 try{
  var parsed=JSON.parse(raw);
  var blob=new Blob([JSON.stringify(parsed,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='MASTER-Fit-backup-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1500);
 }catch(e){window.alert('Impossibile esportare i dati: il salvataggio non è leggibile. Nessun dato è stato cancellato.')}
}
function newUser(){
 var d=read();
 if(!d.profile){window.alert('Nessun profilo configurato in questa versione.');return}
 var message='Vuoi iniziare da zero con un nuovo utente?\n\nSaranno eliminati da QUESTO indirizzo il profilo, il programma, gli allenamenti e lo storico. Non potrai annullare questa operazione senza un backup.\n\nPremi Annulla per esportare prima un backup.';
 if(!window.confirm(message))return;
 try{localStorage.removeItem(KEY);window.location.href='index.html?nuovo=1'}
 catch(e){window.alert('Non è stato possibile cancellare i dati. Riprova dopo aver verificato le impostazioni del browser.')}
}
function safe(t){return String(t==null?'':t)}
function dateOf(s){return s&&s.date?s.date:''}
function icon(id){var shapes={home:'⌂',program:'⚒',history:'▥',library:'▤',settings:'♙',coach:'✦'};return shapes[id]||'✦'}
var labels={home:'Home',program:'Allenati',history:'Progressi',library:'Esercizi',settings:'Profilo'};
function Circle(props){return h('div',{className:'circle',style:{'--pct':props.pct+'%'}},h('div',{className:'circle-inner'},h('strong',null,props.pct+'%'),h('small',null,'Settimana')))}
function Top(props){return h('header',{className:'top'},h('button',{className:'wordmark',onClick:function(){props.go('home')},'aria-label':'Vai alla Home'},h('span',{className:'mfmark'},'MF'),h('span',null,h('b',null,'MASTER-',h('em',null,'Fit')),h('small',null,'EVOLVE · PERSONAL TRAINER'))),h('button',{className:'coach-trigger',onClick:function(){props.go('coach')},'aria-label':'Apri MASTER Coach'},'✦'))}
function Nav(props){return h('nav',{className:'nav','aria-label':'Navigazione principale'},Object.keys(labels).map(function(id){return h('button',{key:id,className:props.page===id?'on':'',onClick:function(){props.go(id)},'aria-current':props.page===id?'page':undefined},h('span',{className:'navicon'},icon(id)),h('small',null,labels[id]))}))}
function Home(props){var data=props.data,profile=data.profile||{},week=data.week||{},ss=week.sessions||[],done=ss.filter(function(x){return x.completed}).length,pct=ss.length?Math.round(done*100/ss.length):0,next=ss.find(function(x){return !x.completed}),total=(data.sessions||[]).length;return h('div',{className:'home-page'},h('section',{className:'hero'},h('div',{className:'hero-light'}),h('div',{className:'hero-art'}),h('div',{className:'hero-brand'},h('span',null,'MF'),h('small',null,'EVOLVE')),h('div',{className:'hero-copy'},h('p',{className:'eyebrow'},'IL TUO PERCORSO · SETTIMANA ',safe(week.cycleWeek||1)),h('h1',null,'Ciao, ',safe(profile.name||'Atleta'),'.'),h('p',null,'Ogni passo conta. Il tuo prossimo progresso inizia qui.')),h('div',{className:'hero-circle'},h(Circle,{pct:pct}))),h('div',{className:'stats'},h('div',null,h('span',{className:'stat-icon'},'▦'),h('strong',null,done),h('small',null,'Sessioni svolte')),h('div',null,h('span',{className:'stat-icon'},'◎'),h('strong',null,ss.length),h('small',null,'Obiettivo settimanale')),h('div',null,h('span',{className:'stat-icon'},'♜'),h('strong',null,total),h('small',null,'Allenamenti totali'))),h('section',{className:'session-panel'},h('p',{className:'eyebrow'},'✦ ALLENAMENTO IN PROGRAMMA'),h('div',{className:'session-title'},h('span',{className:'dumbbell'},'▰'),h('div',null,h('h2',null,next?safe(next.label):'Settimana completata'),h('p',null,next?'Sessione guidata · '+safe(profile.duration||60)+' minuti · '+(ss.length-done)+' da svolgere':'Hai completato le sessioni previste'))),h('button',{className:'primary',onClick:function(){props.go('program')}},next?'Apri allenamento →':'Vedi il programma →')),h('button',{className:'coach-card',onClick:function(){props.go('coach')}},h('span',{className:'coach-badge'},'♜'),h('span',null,h('strong',null,'Il tuo MASTER Coach'),h('small',null,'Scelte motivate, progressi reali, allenamenti adattivi')),h('span',null,'›')))}
function Coach(props){return h('div',{className:'coach-page'},h('section',{className:'coach-visual'},h('div',{className:'coach-art'}),h('div',{className:'coach-title'},h('span',{className:'eyebrow'},'MASTER COACH · BETA'),h('h1',null,'Il tuo alleato.')),h('div',{className:'speech'},'Ti aiuto a capire e adattare il tuo allenamento. Le decisioni restano tue.')),h('div',{className:'coach-actions'},[['program','▦','Visualizza il programma'],['history','▥','Rivedi i progressi'],['library','◎','Consulta le guide tecniche'],['legacy-coach','♡','Check-in, decisioni e consigli']].map(function(a){return h('button',{key:a[0],onClick:function(){props.go(a[0])}},h('span',null,a[1]),a[2],h('b',null,'›'))})),h('p',{className:'note'},'Le analisi si basano sui dati registrati. Nessuna stima clinica o percentuale inventata.'))}
function Panel(props){return h('section',{className:'native-panel '+(props.className||'')},props.children)}
function Heading(props){return h('div',{className:'native-heading'},h('p',{className:'eyebrow'},props.kicker),h('h1',null,props.title))}
function openEngine(view){try{var d=read();if(view)d.view=view;localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}window.location.href='legacy/index.html'}
function Program(props){var d=props.data,w=d.week||{},ss=w.sessions||[];return h('main',{className:'native-page'},h(Heading,{kicker:'LA TUA STRATEGIA',title:'Programma settimanale'}),h(Panel,{className:'feature-panel'},h('p',{className:'eyebrow'},'CICLO DI ALLENAMENTO · SETTIMANA '+safe(w.cycleWeek||1)+'/4'),h('div',{className:'native-flex'},h('div',null,h('h2',null,safe(w.goalLabel||'Il tuo programma')),h('p',null,w.approved?'Piano approvato':'In attesa di approvazione')),h(Circle,{pct:ss.length?Math.round(ss.filter(function(x){return x.completed}).length*100/ss.length):0})),h('p',{className:'native-muted'},safe(w.reason||'Il Coach prepara il piano sulla base del tuo profilo.'))),h('div',{className:'days-grid'},['L','M','M','G','V','S','D'].map(function(day,i){var start=w.start?new Date(w.start+'T12:00:00'):null,date=start?new Date(start.getTime()+i*86400000).toISOString().slice(0,10):'',item=ss.find(function(x){return x.date===date});return h('div',{key:i,className:'day-cell '+(item?'planned ':'')+(item&&item.completed?'done':'')},h('small',null,day),h('strong',null,start?String(Number(date.slice(-2))):'–'),h('span',null,item?(item.completed?'✓':'●'):'·'))})),h(Panel,null,h('h2',null,'Le tue sessioni'),ss.map(function(x,i){return h('div',{key:x.id||i,className:'native-row'},h('span',{className:'native-number'},String.fromCharCode(65+i)),h('div',{className:'native-row-copy'},h('b',null,safe(x.label)),h('small',null,safe(x.date))),h('span',{className:'native-status'},x.completed?'✓ Fatto':'Da fare'))}),ss.length===0?h('p',{className:'native-muted'},'Nessuna sessione disponibile.'):null),h('button',{className:'primary',onClick:function(){openEngine('program')}},w.approved?'Apri programma e allenati →':'Esamina e approva il programma →'),h('p',{className:'native-muted'},'Le modifiche al programma e l’avvio guidato restano disponibili nel motore completo.'))}
function History(props){var all=props.data.sessions||[],done=all.filter(function(x){return x.completed}).length,recent=all.slice(-7);return h('main',{className:'native-page'},h(Heading,{kicker:'LA TUA EVOLUZIONE',title:'I tuoi progressi'}),h('div',{className:'native-metrics'},[['↗',all.length,'Registrate'],['✓',done,'Complete'],['◎',all.length-done,'Parziali']].map(function(x){return h('div',{key:x[2]},h('span',null,x[0]),h('strong',null,x[1]),h('small',null,x[2]))})),h(Panel,null,h('p',{className:'eyebrow'},'ANDAMENTO REALE'),h('h2',null,'Ultime sessioni'),h('div',{className:'native-chart'},recent.map(function(x,i){return h('div',{className:'chart-col',key:i},h('span',{className:x.completed?'complete':'partial',style:{height:x.completed?'84%':'43%'}},''),h('small',null,safe(x.date||'').slice(5)))})),h('p',{className:'native-muted'},'Le barre distinguono sessioni complete e parziali, non stimano forza o recupero.')),h(Panel,null,h('h2',null,'Diario allenamenti'),all.slice(-6).reverse().map(function(x,i){return h('div',{className:'native-row',key:i},h('span',{className:'native-number'},x.completed?'✓':'·'),h('div',{className:'native-row-copy'},h('b',null,safe(x.label)),h('small',null,safe(x.date))),h('span',{className:'native-status'},x.completed?'Completa':'Parziale'))}),all.length===0?h('p',{className:'native-muted'},'Qui compariranno gli allenamenti registrati.'):null),h('button',{className:'secondary-action',onClick:downloadBackup},'Esporta backup JSON →'))}
function Library(props){var cats=[['Gambe','squat','◈'],['Anca e glutei','hinge','◇'],['Spinta orizzontale','push','⊞'],['Tirata orizzontale','pull','⇄'],['Stabilità e core','core','◎']];return h('main',{className:'native-page'},h(Heading,{kicker:'IL TUO LABORATORIO',title:'Esercizi'}),h(Panel,{className:'library-intro'},h('p',{className:'eyebrow'},'GUIDE TECNICHE'),h('h2',null,'Allenati con consapevolezza'),h('p',null,'Esplora le famiglie di movimento e consulta le varianti compatibili con il tuo profilo.')),h('div',{className:'category-list'},cats.map(function(x){return h('button',{key:x[1],className:'category-card',onClick:function(){openEngine('library')}},h('span',{className:'category-icon'},x[2]),h('span',null,h('b',null,x[0]),h('small',null,'Tecnica · errori · alternative')),h('strong',null,'›'))})),h('button',{className:'primary',onClick:function(){openEngine('library')}},'Apri biblioteca completa →'))}
function Settings(props){
 var p=props.data.profile||{},all=props.data.sessions||[],done=all.filter(function(x){return x.completed}).length;
 var facts=[['Età',p.age],['Altezza',p.height?p.height+' cm':'—'],['Peso',p.weight?p.weight+' kg':'—']];
 var details=[['Obiettivo',p.goal],['Frequenza',(p.days||'—')+' giorni/settimana'],['Durata',(p.duration||'—')+' minuti'],['Sessioni completate',done]];
 var identity=h('div',{className:'profile-name'},h('p',{className:'eyebrow'},'MASTER-FIT EVOLVE'),h('h2',null,safe(p.name||'Atleta')),h('p',null,'Il tuo percorso, al tuo ritmo.'));
 var metrics=h('div',{className:'profile-metrics'},facts.map(function(x){return h('div',{key:x[0]},h('strong',null,safe(x[1]||'—')),h('small',null,x[0]))}));
 var portrait=h(Panel,{className:'profile-hero'},h('div',{className:'profile-art'}),identity,metrics);
 var rows=details.map(function(x){return h('div',{key:x[0],className:'native-row'},h('div',{className:'native-row-copy'},h('b',null,x[0]),h('small',null,safe(x[1]||'—'))))});
 var detailsPanel=h(Panel,null,h('h2',null,'Il tuo allenamento'),rows);
 var action=h('button',{className:'primary',onClick:function(){openEngine('settings')}},'Modifica profilo e gestisci backup →');
 var reset=h(Panel,{className:'new-user-panel'},
  h('h2',null,'Nuovo utente · Riparti da zero'),
  h('p',null,'Vuoi provare un percorso diverso o iniziare con un altro profilo? Puoi azzerare tutti i dati locali di questa versione e ricominciare dalla configurazione iniziale.'),
  h('button',{className:'secondary-action',onClick:downloadBackup},'↓ Esporta prima un backup JSON'),
  h('button',{className:'danger-action',onClick:newUser},'Ricomincia da zero con un nuovo utente'),
  h('p',{className:'native-muted'},'Attenzione: azzera profilo, programma, sessioni e storico. Non elimina eventuali dati salvati su altri indirizzi o porte.'));

 return h('main',{className:'native-page'},h(Heading,{kicker:'IL TUO PUNTO DI PARTENZA',title:'Profilo atleta'}),portrait,detailsPanel,action,reset);
}
function Welcome(props){
 var error='';
 function setError(message){window.alert(message);}
 function submit(e){
  e.preventDefault();var f=e.currentTarget,fd=new FormData(f);
  var age=Number(fd.get('age')),height=Number(fd.get('height')),weight=Number(fd.get('weight'));
  if(!Number.isInteger(age)||age<18||age>110||height<100||height>240||weight<25||weight>350){setError('Controlla età, altezza e peso: questa beta è destinata a persone adulte.');return}
  var days=Number(fd.get('days')),trainingDays=fd.getAll('trainingDay').map(Number),unavailableDays=fd.getAll('unavailableDay').map(Number),shiftMode=fd.get('shiftMode'),shiftAnchor=fd.get('shiftAnchor')||'';
  if(trainingDays.length&&trainingDays.length!==days){setError('Seleziona esattamente '+days+' giorni preferiti oppure nessuno.');return}
  if(7-unavailableDays.length<days){setError('Devi lasciare disponibili almeno '+days+' giorni.');return}
  if(shiftMode==='alternate'){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(shiftAnchor)||new Date(shiftAnchor+'T12:00:00').getDay()!==1){setError('Indica un lunedì valido come riferimento del turno mattina.');return}
  }
  var caps={};['squat','push','hinge','core'].forEach(function(k){caps[k]=fd.get('cap_'+k)||''});
  var dumbbellMax=Number(fd.get('dumbbellMaxKg')||0);if(fd.getAll('eq').indexOf('dumbbells')>=0&&(!Number.isFinite(dumbbellMax)||dumbbellMax<=0||dumbbellMax>100)){setError('Indica il peso massimo effettivamente disponibile per ciascun manubrio.');return}
  var profile={name:String(fd.get('name')||'').trim().slice(0,32)||'Atleta',age:age,height:height,weight:weight,goal:fd.get('goal'),level:fd.get('level'),capabilities:caps,duration:Number(fd.get('duration')),days:days,equipment:fd.getAll('eq'),dumbbellMaxKg:fd.getAll('eq').indexOf('dumbbells')>=0?dumbbellMax:null,trainingDays:trainingDays,unavailableDays:unavailableDays,shiftMode:shiftMode,shiftAnchor:shiftAnchor};
  try{
   if(typeof window.MASTER_FIT_CREATE_PLAN!=='function')throw Error('Motore di pianificazione non disponibile.');
   var week=window.MASTER_FIT_CREATE_PLAN(profile);
   var data={profile:profile,week:week,sessions:[],active:null,view:'home',history:[],checkin:null};
   localStorage.setItem(KEY,JSON.stringify(data));
   props.onCreated();
  }catch(ex){setError('Non è stato possibile salvare il percorso. Nessun dato è stato cancellato. '+ex.message)}
 }
 function field(name,label,type,opts){return h('label',{className:'setup-field',key:name},h('span',null,label),opts?h('select',{name:name,defaultValue:opts[0][0]},opts.map(function(o){return h('option',{value:o[0],key:o[0]},o[1])})):h('input',{name:name,type:type||'text',required:name!=='name',min:type==='number'?1:undefined,step:type==='number'?1:undefined,maxLength:name==='name'?32:undefined}))}
 function checks(name,items){return h('div',{className:'setup-checks'},items.map(function(x){return h('label',{key:x[0]},h('input',{type:'checkbox',name:name,value:x[0]}),x[1])}))}
 var weekdays=[['0','Lun'],['1','Mar'],['2','Mer'],['3','Gio'],['4','Ven'],['5','Sab'],['6','Dom']];
 return h('main',{className:'native-page onboarding-page'},h(Heading,{kicker:'IL TUO NUOVO PERCORSO',title:'Conosciamoci.'}),h('p',{className:'native-muted'},'Una sola configurazione, direttamente in MASTER-Fit. Potrai sempre ricominciare dal Profilo.'),h('form',{className:'setup-native',onSubmit:submit},
 h(Panel,null,h('p',{className:'eyebrow'},'01 · I TUOI DATI'),field('name','Come vuoi essere chiamato?'),field('age','Età (anni)','number'),h('div',{className:'setup-pair'},field('height','Altezza (cm)','number'),field('weight','Peso (kg)','number'))),
 h(Panel,null,h('p',{className:'eyebrow'},'02 · IL TUO OBIETTIVO'),field('goal','Obiettivo principale',null,[['forza','Recuperare forza'],['muscolo','Aumentare massa muscolare'],['benessere','Migliorare energia e forma'],['composizione','Migliorare composizione corporea']]),field('level','Situazione attuale',null,[['ripresa','Riprendo dopo una lunga pausa'],['inizio','Non mi sono mai allenato'],['attivo','Mi alleno già']])),
 h(Panel,null,h('p',{className:'eyebrow'},'03 · VALUTAZIONE FACOLTATIVA'),h('p',{className:'native-muted'},'Non devi eseguire prove fisiche. Scegli ciò che sai fare comodamente.'),[['squat','Sederti e rialzarti'],['push','Spingere con le braccia'],['hinge','Movimenti di anche e glutei'],['core','Stabilità del tronco']].map(function(x){return field('cap_'+x[0],x[1],null,[['','Non so / inizio facile'],['supported','Preferisco una versione facilitata'],['basic','Gestisco movimenti semplici'],['comfortable','Sono a mio agio con varianti di base']])})),
 h(Panel,null,h('p',{className:'eyebrow'},'04 · IL TUO TEMPO'),field('duration','Durata allenamento',null,[['60','60 minuti'],['45','45 minuti'],['30','30 minuti']]),field('days','Allenamenti settimanali',null,[['2','2 giorni'],['3','3 giorni']]),h('p',{className:'native-muted'},'Giorni preferiti (facoltativo)'),checks('trainingDay',weekdays),field('shiftMode','Turni di lavoro',null,[['none','Nessun turno'],['morning','Turno mattina'],['afternoon','Turno pomeriggio'],['alternate','Alternanza settimanale']]),field('shiftAnchor','Lunedì di riferimento per turno mattina','date'),h('p',{className:'native-muted'},'Giorni non disponibili (facoltativo)'),checks('unavailableDay',weekdays)),
 h(Panel,null,h('p',{className:'eyebrow'},'05 · ATTREZZATURA'),h('p',{className:'native-muted'},'Il corpo libero è sempre incluso.'),checks('eq',[['dumbbells','Manubri'],['bands','Elastici'],['barbell','Bilanciere e supporti adeguati'],['machines','Macchine da palestra'],['pullup','Barra trazioni stabile']]),h('label',{className:'setup-field'},'Peso massimo per ciascun manubrio (kg, se possiedi manubri)',h('input',{type:'number',name:'dumbbellMaxKg',min:0.5,max:100,step:0.5,defaultValue:6})),h('p',{className:'native-muted'},'Inserisci il massimo che puoi montare oggi, non quello che vorresti acquistare. Puoi cambiarlo dal Profilo.')),
 h('p',{className:'setup-warning'},'Se hai dolore, sintomi neurologici o altri problemi in corso, chiedi una valutazione sanitaria prima di allenarti. Questa app non sostituisce un professionista.'),error?h('p',{className:'setup-error',role:'alert'},error):null,h('button',{className:'primary',type:'submit'},'Prepara il mio percorso →')));
}
/* v43: React native workflows. Loaded inside the same closure as ui.js. */
var CATALOG_NATIVE=window.MASTER_FIT_CATALOG||[];
function persistNative(d,refresh){localStorage.setItem(KEY,JSON.stringify(d));refresh();}
function availableNative(p){var eq=p.equipment||[];return CATALOG_NATIVE.filter(function(e){return e.equipment==='body'||eq.indexOf(e.equipment)>=0||e.equipment==='none'});}
// v47: ripresa della forza, non riabilitazione predefinita.
// Preferenze curate per attrezzatura. Nessun massimale o carico iniziale presunto.
var STRENGTH_CHOICES={
 squat:{body:['squat-03','squat-04'],dumbbells:['squat-10','squat-11'],barbell:['squat-03','squat-10'],machines:['squat-20']},
 push:{body:['push-03','push-05'],dumbbells:['push-12','push-14'],barbell:['push-03','push-12'],machines:['push-23']},
 hinge:{body:['hinge-07','hinge-04'],dumbbells:['hinge-10','hinge-14'],barbell:['hinge-07','hinge-10'],machines:['hinge-22']},
 pull:{body:['pull-01'],pullup:['pull-04'],bands:['pull-06'],dumbbells:['pull-11'],barbell:['pull-01'],machines:['pull-22']},
 core:{body:['core-02','core-04'],bands:['core-18'],dumbbells:['core-02'],machines:['core-24']}
};
function chooseNative(p,pattern){
 var list=availableNative(p).filter(function(e){return e.pattern===pattern});
 var equipment=p.equipment||[];
 var order=['dumbbells','bands','pullup','machines','barbell','body'];
 var ids=[];
 order.forEach(function(eq){if(eq==='body'||equipment.indexOf(eq)>=0)ids=ids.concat((STRENGTH_CHOICES[pattern]||{})[eq]||[])});
 for(var i=0;i<ids.length;i++){var match=list.find(function(e){return e.id===ids[i]});if(match)return match;}
 // Se non esiste una variante adeguata, non inventiamo un esercizio.
 return list.find(function(e){return Number(e.level)===2})||list[0]||null;
}
function buildNative(d,s){
 var p=d.profile||{},patterns=s.label==='Forza B'?['hinge','pull','squat','core']:['squat','push','pull','core'];
 return patterns.map(function(pattern){var e=chooseNative(p,pattern);return {key:pattern,catalogId:e&&e.id,name:e?e.name:'Esercizio da selezionare',tip:e?e.cue:'Seleziona una variante compatibile con la tua attrezzatura.',done:0,actual:[],actualLoads:[],target:{reps:(d.exerciseTargets&&e&&d.exerciseTargets[e.id]&&d.exerciseTargets[e.id].reps)||d.week.reps||8,loadKg:(d.exerciseTargets&&e&&d.exerciseTargets[e.id]&&d.exerciseTargets[e.id].loadKg)||null},skipped:false}});
}
function maxAllowedLoad(profile,exercise){
 if(!exercise||!exercise.catalogId)return null;
 var item=CATALOG_NATIVE.find(function(x){return x.id===exercise.catalogId});
 if(!item||item.equipment!=='dumbbells')return null;
 var per=Number(profile&&profile.dumbbellMaxKg);
 if(!Number.isFinite(per)||per<=0)return null;
 // Conservativo: un esercizio con manubri può impiegare uno o due manubri.
 // Il limite totale non sostituisce la scelta dell'attrezzatura effettivamente impiegata.
 return {per:per,total:per*2};
}
function TrainerNative(props){React.Component.call(this,props);this.state={index:0,phase:'work',effort:'normal',pain:'no',comment:''};this.update=this.update.bind(this);this.finish=this.finish.bind(this)}
TrainerNative.prototype=Object.create(React.Component.prototype);TrainerNative.prototype.constructor=TrainerNative;
TrainerNative.prototype.update=function(fn){var d=read();if(!d.active)return;fn(d.active,d);persistNative(d,this.props.refresh)};
TrainerNative.prototype.finish=function(){var d=read(),a=d.active;if(!a)return;var complete=a.exercises.every(function(e){return !e.skipped&&e.done>=(a.sets||d.week.sets||1)});var result={id:a.id,date:a.date,label:a.label,completed:complete,exercises:a.exercises,setsPlanned:a.sets,feedback:{effort:this.state.effort,pain:this.state.pain,comment:this.state.comment.slice(0,240)}};d.sessions=d.sessions||[];d.sessions.push(result);var planned=(d.week.sessions||[]).find(function(s){return s.id===a.id});if(planned){planned.completed=true;planned.status=complete?'done':'partial';planned.partial=!complete;planned.feedback=result.feedback}d.active=null;persistNative(d,this.props.refresh);this.props.go('history')};
TrainerNative.prototype.render=function(){
 var self=this,d=this.props.data,a=d.active;
 if(!a)return h('main',{className:'native-page'},'Nessun allenamento attivo.');
 var ex=a.exercises||[],i=Math.max(0,Math.min(this.state.index,ex.length-1)),e=ex[i],sets=a.sets||d.week.sets||1;
 var heading=h(Heading,{kicker:'SESSIONE GUIDATA · '+a.label,title:this.state.phase==='feedback'?'Com’è andata?':'Allenamento in corso'});
 if(this.state.phase==='feedback'){
  var feedback=h(Panel,null,
   h('p',null,'Le tue risposte serviranno a valutare le prossime proposte.'),
   h('label',{className:'setup-field'},'Sforzo percepito',h('select',{value:this.state.effort,onChange:function(ev){self.setState({effort:ev.target.value})}},[['easy','Facile'],['normal','Adeguato'],['hard','Molto faticoso']].map(function(x){return h('option',{key:x[0],value:x[0]},x[1])}))),
   h('label',{className:'setup-field'},'Dolore o sintomi insoliti?',h('select',{value:this.state.pain,onChange:function(ev){self.setState({pain:ev.target.value})}},h('option',{value:'no'},'No'),h('option',{value:'yes'},'Sì'))),
   h('label',{className:'setup-field'},'Note',h('textarea',{value:this.state.comment,maxLength:240,onChange:function(ev){self.setState({comment:ev.target.value})}})),
   h('button',{className:'primary',onClick:this.finish},'Salva allenamento →'));
  return h('main',{className:'native-page'},heading,feedback);
 }
 var panel=h(Panel,null,
  h('p',{className:'eyebrow'},'ESERCIZIO '+(i+1)+' / '+ex.length),h('h2',null,e.name),h('p',null,e.tip),
  h('p',{className:'native-muted'},'Serie '+e.done+' / '+sets+' · Ripetizioni suggerite: '+(e.target&&e.target.reps||d.week.reps||8)),h('p',{className:'native-muted'},'Recupero indicativo tra le serie: 90–150 secondi, adattalo alla respirazione e alla qualità del movimento.'),
  h('label',{className:'setup-field'},'Ripetizioni effettive',h('input',{type:'number',id:'native-reps',min:0,max:100,defaultValue:e.target&&e.target.reps||d.week.reps||8,key:'reps'+i+e.done})),
  maxAllowedLoad(d.profile,e)?h('p',{className:'native-muted'},'Attrezzatura: massimo '+maxAllowedLoad(d.profile,e).per+' kg per manubrio. Se usi un solo manubrio, il limite totale è '+maxAllowedLoad(d.profile,e).per+' kg; con due è '+maxAllowedLoad(d.profile,e).total+' kg.'):null,
  h('label',{className:'setup-field'},'Carico totale esterno (kg, facoltativo)',h('input',{type:'number',id:'native-load',min:0,step:0.5,placeholder:'Corpo libero',defaultValue:e.target&&e.target.loadKg!=null?e.target.loadKg:'',key:'load'+i+e.done})),
  h('button',{className:'primary',disabled:e.done>=sets,onClick:function(){var reps=Number(document.getElementById('native-reps').value),load=document.getElementById('native-load').value;if(!Number.isInteger(reps)||reps<0||reps>100){alert('Ripetizioni non valide.');return}var entered=load===''?null:Number(load),limits=maxAllowedLoad(d.profile,e);if(entered!==null&&(!Number.isFinite(entered)||entered<0||entered>500)){alert('Carico non valido.');return}if(limits&&entered!==null&&entered>limits.total){alert('Il carico supera il massimo disponibile di '+limits.total+' kg con due manubri.');return}self.update(function(a){var x=a.exercises[i];x.done++;x.actual.push(reps);x.actualLoads.push(load===''?null:Number(load))})}},'✓ Registra serie'),
  h('div',{className:'native-actions'},
   h('button',{className:'secondary-action',onClick:function(){self.update(function(a){a.exercises[i].skipped=true});if(i<ex.length-1)self.setState({index:i+1})}},'Salta esercizio'),
   h('button',{className:'secondary-action',onClick:function(){var variants=availableNative(d.profile).filter(function(x){return x.pattern===e.key&&x.id!==e.catalogId});if(!variants.length){alert('Nessuna alternativa compatibile.');return}var alt=variants[0];self.update(function(a){var x=a.exercises[i];x.catalogId=alt.id;x.name=alt.name;x.tip=alt.cue;x.done=0;x.actual=[];x.actualLoads=[]})}},'Cambia variante')),
  h('div',{className:'native-actions'},
   h('button',{className:'secondary-action',disabled:i===0,onClick:function(){self.setState({index:i-1})}},'← Precedente'),
   h('button',{className:'secondary-action',disabled:i>=ex.length-1,onClick:function(){self.setState({index:i+1})}},'Successivo →')),
  h('button',{className:'secondary-action',onClick:function(){if(confirm('Concludere e registrare la sessione anche se parziale?'))self.setState({phase:'feedback'})}},'Termina e lascia feedback'),
  h('p',{className:'native-muted'},'In caso di dolore, interrompi il movimento.'));
 return h('main',{className:'native-page'},heading,panel);
};
function ProgramNative(props){var d=props.data,w=d.week||{},ss=w.sessions||[];return h('main',{className:'native-page'},h(Heading,{kicker:'LA TUA STRATEGIA',title:'Programma settimanale'}),h(Panel,null,h('p',{className:'eyebrow'},'SETTIMANA '+(w.cycleWeek||1)+'/4'),h('h2',null,w.goalLabel||'Il tuo programma'),h('p',null,w.reason||'Percorso graduale.'),h('p',{className:'native-muted'},w.approved?'Piano approvato':'Il piano è una proposta: decidi tu se approvarlo.'),h('p',{className:'native-muted'},'Ripresa della forza: esercizi multiarticolari veri, volume iniziale moderato e carichi scelti da te. Le varianti facilitanti restano disponibili se necessarie.'),!w.approved?h('button',{className:'primary',onClick:function(){d.week.approved=true;persistNative(d,props.refresh)}},'Approvo il programma'):null),h(ProgressionPanel,{data:d,refresh:props.refresh}),h(Panel,null,h('h2',null,'Sessioni'),ss.map(function(s,i){return h('div',{key:s.id||i,className:'native-row'},h('span',{className:'native-number'},String.fromCharCode(65+i)),h('div',{className:'native-row-copy'},h('b',null,s.label),h('small',null,s.date+' · '+(s.completed?'Registrata':'Da svolgere')),h('small',null,buildNative(d,s).map(function(e){return e.name}).join(' · '))),!s.completed?h('button',{className:'secondary-action',disabled:!w.approved||!!d.active,onClick:function(){if(!w.approved)return;d.active={id:s.id,date:s.date,label:s.label,sets:w.sets||2,exercises:buildNative(d,s)};persistNative(d,props.refresh);props.go('trainer')}},'Inizia'):h('span',null,'✓'))}),ss.length===0?h('p',null,'Nessuna sessione pianificata.'):null),d.active?h('button',{className:'primary',onClick:function(){props.go('trainer')}},'Riprendi allenamento in corso →'):null,h(Panel,null,h('h2',null,'Modifica la data di una sessione'),h('p',{className:'native-muted'},'Puoi spostare una sessione senza modificare gli esercizi.'),h('form',{onSubmit:function(ev){ev.preventDefault();var id=ev.currentTarget.elements.session.value,date=ev.currentTarget.elements.day.value;if(!date)return;var target=ss.find(function(s){return s.id===id});if(!target||target.completed||ss.some(function(s){return s.id!==id&&s.date===date})){alert('Data non disponibile o sessione già completata.');return}target.date=date;persistNative(d,props.refresh)}},h('select',{name:'session'},ss.filter(function(s){return !s.completed}).map(function(s){return h('option',{key:s.id,value:s.id},s.label+' · '+s.date)})),h('input',{name:'day',type:'date',required:true}),h('button',{className:'secondary-action',type:'submit'},'Sposta sessione'))));}
function LibraryNative(props){
 var all=availableNative(props.data.profile||{}), patterns={squat:'Gambe',hinge:'Anca e glutei',push:'Spinta',pull:'Tirata',core:'Core'};
 var query=(props.search||'').trim().toLocaleLowerCase('it'),category=props.category||'all';
 var shown=all.filter(function(e){return (category==='all'||e.pattern===category)&&(!query||(e.name+' '+e.group+' '+e.muscle+' '+e.cue).toLocaleLowerCase('it').indexOf(query)>=0)});
 return h('main',{className:'native-page'},h(Heading,{kicker:'LABORATORIO',title:'Biblioteca esercizi'}),
  h(Panel,null,h('p',null,CATALOG_NATIVE.length+' esercizi totali · '+all.length+' compatibili con la tua attrezzatura'),
   h('label',{className:'setup-field'},'Cerca un esercizio',h('input',{type:'search',value:props.search||'',placeholder:'Es. squat, panca, rematore',onChange:function(ev){props.onSearch(ev.target.value)}})),
   h('label',{className:'setup-field'},'Famiglia di movimento',h('select',{value:category,onChange:function(ev){props.onCategory(ev.target.value)}},
    h('option',{value:'all'},'Tutte le famiglie'),Object.keys(patterns).map(function(k){return h('option',{key:k,value:k},patterns[k])})))),
  h('p',{className:'native-muted'},shown.length+' risultati · Le indicazioni sono educative e non sostituiscono una valutazione professionale.'),
  shown.slice(0,100).map(function(e){var guide=(window.MASTER_FIT_GUIDES||{})[e.id];return h(Panel,{key:e.id},h('details',{className:'exercise-detail'},
   h('summary',null,e.name+' · '+(patterns[e.pattern]||e.group||'Movimento')),
   h('p',null,e.cue||'Movimento controllato.'),h('p',{className:'native-muted'},'Attrezzatura: '+e.equipment+' · Livello '+e.level+' · Ripetizioni '+(e.reps||'da personalizzare')),
   guide?h('div',null,h('h3',null,'Come eseguirlo'),h('ol',null,(guide.steps||[]).map(function(x,i){return h('li',{key:i},x)})),
    h('h3',null,'Errori da evitare'),h('ul',null,(guide.errors||[]).map(function(x,i){return h('li',{key:i},x)})),
    guide.safety?h('p',{className:'native-muted'},guide.safety):null):h('p',{className:'native-muted'},'Guida approfondita non ancora disponibile per questa variante.')))}),
  shown.length>100?h('p',{className:'native-muted'},'Mostrati i primi 100 risultati: usa la ricerca per restringere la selezione.'):null,
  !shown.length?h(Panel,null,h('p',null,'Nessun esercizio trovato. Prova un altro termine oppure aggiorna l’attrezzatura nel profilo.')):null);
}
function LibraryScreen(props){React.Component.call(this,props);this.state={search:'',category:'all'};}
LibraryScreen.prototype=Object.create(React.Component.prototype);LibraryScreen.prototype.constructor=LibraryScreen;
LibraryScreen.prototype.render=function(){var self=this;return h(LibraryNative,{data:this.props.data,search:this.state.search,category:this.state.category,onSearch:function(v){self.setState({search:v})},onCategory:function(v){self.setState({category:v})}})};
function exerciseProgressions(d){
 var sessions=(d.sessions||[]).filter(function(s){return s&&Array.isArray(s.exercises)&&s.feedback});
 var latest={};
 sessions.forEach(function(s,si){(s.exercises||[]).forEach(function(e){if(!e||!e.catalogId||e.skipped||!Array.isArray(e.actual)||!e.actual.length)return;latest[e.catalogId]={session:s,exercise:e,index:si}})});
 return Object.keys(latest).map(function(id){
  var rec=latest[id],s=rec.session,e=rec.exercise,feedback=s.feedback||{},target=d.exerciseTargets&&d.exerciseTargets[id]||{},baseline=Number(target.reps)||Number(d.week&&d.week.reps)||8;
  var sets=Number(s.setsPlanned)||Number(d.week&&d.week.sets)||2;
  var complete=e.done>=sets&&e.actual.length>=sets;
  var reached=complete&&e.actual.every(function(r){return Number(r)>=baseline});
  var loads=(e.actualLoads||[]).filter(function(n){return n!==null&&Number.isFinite(Number(n))&&Number(n)>=0}).map(Number);
  var load=loads.length===e.actual.length&&loads.every(function(n){return n===loads[0]})?loads[0]:null;
  var previous=target.loadKg==null?null:Number(target.loadKg);
  var safe=feedback.pain!=='yes'&&feedback.effort!=='hard';
  var kind=!safe?'hold':reached&&feedback.effort==='easy'&&baseline<15?'reps':'hold';
  var reason=feedback.pain==='yes'?'Sono stati segnalati dolore o sintomi: nessuna progressione proposta.':feedback.effort==='hard'?'Sforzo elevato: mantieni il livello e valuta il recupero.':kind==='reps'?'Serie completate, obiettivo raggiunto e sforzo facile: puoi valutare una ripetizione in più su questo esercizio.':reached&&feedback.effort==='easy'&&baseline>=15?'Hai raggiunto 15 ripetizioni con margine: valuta una variante più impegnativa o più serie, senza inventare pesi che non possiedi. La modifica richiede una scelta manuale.':'Servono altri dati prima di proporre un aumento.';
  return {id:id+'|'+String(s.id||'')+'|'+rec.index+'|'+kind,exerciseId:id,name:e.name||id,kind:kind,current:baseline,target:baseline+1,load:load,previousLoad:previous,reason:reason,date:s.date||''};
 }).sort(function(a,b){return a.name.localeCompare(b.name,'it')});
}
function ProgressionPanel(props){
 var d=props.data,proposals=exerciseProgressions(d),decisions=d.exerciseProgressionDecisions||{};
 return h(Panel,null,h('p',{className:'eyebrow'},'PROGRESSIONE PER ESERCIZIO'),h('h2',null,'Proposte personalizzate'),
 h('p',{className:'native-muted'},'Ogni esercizio ha un obiettivo indipendente. Nessun aumento di peso automatico: il carico resta quello registrato finché non lo modifichi tu durante una sessione.'),
 !proposals.length?h('p',{className:'native-muted'},'Completa una sessione con feedback per vedere i suggerimenti.'):null,
 proposals.map(function(x){var decision=decisions[x.exerciseId];return h('div',{className:'exercise-proposal',key:x.exerciseId},
 h('h3',null,x.name),h('p',{className:'native-muted'},'Ultima sessione: '+x.date+' · Obiettivo: '+x.current+' ripetizioni'+(x.load!=null?' · Carico registrato: '+x.load+' kg':'')),
 h('p',null,x.reason),
 decision&&decision.id===x.id?h('p',{className:'native-muted'},decision.choice==='accepted'?'Approvata: '+x.target+' ripetizioni per serie.':'Proposta non applicata.'):
 x.kind==='reps'?h('div',{className:'native-actions'},
 h('button',{className:'primary',onClick:function(){var fresh=read();if(fresh.active)return alert('Termina prima la sessione attiva.');var proposal=exerciseProgressions(fresh).find(function(p){return p.exerciseId===x.exerciseId});if(!proposal||proposal.id!==x.id||proposal.kind!=='reps')return;fresh.exerciseTargets=fresh.exerciseTargets||{};fresh.exerciseTargets[x.exerciseId]=Object.assign({},fresh.exerciseTargets[x.exerciseId]||{},{reps:x.target});fresh.exerciseProgressionDecisions=fresh.exerciseProgressionDecisions||{};fresh.exerciseProgressionDecisions[x.exerciseId]={id:x.id,choice:'accepted',date:new Date().toISOString()};persistNative(fresh,props.refresh)}},'Approva +1 ripetizione'),
 h('button',{className:'secondary-action',onClick:function(){var fresh=read();fresh.exerciseProgressionDecisions=fresh.exerciseProgressionDecisions||{};fresh.exerciseProgressionDecisions[x.exerciseId]={id:x.id,choice:'declined',date:new Date().toISOString()};persistNative(fresh,props.refresh)}},'Non applicare')):null)}),
 h('p',{className:'native-muted'},'Questi suggerimenti sono indicativi e non sostituiscono un professionista. In caso di sintomi interrompi l’attività.'));
}
function CoachNative(props){var d=props.data,c=d.checkin||{};return h('main',{className:'native-page'},h(Heading,{kicker:'MASTER COACH · BETA',title:'Il tuo alleato'}),h(Panel,null,h('h2',null,'Check-in prima di allenarti'),h('p',null,'Registra come ti senti. Non è una valutazione medica.'),h('form',{className:'setup-native',onSubmit:function(ev){ev.preventDefault();var f=ev.currentTarget;d.checkin={date:new Date().toLocaleDateString('sv-SE'),energy:f.elements.namedItem("energy").value,sleep:f.elements.namedItem("sleep").value,symptoms:f.elements.namedItem("symptoms").value,approved:false,declined:false};persistNative(d,props.refresh)}},h('label',{className:'setup-field'},'Energia',h('select',{name:'energy'},h('option',{value:'good'},'Buona'),h('option',{value:'low'},'Bassa'))),h('label',{className:'setup-field'},'Sonno',h('select',{name:'sleep'},h('option',{value:'good'},'Riposo sufficiente'),h('option',{value:'poor'},'Ho dormito poco'))),h('label',{className:'setup-field'},'Dolore o sintomi insoliti?',h('select',{name:'symptoms'},h('option',{value:'no'},'No'),h('option',{value:'yes'},'Sì'))),h('button',{className:'primary',type:'submit'},'Salva check-in'))),c.date?h(Panel,null,h('h2',null,'La proposta del Coach'),h('p',null,c.symptoms==='yes'?'Hai segnalato sintomi: evita di allenarti attraverso il dolore e chiedi una valutazione professionale.':c.sleep==='poor'||c.energy==='low'?'Valuta di ridurre il carico o rinviare la sessione. Nessuna modifica sarà applicata automaticamente.':'Puoi seguire il piano approvato ascoltando i tuoi segnali.'),h('p',{className:'native-muted'},'Registrato: '+c.date+' · '+(c.approved?'Proposta accettata':c.declined?'Proposta rifiutata':'In attesa della tua scelta')),h('div',{className:'native-actions'},h('button',{className:'secondary-action',onClick:function(){d.checkin.approved=true;d.checkin.declined=false;persistNative(d,props.refresh)}},'Accetto il consiglio'),h('button',{className:'secondary-action',onClick:function(){d.checkin.approved=false;d.checkin.declined=true;persistNative(d,props.refresh)}},'Non accetto'))):null,h(ProgressionPanel,{data:d,refresh:props.refresh}),h(Panel,null,h('h2',null,'Il controllo resta tuo'),h('p',null,'Il Coach non modifica in autonomia carichi, esercizi o calendario. Ogni proposta richiede la tua decisione.')));}
function SettingsNative(props){var d=props.data,p=d.profile||{};return h('main',{className:'native-page'},h(Heading,{kicker:'IL TUO PERCORSO',title:'Profilo atleta'}),h(Panel,null,h('h2',null,p.name||'Atleta'),h('p',null,'Età '+p.age+' · '+p.height+' cm · '+p.weight+' kg'),h('form',{className:'setup-native',onSubmit:function(ev){ev.preventDefault();var f=ev.currentTarget,weight=Number(f.elements.namedItem("weight").value),duration=Number(f.elements.namedItem("duration").value);if(weight<25||weight>350)return alert('Peso non valido.');p.name=f.elements.namedItem("username").value.trim().slice(0,32)||'Atleta';p.weight=weight;p.duration=duration;persistNative(d,props.refresh);alert('Profilo aggiornato. Il programma già approvato non viene modificato.') }},h('label',{className:'setup-field'},'Nome',h('input',{name:'username',defaultValue:p.name,maxLength:32})),h('label',{className:'setup-field'},'Peso (kg)',h('input',{name:'weight',type:'number',min:25,max:350,defaultValue:p.weight})),h('label',{className:'setup-field'},'Durata preferita',h('select',{name:'duration',defaultValue:String(p.duration||60)},[30,45,60].map(function(n){return h('option',{key:n,value:n},n+' minuti')}))),h('button',{className:'primary',type:'submit'},'Salva modifiche'))),h(Panel,null,h('h2',null,'Attrezzatura e progressione'),h('p',{className:'native-muted'},'Il limite è per ciascun manubrio. Le proposte del Coach non devono superare il materiale disponibile.'),h('form',{className:'setup-native',onSubmit:function(ev){ev.preventDefault();var fresh=read(),v=Number(ev.currentTarget.elements.namedItem('maxkg').value);if(!Number.isFinite(v)||v<0.5||v>100){alert('Indica un peso tra 0,5 e 100 kg.');return}fresh.profile=fresh.profile||{};fresh.profile.equipment=fresh.profile.equipment||[];if(fresh.profile.equipment.indexOf('dumbbells')<0)fresh.profile.equipment.push('dumbbells');fresh.profile.dumbbellMaxKg=v;persistNative(fresh,props.refresh)}},h('label',{className:'setup-field'},'Massimo per manubrio (kg)',h('input',{name:'maxkg',type:'number',min:0.5,max:100,step:0.5,required:true,defaultValue:p.dumbbellMaxKg||6})),h('button',{className:'primary',type:'submit'},'Aggiorna attrezzatura'))),h(Panel,null,h('h2',null,'Backup'),h('button',{className:'secondary-action',onClick:downloadBackup},'Esporta dati JSON'),h('label',{className:'setup-field'},'Ripristina backup JSON',h('input',{type:'file',accept:'.json,application/json',onChange:function(ev){var file=ev.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var parsed=JSON.parse(reader.result);if(!parsed||!parsed.profile||!parsed.week||!Array.isArray(parsed.sessions))throw Error('Formato non valido');if(confirm('Sostituire i dati correnti con quelli del backup?'))persistNative(parsed,props.refresh)}catch(e){alert('Backup non valido: '+e.message)}};reader.readAsText(file)}}))),h(Panel,{className:'new-user-panel'},h('h2',null,'Nuovo utente · Riparti da zero'),h('p',null,'Esporta prima un backup se vuoi conservare il percorso.'),h('button',{className:'danger-action',onClick:newUser},'Ricomincia da zero')));}

function App(){React.Component.apply(this,arguments);this.state={page:'home',data:read()};this.go=this.go.bind(this);this.refresh=this.refresh.bind(this)}
App.prototype=Object.create(React.Component.prototype);App.prototype.constructor=App;
App.prototype.componentDidMount=function(){window.addEventListener('focus',this.refresh);document.addEventListener('visibilitychange',this.refresh)};
App.prototype.componentWillUnmount=function(){window.removeEventListener('focus',this.refresh);document.removeEventListener('visibilitychange',this.refresh)};
App.prototype.refresh=function(){this.setState({data:read()})};
App.prototype.go=function(page){if(page==='legacy-coach'){page='coach'}this.setState({page:page,data:read()});window.scrollTo(0,0)};
App.prototype.render=function(){var page=this.state.page,data=this.state.data,content=!data.profile?h(Welcome,{onCreated:this.refresh}):page==='home'?h(Home,{data:data,go:this.go}):page==='coach'?h(CoachNative,{data:data,refresh:this.refresh}):page==='trainer'?h(TrainerNative,{data:data,refresh:this.refresh,go:this.go}):page==='program'?h(ProgramNative,{data:data,refresh:this.refresh,go:this.go}):page==='history'?h(History,{data:data}):page==='library'?h(LibraryScreen,{data:data}):h(SettingsNative,{data:data,refresh:this.refresh});return h('div',{className:'shell'},h(Top,{go:this.go}),content,h(Nav,{page:page,go:this.go}))};
ReactDOM.render(h(App),document.getElementById('root'));
})();
