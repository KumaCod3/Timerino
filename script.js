document.addEventListener('DOMContentLoaded', () => {
    const stopwatchContainer = document.getElementById('stopwatch-container');
    const timerDisplay = document.getElementById('timer-display');
    const resetButton = document.getElementById('reset-button');

    let timerInterval = null;
    let elapsedTime = 0; // Memorizza il tempo totale trascorso in millisecondi
    let startTime = 0;
    let isRunning = false;

    const LOCAL_STORAGE_KEY_ELAPSED = 'stopwatchElapsedTime';
    const LOCAL_STORAGE_KEY_RUNNING = 'stopwatchIsRunning';
    const LOCAL_STORAGE_KEY_START_TIME = 'stopwatchStartTime';

    // Memorizza il titolo originale della pagina
    const originalPageTitle = document.title;

    // Formatta il tempo da millisecondi a HH:MM:SS
    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000); // 1 ora = 3600000 ms
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);

        return (
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0')
        );
    }

    // Funzione per aggiornare il display del timer e il titolo della scheda
    function updateTimer() {
        const currentTime = Date.now();
        const newElapsedTime = elapsedTime + (currentTime - startTime);
        const formattedTime = formatTime(newElapsedTime); // Formatta il tempo una sola volta

        timerDisplay.textContent = formattedTime; // Aggiorna il display nell'interfaccia
        document.title = formattedTime + ' | Stopwatch'; // Aggiorna il titolo della scheda

        // Salva lo stato ogni secondo per maggiore robustezza
        localStorage.setItem(LOCAL_STORAGE_KEY_ELAPSED, newElapsedTime);
    }

    // Funzione per avviare o fermare il timer
    function toggleTimer() {
        if (isRunning) {
            // Ferma il timer
            clearInterval(timerInterval);
            // Salva il tempo trascorso fino a questo momento
            elapsedTime += Date.now() - startTime;
            localStorage.setItem(LOCAL_STORAGE_KEY_ELAPSED, elapsedTime); // Salva il tempo finale
            localStorage.setItem(LOCAL_STORAGE_KEY_RUNNING, 'false');
            stopwatchContainer.classList.remove('playing');
            stopwatchContainer.classList.add('paused');
            // Riporta il titolo della pagina a quello originale quando si mette in pausa
            document.title = originalPageTitle;
        } else {
            // Avvia il timer
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000); // Aggiorna ogni secondo (1000ms)
            localStorage.setItem(LOCAL_STORAGE_KEY_START_TIME, startTime);
            localStorage.setItem(LOCAL_STORAGE_KEY_RUNNING, 'true');
            stopwatchContainer.classList.remove('paused');
            stopwatchContainer.classList.add('playing');
            // Aggiorna subito il titolo della scheda all'avvio
            updateTimer();
        }
        isRunning = !isRunning;
    }

    // Funzione per resettare il timer
    function resetTimer(event) {
        event.stopPropagation(); // Impedisce al click di attivare anche il toggleTimer

        clearInterval(timerInterval);
        elapsedTime = 0;
        isRunning = false;
        timerDisplay.textContent = formatTime(0);
        stopwatchContainer.classList.remove('playing');
        stopwatchContainer.classList.add('paused');

        // Rimuovi i dati dal localStorage quando si resetta
        localStorage.removeItem(LOCAL_STORAGE_KEY_ELAPSED);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RUNNING);
        localStorage.removeItem(LOCAL_STORAGE_KEY_START_TIME);

        // Riporta il titolo della pagina a quello originale dopo il reset
        document.title = originalPageTitle;
    }

    // Funzione per caricare lo stato del timer dal localStorage all'avvio
    function loadState() {
        const savedElapsedTime = localStorage.getItem(LOCAL_STORAGE_KEY_ELAPSED);
        const savedIsRunning = localStorage.getItem(LOCAL_STORAGE_KEY_RUNNING);
        const savedStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_START_TIME);

        if (savedElapsedTime !== null) {
            elapsedTime = parseInt(savedElapsedTime, 10);
            // Aggiorna il display e il titolo subito dopo aver caricato lo stato iniziale
            timerDisplay.textContent = formatTime(elapsedTime);
            // Non aggiornare il titolo a questo punto a meno che il timer non fosse in esecuzione
        }

        if (savedIsRunning === 'true' && savedStartTime !== null) {
            // Se era in esecuzione, ricalcola elapsedTime basandosi sull'ora di inizio salvata
            startTime = parseInt(savedStartTime, 10);
            const timeSinceLastRun = Date.now() - startTime;
            elapsedTime += timeSinceLastRun;
            // Aggiorna subito il display e il titolo con il tempo ricalcolato
            updateTimer(); // Chiama updateTimer per impostare display e titolo
            
            // Poi riavvia il timer
            isRunning = true;
            timerInterval = setInterval(updateTimer, 1000);
            stopwatchContainer.classList.add('playing');
        } else {
            // Se non era in esecuzione o non ci sono dati di avvio, imposta lo stato a pausa
            stopwatchContainer.classList.add('paused');
            // Assicurati che il titolo sia quello originale se il timer non parte in automatico
            document.title = originalPageTitle;
        }
    }

    // Carica lo stato all'avvio della pagina
    loadState();

    // Aggiungi gli eventi ai pulsanti
    stopwatchContainer.addEventListener('click', toggleTimer);
    resetButton.addEventListener('click', resetTimer);
});