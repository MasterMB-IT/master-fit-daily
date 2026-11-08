# MASTER-Fit — Coach-first beta

## Funzioni
- Onboarding fisico e obiettivi (una volta sola)
- Proposta di programma settimanale da approvare
- Allenamento guidato: una serie alla volta, un pulsante di conferma
- Feedback finale su difficoltà e fastidi
- Settimana successiva proposta sulla base dei feedback (aumento di una ripetizione, mantenimento o riduzione prudenziale)
- Storico, backup JSON, ripristino e cache offline su HTTPS

## Avvio
Per testare sul PC, aprire `index.html` in Edge. Per la PWA offline su iPhone, pubblicare la cartella su un hosting statico HTTPS e aggiungere il sito alla schermata Home da Safari.

## Limiti importanti
Questa è una beta tecnica, non un piano di allenamento clinicamente validato. Non usa valutazioni individuali della tecnica, consente la correzione manuale delle ripetizioni, ma non rileva automaticamente carichi o tecnica e non sostituisce professionisti sanitari. Le progressioni sono regole illustrative, non prescrizioni. L'utente deve fermarsi in caso di dolore o sintomi insoliti. I dati sono conservati nel browser del dispositivo e possono essere cancellati dal sistema: esportare regolarmente il backup. Nessuna sincronizzazione cloud o account. Non ancora collaudata su iPhone fisico.

## Revisione coach-first 3
- Serie confermata con un pulsante; modifica facoltativa delle ripetizioni effettive.
- Le sessioni interrotte o con esercizi saltati sono segnate come parziali.
- La proposta successiva considera completamento, fatica e fastidi riferiti.
- La modifica del profilo conserva lo storico delle sessioni.
- Dati fisici iniziali non precompilati.
- La logica resta dimostrativa e richiede collaudo su browser e iPhone.

## Revisione 4 — Calendario e adattamento
- Passaggio alla settimana corrente quando si riapre l'app, con nuova approvazione richiesta.
- Segnalazione degli allenamenti non completati, senza attribuire falsi completamenti.
- Se non esistono varianti di tirata compatibili con l'attrezzatura, la sessione B usa movimenti a corpo libero disponibili.
- Un feedback con dolore non produce automaticamente una progressione; viene suggerita una valutazione professionale.
- Le modifiche non costituiscono un piano clinicamente validato.

## Revisione 5 — Biblioteca esercizi
- Catalogo strutturato `exercise-catalog.json` con **292 esercizi distinti** in 15 famiglie di movimento, con identificativo, attrezzatura, livello indicativo (1–4), muscoli prevalenti, suggerimento tecnico, intervalli orientativi e nota di sicurezza.
- `exercise-catalog.js` è la copia caricabile offline dal browser; la libreria si apre da **Profilo → Esplora il catalogo**.
- Il trainer seleziona un esercizio compatibile con l'attrezzatura dichiarata e con il livello generale; offre un'alternativa compatibile senza far scegliere da centinaia di voci.
- Livello 1 per chi inizia o riprende, fino al livello 3 per chi si allena già. Le varianti di livello 4 sono consultabili ma **non vengono prescritte automaticamente**.
- La selezione è ancora una regola semplice, non una valutazione biomeccanica: **non** tiene conto di infortuni, condizioni cliniche, disabilità, gravidanza, tecnica individuale o capacità misurata. Non è corretto definirla idonea a ogni persona.
- I suggerimenti tecnici sono generali e non sono istruzioni esaustive; alcuni esercizi richiedono attrezzatura aggiuntiva (panca, ancoraggi sicuri, supporti) non ancora modellata in modo completo. Prima di usarli in un programma reale serve aggiungere requisiti puntuali, alternative validate e revisione da parte di un professionista qualificato.
- Fonti e principi di riferimento da verificare e documentare in un futuro motore di prescrizione: linee guida ACSM sulla progressione dell'allenamento contro resistenza e raccomandazioni WHO sull'attività fisica. **Non** è stata eseguita una revisione sistematica della letteratura né una validazione clinica del catalogo.

