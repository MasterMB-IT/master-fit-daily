# MASTER-Fit DAILY — prototipo Coach IA reale

## Cosa funziona
La scheda Coach è una chat React che invia profilo, check-in, obiettivi e fino a 12 sedute al tuo Worker Cloudflare **solo dopo consenso esplicito**. Le risposte provengono dal modello Gemini, non da testi predefiniti. La chat resta in sessionStorage, non nel database remoto. Non modifica gli allenamenti.

## Attivazione gratuita (quote e disponibilità da verificare)
1. Crea una chiave API Gemini su Google AI Studio; verifica che il tuo account e modello abbiano una quota gratuita.
2. Crea un Cloudflare Worker nel tuo account gratuito, incolla `worker.js` nel suo editor e distribuiscilo.
3. In **Settings → Variables and Secrets** crea due **Secrets**: `GEMINI_API_KEY` (chiave di AI Studio) e `MASTERFIT_ACCESS_TOKEN` (codice personale lungo, casuale, diverso dalla chiave API). Facoltativo: `GEMINI_MODEL` con il nome di un modello effettivamente disponibile per la tua chiave.
4. Copia l’URL HTTPS del Worker. Nella schermata Coach dell’app inserisci URL e codice personale, poi salva.
5. Conferma l’invio dei dati e avvia una conversazione.
6. Per aggiornare GitHub Pages, carica i file dell’app nella radice del repository. **Non caricare `worker.js` con segreti inseriti** (il file fornito non ne contiene); il Worker va distribuito separatamente.

## Limiti importanti
- Non è ancora presente dettatura o conversazione vocale.
- Non è ancora presente memoria conversazionale persistente tra sessioni/dispositivi; il modello legge invece il profilo e lo storico locale allegati a ogni richiesta.
- Non è una chat privata end-to-end: i dati inviati passano per Cloudflare e il provider IA. Evita informazioni mediche sensibili nella beta se non desideri condividerle.
- La chiave API rimane nel Worker. Il codice personale viene conservato nel localStorage del telefono: proteggi il dispositivo.
- Il Worker non implementa ancora limiti di richiesta per utente; usa un token robusto e controlla le quote.
- L’IA può sbagliare: ogni programma va verificato e approvato.
- Nessun file o dato esistente viene cancellato automaticamente. Esegui comunque un backup prima di aggiornare.
