/* ============================================
   sound.js — Web Audio API sound effects
   ============================================ */
const SoundFX = (() => {
    let ctx, enabled = true;

    function getCtx() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
        }
        return ctx;
    }

    function isEnabled() {
        const stored = localStorage.getItem('gv_sound');
        if (stored !== null) enabled = stored === 'on';
        return enabled;
    }

    function toggle() {
        enabled = !isEnabled();
        localStorage.setItem('gv_sound', enabled ? 'on' : 'off');
        updateToggleBtn();
        return enabled;
    }

    function updateToggleBtn() {
        const btn = document.getElementById('sound-toggle');
        if (btn) btn.textContent = isEnabled() ? '🔊' : '🔇';
    }

    function playTone(freq, duration, type = 'sine', vol = 0.12) {
        if (!isEnabled()) return;
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + duration);
    }

    function play(name) {
        if (!isEnabled()) return;
        const c = getCtx();
        if (!c) return;

        switch (name) {
            case 'click':
                playTone(800, 0.08, 'square', 0.06);
                break;
            case 'gameStart':
                playTone(523, 0.12, 'sine', 0.1);
                setTimeout(() => playTone(659, 0.12, 'sine', 0.1), 100);
                setTimeout(() => playTone(784, 0.18, 'sine', 0.12), 200);
                break;
            case 'win':
                playTone(523, 0.15, 'sine', 0.1);
                setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 120);
                setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 240);
                setTimeout(() => playTone(1047, 0.3, 'sine', 0.14), 360);
                break;
            case 'correct':
                playTone(880, 0.1, 'sine', 0.08);
                break;
            case 'wrong':
                playTone(220, 0.2, 'square', 0.06);
                break;
        }
    }

    return { play, toggle, isEnabled, updateToggleBtn };
})();