## EVOLVE — redesign 2026-11-07
- Nuova interfaccia mobile dark/neon lime ispirata al concept EVOLVE, con Home, Allenati, Progressi, Esercizi, Profilo e accesso contestuale al Coach.
- Home con riepilogo basato sui dati effettivi, piano da approvare, scheda del giorno e spiegazione del Coach.
- Pagina settimanale dedicata; mantenuto il motore originale di sessioni guidate, feedback e progressioni dimostrative.
- Coach con spiegazione trasparente delle regole e check-in volontario (energia, sonno, fastidi), salvato localmente. Il check-in NON modifica ancora la prescrizione né genera punteggi di recupero.
- 292 esercizi e test del catalogo conservati; dati precedenti nello stesso browser restano compatibili grazie alla chiave di archiviazione invariata.
- Questa versione non include scansione corporea, analisi video, chatbot AI, stime cliniche o sincronizzazione cloud. Non è ancora validata su iPhone reale.

## EVOLVE v2 — Revisione interfaccia allenamento e Coach (07/11/2026)
- Allenamento: scena esercizio, barra avanzamento, indicatore delle serie e comandi di recupero/difficoltà.
- Coach: interfaccia dedicata con spiegazione delle proposte e check-in.
- Se il check-in del giorno segnala sintomi insoliti, viene bloccato l'avvio automatico della sessione e suggerita una valutazione professionale.
- Nessuna analisi video, scansione corporea o IA conversazionale implementata: gli elementi visivi sono illustrativi.

## EVOLVE v3 — Progressione per esercizio (07/11/2026)
- Per ogni movimento scelto, il trainer consulta le serie realmente registrate nelle sessioni precedenti.
- Propone ripetizioni individuali con spiegazione: aumento prudente solo dopo una sessione facile, mantenimento o consolidamento se incompleta/faticosa.
- In presenza di dolore segnalato non propone aumenti. Restano in vigore le cautele mediche e il blocco del check-in.
- Non deduce la forza dai carichi non registrati e non valuta la tecnica. Le regole restano sperimentali e non sono prescrizioni cliniche.
- Aggiunti test automatici per i casi di progressione e mancata progressione.

## EVOLVE v4 — Ciclo di quattro settimane (07/11/2026)
- Il programma conserva `cycleWeek` (1–4) e `phase` (`base`, `consolidamento`, `sviluppo`, `recupero`), visibili nella proposta settimanale e nel Coach.
- La quarta settimana riduce a una serie per esercizio e impedisce incrementi di ripetizioni, anche per la progressione specifica di un esercizio.
- Il ciclo riparte dalla fase base, richiedendo sempre l'approvazione del nuovo piano.
- I feedback di dolore continuano a impedire progressioni. La scansione in quattro settimane è una regola dimostrativa e non sostituisce la programmazione di un professionista.
- I dati precedenti privi di `cycleWeek` restano leggibili e ripartono dal primo ciclo compatibile.
- Test dedicato `tests/periodization.test.cjs`.

## EVOLVE v5 — Calendario flessibile (07/11/2026)
- In configurazione si possono indicare esattamente 2 o 3 giorni preferiti della settimana; se non specificati si applica la distribuzione preesistente.
- Dalla pagina Allenati si può spostare una sessione non completata in un altro giorno della stessa settimana, purché non già occupato da un'altra sessione.
- Gli spostamenti non cancellano lo storico e non alterano le regole di progressione. Le date delle sessioni future riflettono i giorni preferiti del profilo.
- Non esiste ancora un vero algoritmo di recupero basato su ore di riposo, disponibilità a turni o affaticamento: gli spostamenti sono manuali e richiedono collaudo browser/iPhone.

