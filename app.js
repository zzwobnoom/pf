document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const timeLeftDisplay = document.getElementById('time-left');
    const modeLabel = document.getElementById('mode-label');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const circle = document.querySelector('.progress-ring__circle');
    const circleBackground = document.querySelector('.progress-ring__background');
    
    // Settings Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const peSettingGroup = document.getElementById('pe-setting-group');
    const pomoSettingGroup = document.getElementById('pomo-setting-group');
    const peTimeInput = document.getElementById('pe-time');
    const pomoFocusInput = document.getElementById('pomo-focus-time');
    const pomoBreakInput = document.getElementById('pomo-break-time');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Circle Math
    let radius = circle.r.baseVal.value;
    let circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = 0;

    // Timer State
    let currentMode = 'pe'; // 'pe' or 'pomodoro'
    let pomoState = 'focus'; // 'focus' or 'break'
    let timerInterval = null;
    let timeRemaining = 0;
    let totalTime = 0;
    let isRunning = false;

    // Default Times (in seconds)
    const settings = {
        pe: 100 * 60,
        pomoFocus: 25 * 60,
        pomoBreak: 5 * 60
    };

    // Colors
    const colors = {
        pe: '#3b82f6', // blue
        pomoFocus: '#ef4444', // red
        pomoBreak: '#10b981', // green
        stopwatch: '#eab308' // yellow
    };

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    function updateDisplay() {
        timeLeftDisplay.textContent = formatTime(timeRemaining);
        let percent = 0;
        if (currentMode === 'stopwatch') {
            percent = (timeRemaining % 60) / 60 * 100;
        } else {
            percent = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;
        }
        setProgress(percent);
    }

    function updateColors() {
        let color;
        if (currentMode === 'pe') color = colors.pe;
        else if (currentMode === 'pomodoro') {
            color = pomoState === 'focus' ? colors.pomoFocus : colors.pomoBreak;
        } else if (currentMode === 'stopwatch') {
            color = colors.stopwatch;
        }
        document.documentElement.style.setProperty('--ring-color', color);
    }

    function updateRingStyle() {
        if (currentMode === 'pomodoro') {
            radius = 70;
            circle.setAttribute('r', radius);
            circle.setAttribute('stroke-width', '140');
            circle.style.opacity = '0.9';
            
            circleBackground.setAttribute('r', '140');
            circleBackground.setAttribute('fill', 'rgba(0,0,0,0.3)');
            circleBackground.setAttribute('stroke-width', '0');
        } else {
            radius = 140;
            circle.setAttribute('r', radius);
            circle.setAttribute('stroke-width', '8');
            circle.style.opacity = '1';
            
            circleBackground.setAttribute('r', '140');
            circleBackground.setAttribute('fill', 'transparent');
            circleBackground.setAttribute('stroke-width', '8');
        }
        
        circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
    }

    function updateLabels() {
        if (currentMode === 'pe') {
            modeLabel.textContent = '기술사 학습 시간';
        } else if (currentMode === 'pomodoro') {
            modeLabel.textContent = pomoState === 'focus' ? '집중 시간' : '휴식 시간';
        } else if (currentMode === 'stopwatch') {
            modeLabel.textContent = '문제 풀이 스톱워치';
        }
    }

    function initializeTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        document.body.classList.remove('timer-ended');
        
        if (currentMode === 'pe') {
            totalTime = settings.pe;
            timeRemaining = totalTime;
        } else if (currentMode === 'pomodoro') {
            totalTime = pomoState === 'focus' ? settings.pomoFocus : settings.pomoBreak;
            timeRemaining = totalTime;
        } else if (currentMode === 'stopwatch') {
            totalTime = 0;
            timeRemaining = 0;
        }
        
        updateColors();
        updateLabels();
        updateRingStyle();
        updateDisplay();
    }

    function startTimer() {
        if (isRunning) return;
        if (currentMode !== 'stopwatch' && timeRemaining <= 0) initializeTimer(); // Reset if already 0

        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        document.body.classList.remove('timer-ended');

        timerInterval = setInterval(() => {
            if (currentMode === 'stopwatch') {
                timeRemaining++;
                updateDisplay();
            } else {
                timeRemaining--;
                updateDisplay();

                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startBtn.disabled = false;
                    pauseBtn.disabled = true;
                    timerCompleted();
                }
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    function resetTimer() {
        if (currentMode === 'pomodoro') {
            pomoState = 'focus'; // Reset to focus on hard reset
        }
        initializeTimer();
    }

    function timerCompleted() {
        // Visual effect for completion (Pulse background)
        document.body.classList.add('timer-ended');
        timeRemaining = 0;
        updateDisplay();

        if (currentMode === 'pomodoro') {
            // Auto switch state
            pomoState = pomoState === 'focus' ? 'break' : 'focus';
            setTimeout(() => {
                initializeTimer();
                // Keep the visual effect until next start so user knows it finished
                document.body.classList.add('timer-ended');
            }, 3000); // Show effect for 3 seconds before resetting UI to next mode
        }
    }

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentMode = e.target.dataset.mode;
            
            // UI Toggle for Settings
            if (currentMode === 'pe') {
                peSettingGroup.style.display = 'flex';
                pomoSettingGroup.style.display = 'none';
                settingsBtn.style.display = 'inline-block';
            } else if (currentMode === 'pomodoro') {
                peSettingGroup.style.display = 'none';
                pomoSettingGroup.style.display = 'flex';
                settingsBtn.style.display = 'inline-block';
            } else if (currentMode === 'stopwatch') {
                peSettingGroup.style.display = 'none';
                pomoSettingGroup.style.display = 'none';
                settingsBtn.style.display = 'none';
                settingsPanel.classList.add('hidden');
            }
            
            pomoState = 'focus'; // Reset pomodoro state
            initializeTimer();
        });
    });

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    saveSettingsBtn.addEventListener('click', () => {
        let newPe = parseInt(peTimeInput.value);
        let newFocus = parseInt(pomoFocusInput.value);
        let newBreak = parseInt(pomoBreakInput.value);

        if (newPe > 0) settings.pe = newPe * 60;
        if (newFocus > 0) settings.pomoFocus = newFocus * 60;
        if (newBreak > 0) settings.pomoBreak = newBreak * 60;

        settingsPanel.classList.add('hidden');
        initializeTimer();
    });

    // Initial setup
    initializeTimer();
});
