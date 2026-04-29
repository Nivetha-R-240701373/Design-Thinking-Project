/* ============================================
   ui.js — Premium UI Effects
   3D Card Tilt, Animated Counters, Typewriter,
   Page Transitions, Card Shine Effect
   ============================================ */
const UI = (() => {

    /* ---- 3D TILT EFFECT ON GAME CARDS ---- */
    function initCardTilt() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.game-card, .profile-stat-card, .achievement-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                    card.style.transform = '';
                    card.style.setProperty('--shine-x', '-100%');
                    return;
                }
                const rotateX = ((y - rect.height / 2) / rect.height) * -8;
                const rotateY = ((x - rect.width / 2) / rect.width) * 8;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
                // Shine position
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                card.style.setProperty('--shine-x', `${shineX}%`);
                card.style.setProperty('--shine-y', `${shineY}%`);
            });
        });
        document.addEventListener('mouseleave', () => {
            document.querySelectorAll('.game-card, .profile-stat-card, .achievement-card').forEach(c => {
                c.style.transform = '';
            });
        }, true);
    }

    /* ---- ANIMATED NUMBER COUNTERS ---- */
    function initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    animateValue(entry.target);
                }
            });
        }, { threshold: 0.3 });

        requestAnimationFrame(() => {
            document.querySelectorAll('.stat-value, .hero-stat-value').forEach(el => {
                const text = el.textContent.trim();
                // Only animate if it's a number
                const num = parseInt(text.replace(/[^0-9]/g, ''));
                if (!isNaN(num) && num > 0 && text.match(/^\d/)) {
                    el.dataset.target = num;
                    el.dataset.prefix = text.match(/^[^0-9]*/)?.[0] || '';
                    el.dataset.suffix = text.match(/[^0-9]*$/)?.[0] || '';
                    el.textContent = el.dataset.prefix + '0' + el.dataset.suffix;
                    observer.observe(el);
                }
            });
        });
    }

    function animateValue(el) {
        const target = parseInt(el.dataset.target) || 0;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = Math.min(1500, Math.max(500, target * 5));
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = prefix + current + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    /* ---- TYPEWRITER EFFECT ON HERO TAGLINE ---- */
    function initTypewriter() {
        requestAnimationFrame(() => {
            const tagline = document.querySelector('.hero-tagline');
            if (!tagline || tagline.dataset.typed) return;
            tagline.dataset.typed = 'true';
            const text = tagline.textContent;
            tagline.textContent = '';
            tagline.style.opacity = '1';
            tagline.style.borderRight = '2px solid var(--neon-cyan)';
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    tagline.textContent += text[i];
                    i++;
                    setTimeout(type, 60 + Math.random() * 40);
                } else {
                    // Remove cursor after typing
                    setTimeout(() => { tagline.style.borderRight = 'none'; }, 1500);
                }
            };
            setTimeout(type, 800);
        });
    }

    /* ---- SMOOTH PAGE TRANSITIONS ---- */
    function initPageTransitions() {
        const main = document.getElementById('main-content');
        if (!main) return;

        const originalNavigate = window.navigate;
        if (!originalNavigate || main.dataset.transitionsInit) return;
        main.dataset.transitionsInit = 'true';

        // Override navigate to add fade
        // We wrap it to add CSS transitions
        main.style.transition = 'opacity .25s ease, transform .25s ease';
    }

    /* ---- FLOATING PARTICLES ON HOVER ---- */
    function spawnHoverParticles(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        for (let i = 0; i < 3; i++) {
            const spark = document.createElement('div');
            spark.className = 'card-spark';
            spark.style.left = (e.clientX - rect.left) + 'px';
            spark.style.top = (e.clientY - rect.top) + 'px';
            spark.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
            spark.style.setProperty('--dy', (Math.random() - 0.5) * 60 + 'px');
            card.appendChild(spark);
            setTimeout(() => spark.remove(), 600);
        }
    }

    /* ---- INIT ALL ---- */
    function init() {
        initCardTilt();
        initPageTransitions();
        // Counters and typewriter are re-init on each navigate
    }

    function onPageLoad() {
        initCounters();
        initTypewriter();
        // Attach hover particles to game cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.removeEventListener('mouseenter', spawnHoverParticles);
            card.addEventListener('mouseenter', spawnHoverParticles);
        });
    }

    return { init, onPageLoad };
})();
