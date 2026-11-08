# MASTER-Fit EVOLVE v48 — Attrezzatura e progressione

Avvio: nella cartella del progetto esegui `python -m http.server 8099`, poi apri `http://localhost:8099/index.html`.

- Onboarding: limite massimo in kg per ciascun manubrio, modificabile dal Profilo.
- Sessione React: indica carico totale esterno; per esercizi con manubri il programma controlla il limite totale teorico di due manubri. Verifica sempre quanti manubri usi e il carico montato.
- Coach: progressione individuale +1 ripetizione fino a 15; oltre suggerisce valutazione manuale di serie/varianti. Non inventa dischi o carichi.
- Il programma esistente non viene sovrascritto al cambio di attrezzatura.
- Dati salvati localmente sulla stessa origine e porta. Esporta backup JSON prima di cancellare dati.

Prototipo non validato clinicamente. In presenza di dolore o sintomi neurologici, chiedere valutazione medica prima di esercizi di forza.
