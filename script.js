// 番茄鐘計時器
class PomodoroTimer {
    constructor() {
        this.totalSeconds = 15 * 60; // 預設15分鐘
        this.remainingSeconds = this.totalSeconds;
        this.isRunning = false;
        this.timerInterval = null;
        this.selectedMinutes = 15;

        this.initElements();
        this.initEventListeners();
        this.updateDisplay();
        this.startClock();
    }

    initElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.progressFill = document.getElementById('progress-fill');
        this.timeButtons = document.querySelectorAll('.time-btn');
        this.currentDate = document.getElementById('current-date');
        this.currentTime = document.getElementById('current-time');
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        this.timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.time);
                this.setTime(minutes);
                this.updateActiveButton(e.target);
            });
        });
    }

    setTime(minutes) {
        if (this.isRunning) {
            this.pause();
        }
        this.selectedMinutes = minutes;
        this.totalSeconds = minutes * 60;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
        this.updateProgress();
    }

    updateActiveButton(clickedBtn) {
        this.timeButtons.forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    reset() {
        this.pause();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
        this.updateProgress();
    }

    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            this.updateDisplay();
            this.updateProgress();
        } else {
            this.pause();
            this.playSound();
            this.showNotification();
            this.remainingSeconds = this.totalSeconds;
            this.updateDisplay();
            this.updateProgress();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        this.timerDisplay.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateProgress() {
        const percentage = (this.remainingSeconds / this.totalSeconds) * 100;
        this.progressFill.style.width = `${percentage}%`;
    }

    playSound() {
        // 使用瀏覽器的音訊API播放提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('番茄鐘時間到！', {
                body: '休息一下吧～',
                icon: '🍅'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('番茄鐘時間到！', {
                        body: '休息一下吧～',
                        icon: '🍅'
                    });
                }
            });
        }

        // 視覺提醒
        this.timerDisplay.style.animation = 'none';
        setTimeout(() => {
            this.timerDisplay.style.animation = 'glow 2s ease-in-out infinite';
        }, 10);
    }

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();

        // 格式化日期 (西元年月日)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        this.currentDate.textContent = `${year}年${month}月${day}日`;

        // 格式化時間 (HH:MM:SS)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.currentTime.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();

    // 請求通知權限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});