## EVOLVE v6 — Calendario adattivo (07/11/2026)
- Nuovi campi facoltativi nel primo accesso: turni mattina/pomeriggio, alternanza settimanale con lunedì di riferimento, giorni indisponibili.
- Il motore confronta le combinazioni dei giorni disponibili, favorisce le preferenze e almeno un giorno di pausa fra sedute quando possibile. La scelta è deterministica, spiegata nella pagina Allenati e sempre soggetta ad approvazione.
- I turni sono modellati solo come preferenze di calendario, non come misurazione di fatica o recupero. L'utente può ancora spostare manualmente le sedute.
- Profili precedenti privi dei nuovi campi restano compatibili. Per cambiare la disponibilità, usare Profilo → Modifica il profilo (l'attuale configurazione richiede di reinserire i dati).
- Non viene effettuata sincronizzazione con un calendario esterno.

## EVOLVE v7 — Adattamento giornaliero

Il check-in del giorno può proporre una riduzione **temporanea** della sessione: una serie in meno se il piano ne prevede più di una, oppure due ripetizioni base in meno (minimo tre) se è già prevista una sola serie. La riduzione viene applicata soltanto dopo approvazione esplicita; il rifiuto lascia invariata la scheda. Il dettaglio della modifica è registrato nella sessione. Dolore o sintomi insoliti segnalati nel check-in del giorno impediscono l'avvio dell'allenamento. Nessuna stima clinica o sensoriale viene prodotta. La funzionalità è sperimentale e non sostituisce una valutazione medica.


## EVOLVE v8 — Calendario e recupero

La Home e il Coach mostrano una proposta **facoltativa** di spostamento della prossima sessione quando il check-in del giorno segnala energia bassa/sonno insufficiente (se la sessione è oggi) oppure l’ultima sessione degli ultimi sette giorni risulta particolarmente faticosa o parziale. Il sistema cerca una data libera entro tre giorni e all’interno della stessa settimana; lo spostamento richiede approvazione esplicita e può essere rifiutato. In assenza di date disponibili offre una spiegazione senza modificare il calendario. Sintomi insoliti non attivano proposte di allenamento: è mostrato un avviso di sicurezza. Le regole non stimano il recupero fisiologico.

## EVOLVE v9 — strategie per obiettivo (07/11/2026)
- Distinte quattro strategie di base: forza, ipertrofia, benessere e composizione corporea.
- Ripetizioni iniziali indicative e tetti di progressione specifici per obiettivo; i principianti mantengono volumi contenuti.
- Il Coach spiega la priorità dell'obiettivo nella proposta settimanale; ogni piano continua a richiedere approvazione.
- La settimana di recupero e la cautela in presenza di fastidi hanno precedenza sugli incrementi.
- I dati preesistenti restano leggibili; le strategie vengono applicate quando viene generato un nuovo piano.
- Sono regole generali sperimentali: non equivalgono a una valutazione professionale o a un programma clinicamente personalizzato.

## EVOLVE v10 — Prescrizioni per movimento e obiettivo (2026-11-07)
- La scelta iniziale degli esercizi considera livello, attrezzatura e obiettivo, senza proporre varianti avanzate ai profili in ripresa.
- I movimenti fondamentali e gli esercizi di stabilità ricevono indicazioni diverse su ripetizioni iniziali e recupero suggerito.
- I recuperi sono orientativi e non impongono un timer automatico; l'utente conferma quando è pronto.
- L'app mostra un suggerimento tecnico sintetico coerente con l'obiettivo.
- Il sistema non determina carichi in kg o capacità massimali: queste richiedono dati aggiuntivi e verifica della tecnica. In presenza di sintomi sospetti, non usare la beta per decidere l'idoneità all'allenamento.


## EVOLVE v11 — Carichi per serie
- Durante la serie è possibile registrare facoltativamente il carico esterno totale in kg (0,25 kg di precisione).
- I dati `actualLoads` sono salvati per ogni serie insieme alle ripetizioni; `null` significa non dichiarato/corpo libero.
- Il trainer mostra i carichi della precedente sessione completata senza proporre aumenti automatici in kg.
- Progressioni delle ripetizioni sospese quando i carichi precedenti sono variabili o incompleti.
- Lo storico indica quante tipologie di esercizio hanno carichi registrati.
- Nessuna stima del massimale o misurazione automatica della tecnica.


## EVOLVE v12 — Confronto delle prestazioni
La pagina Progressi confronta lo stesso esercizio tra sessioni complete e senza fastidi dichiarati. Distingue aumenti di ripetizioni a carico invariato, aumenti di carico a ripetizioni non inferiori, riduzioni, dati incompleti e variazioni non confrontabili. Non calcola 1RM e non equipara automaticamente le ripetizioni alla forza.

## EVOLVE v13 — Diario evolutivo del Coach
- In Progressi compare una cronologia narrativa delle sessioni complete e parziali, dei primi riferimenti per esercizio, delle prestazioni consolidate e delle progressioni confrontabili.
- Le segnalazioni di dolore/fastidi appaiono come avvisi, non come progressi; le sessioni parziali o con fastidi non generano progressioni confrontate.
- Traguardi di costanza a 5, 10, 20, 50 e 100 sessioni complete.
- Tutte le frasi derivano dai dati locali registrati; nessuna stima di recupero fisiologico o forza massimale.

### EVOLVE v14 — Motivazioni verificabili
Il Coach espone, nelle schermate Home, Allenati e Coach, una scheda espandibile con i dati osservati e le regole che hanno portato alla proposta. Ogni nuova settimana salva un riepilogo minimo della settimana precedente (`decisionSource`) per evitare spiegazioni basate su dati successivamente modificati. Le versioni precedenti restano leggibili, anche se non hanno lo snapshot delle motivazioni. Le motivazioni non costituiscono una diagnosi o una misurazione fisiologica.

## EVOLVE v15 — Guide tecniche approfondite
- Nuovo `technique-guide.js`: 16 schede tecniche curate con passaggi, errori comuni, facilitazioni, progressioni e respirazione.
- Schede consultabili dalla biblioteca e dal trainer tramite pannelli facoltativi.
- Le restanti varianti del catalogo conservano la descrizione sintetica e sono segnalate esplicitamente come **non ancora dotate di guida approfondita**. Non presentiamo descrizioni generiche come istruzioni specifiche.
- Le istruzioni sono educative e non sostituiscono supervisione tecnica, screening medico o valutazione dei sintomi.

### EVOLVE v16 — Guide e alternative motivate
- 26 guide tecniche approfondite, distribuite tra più famiglie di movimento.
- Le alternative durante una sessione vengono filtrate per attrezzatura e livello uguale o inferiore a quello del movimento corrente; il coach spiega la proposta e richiede conferma.
- Le alternative già provate nella stessa sessione non vengono riproposte; la sostituzione non è consentita dopo aver registrato serie, per preservare i dati.
- Il filtro è indicativo: non garantisce idoneità clinica o biomeccanica e non sostituisce la valutazione di un professionista.

### EVOLVE v17 — Ampliamento guide tecniche
- Le guide approfondite passano da 26 a 41, con 15 nuove schede specifiche per movimenti di base e varianti accessibili.
- Le nuove schede descrivono esecuzione, errori comuni, regressione, progressione e respirazione.
- Il catalogo rimane di 292 esercizi: le restanti schede hanno informazioni sintetiche e non devono essere considerate guide approfondite.
- Aggiunto test automatico di copertura e integrità delle 41 guide.
- Contenuti educativi sperimentali: non sostituiscono istruzione professionale o valutazione clinica.

### EVOLVE v18 — Guide introduttive
Aggiunte 11 guide nuove (12 schede curate, di cui una già presente) tecniche specifiche per varianti di squat, ponte glutei, piegamenti, elastici, step-up e stabilità del tronco. Totale: 52 guide approfondite su 292 esercizi. Indicazioni educative da sottoporre a revisione professionale prima della pubblicazione.

## EVOLVE v19 — Autovalutazione iniziale facoltativa

Nel primo accesso è disponibile una breve autovalutazione descrittiva (squat, spinta, anche/glutei, stabilità). Non richiede prove motorie e non certifica sicurezza, tecnica o idoneità. Il motore usa risposte opzionali per scegliere varianti introduttive dal catalogo compatibili con livello e attrezzatura. Risposte assenti o non riconosciute mantengono il comportamento precedente. La motivazione compare nel programma e nel profilo. Test: `tests/capability-assessment.test.cjs`.

## v20 — Valutazione continua con approvazione
- All'avvio di una sessione, il Coach può proporre una variante più semplice o di livello superiore sulla base di **due sessioni complete** con lo stesso esercizio, serie e ripetizioni registrate e feedback senza dolore.
- Le proposte di avanzamento richiedono ripetizioni obiettivo raggiunte e fatica non elevata; le regressioni considerano fatica e ripetizioni mancate.
- Sono rispettati livello e attrezzatura dichiarati. Le proposte sono spiegate e richiedono conferma esplicita; i rifiuti non vengono riproposti per gli stessi dati.
- Non è una valutazione della tecnica né un'idoneità medica. Non si modifica il profilo né si forza una progressione automatica.

## v21 — Proposte di evoluzione anticipate
- Le proposte motivate di variante sono visibili in Home, Programma e MASTER Coach, prima dell'avvio.
- L'utente approva o mantiene l'esercizio corrente; la decisione viene registrata per gli stessi dati.
- Le varianti approvate vengono applicate alla prima sessione compatibile una sola volta, previa nuova verifica dell'attrezzatura e del livello.
- Rimossa la richiesta di conferma durante l'avvio della sessione. Le proposte non sono diagnosi né verifiche della tecnica.
- Test dedicato: `tests/movement-preview.test.cjs`.

## v22 — Memoria delle decisioni e rivalutazione
- Storico visibile delle proposte approvate, rifiutate, applicate e non più appropriate.
- Una proposta approvata non viene applicata se l'esercizio, la compatibilità o le prestazioni successive sono cambiate; dolore o fatica elevata invalidano la proposta.
- I rifiuti rimangono rispettati per le stesse evidenze. La proposta non è una valutazione clinica.
- Test dedicato: `tests/decision-memory.test.cjs`.


## v23 — Continuità e ripresa dopo pause
Il Coach distingue settimana regolare, incompleta, saltata (con piano approvato) e pausa di più settimane. La ripresa non aumenta automaticamente le ripetizioni e limita inizialmente a una serie per esercizio; mantiene lo storico e richiede approvazione del nuovo piano. La valutazione è basata su calendario e registrazioni, non è una valutazione clinica.


## v24 — Motivo della pausa e tutela della ripresa
- Dopo una settimana completamente saltata o una pausa prolungata, il Coach chiede se l’interruzione dipende da impegni oppure da problemi fisici.
- Per impegni: propone il rientro prudente già previsto e richiede l’approvazione del piano.
- Per problemi fisici: blocca approvazione e avvio automatici e invita a una valutazione sanitaria. Non dichiara mai idoneità clinica.
- La scelta rimane modificabile dall’utente e viene conservata nel programma locale; lo storico non viene eliminato.
- Il blocco viene verificato anche all’avvio per proteggere da vecchi backup o stati precedentemente approvati.


## v25 — Restyling visivo premium
Restyling reale dell’interfaccia PWA (non un rendering): hero tridimensionale astratto, superfici e gradienti coerenti, contrasto, CTA, navigazione, schermata Coach e allenamento guidato. Layout mobile-first, focus accessibili e supporto riduzione animazioni. Cache PWA aggiornata per includere anche technique-guide.js. Il collaudo su iPhone rimane da svolgere.


## v26 · Cinematic redesign
Nuovi asset vettoriali originali per Home e Coach, tema nero/neon/arancio, pulsanti luminosi, navigazione e pannelli riprogettati. I dati visualizzati restano reali e non sono state aggiunte metriche inventate.

## EVOLVE v27 — Cinematic UI per tutte le schermate
Nuovo layer `cinematic-v27.css`: Home con riepilogo circolare basato sulle sessioni reali, Coach con visualizzazione segnale decorativa, calendario settimanale con date e sessioni effettive, Progressi con grafico completate/parziali (non è un indice di forza), Allenamento con figura stilizzata e migliore contrasto, Biblioteca e Profilo con trattamento visivo coerente. Non sono presenti percentuali fisiologiche simulate. Il disegno dei personaggi è ancora stilizzato e non replica il fotorealismo del concept. Test automatici non equivalgono a collaudo visuale su iPhone.


## v28 — Cinematic visual refinement
- Asset fotografici ritagliati e sfumati dal mockup generato per la direzione visiva; non usati come schermate statiche.
- Home e Coach ora usano immagini dedicate; contrasto e gradienti aggiornati, con dati e pulsanti reali.
- Nuovo foglio cinematic-v28.css, registrato in HTML e cache offline PWA.
- Limite: asset a risoluzione ridotta e visual QA su iPhone ancora da effettuare.


## v29 — Rifinitura cinematografica
- Nuovo foglio cinematic-v29.css per Home, Coach, Programma, Allenamento, Progressi, Esercizi e Profilo.
- Coach: quattro azioni rapide reali, collegate a schermate esistenti e check-in. Nessuna chat o analisi fisiologica simulata.
- Miglioramenti di proporzioni su schermi stretti, navigazione e focus tastiera.
- Cache offline aggiornata a v29.


## v30 — Cinematic Reference Pass
Interfaccia rifinita su tutte le viste, Home con indicatore settimanale reale, Coach con messaggio e stato beta, contrasti e navigazione mobile; nessuna metrica sintetica. Verificare visivamente su iPhone e aggiornare il service worker v30.


### v31 · Artwork dedicato e rifinitura mobile
- Nuova illustrazione originale del Colosseo per la Home; mantiene il personaggio cinematico esistente.
- Nuova illustrazione anatomica stilizzata originale per la schermata di allenamento, esplicitamente decorativa e non dimostrazione della tecnica.
- Rifiniti contrasto, composizione, navigazione e layout su schermi stretti.
- Cache offline aggiornata. Nessuna metrica fisiologica fittizia.


## v32 — Mobile visual pass
- Ridotta l’altezza della Home per rendere visibile prima il pulsante di avvio.
- Icone SVG coerenti e navigazione con `aria-current` accessibile.
- Ottimizzati spazi e proporzioni su schermi da 320–440 px, Coach e scheda esercizio.
- Tentativo di screenshot browser non riuscito per blocco dell’ambiente; verifica visiva reale ancora necessaria.


## EVOLVE v33 — verifica visiva e composizione cinematografica
Nuovo livello CSS cinematic-v33.css: composizione Home, palette arancione/verde neon, contrasti Coach, allenamento, navigazione e layout mobile. Test visivi headless su sei schermate a 390×844, senza overflow orizzontale. Le immagini cinematiche rimangono asset locali; il collaudo su iPhone fisico non è ancora effettuato.


### v34 — QA visuale e aggiornamento offline
- Corretto il segno di spunta che appariva sotto il monogramma del logo.
- Rifiniti contrasto, gerarchia, calendario e pulsanti sulle schermate mobili.
- Aggiunti focus visibili per navigazione da tastiera.
- Corretto il service worker: ora include anche i fogli v33 e v34 e aggiorna la cache alla v34.


## v35 — Reference visual pass
- Nuovo `cinematic-v35.css`: gerarchia e proporzioni aggiornate su Home, Coach, calendario, allenamento e schede secondarie.
- Nessun indicatore fittizio aggiunto; dati e azioni continuano a provenire dalla logica esistente.
- `index.html` include il nuovo CSS e `sw.js` aggiorna la cache offline a v35.
- Il tentativo di collaudo Playwright mobile è stato bloccato dalle policy del browser (`ERR_BLOCKED_BY_ADMINISTRATOR`): non considerare questa versione verificata visivamente.
- Il rendering di riferimento rimane una direzione estetica, non una corrispondenza pixel-perfect.


## v36 — Ricostruzione schermate secondarie
- Biblioteca: categorie visuali con icone, numero di varianti compatibili, schede tecniche originali accessibili.
- Profilo: dashboard atleta con immagine cinematografica, dati dichiarati, allenamenti completati, modifica profilo e backup preservati.
- Allenati e Progressi: nuovo linguaggio visivo per calendari, sessioni e indicatori.
- Nessuna metrica fisiologica inventata; resta necessaria una verifica visiva completa su iPhone.


## v37 — Ricostruzione Home cinematografica
Home ricomposta con scena a livelli (Colosseo, atleta, illuminazione), marchio nel pannello, testo e indicatore su aree dedicate. La statistica «Sessioni svolte» ora mostra il conteggio, non una seconda percentuale. Nessuna metrica inventata. La logica di allenamento rimane invariata.
