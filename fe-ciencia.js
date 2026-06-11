/* ==========================================================================
   FE Y CIENCIA - Lógica Interactiva
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCosmosBg();
    initHeader();
    initFaqAccordion();
    initAskForm();
    initBookCards();
    initScrollReveal();
});

/* --------------------------------------------------------------------------
   1. FONDO DE COSMOS (Canvas 2D Minimalista)
   -------------------------------------------------------------------------- */
function initCosmosBg() {
    const canvas = document.getElementById('cosmos-canvas-fs');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    const COLORS = [
        'rgba(27,221,184,',
        'rgba(167,139,250,',
        'rgba(240,171,252,',
        'rgba(251,191,36,',
        'rgba(255,255,255,'
    ];

    const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        col: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.35 + 0.15,
        da: (Math.random() > 0.5 ? 1 : -1) * 0.002
    }));

    (function loop() {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
            p.x = (p.x + p.vx + W) % W;
            p.y = (p.y + p.vy + H) % H;
            p.alpha = Math.max(0.08, Math.min(0.6, p.alpha + p.da));
            if (p.alpha >= 0.6 || p.alpha <= 0.08) p.da = -p.da;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.col + p.alpha + ')';
            ctx.fill();
        }
        requestAnimationFrame(loop);
    })();
}

/* --------------------------------------------------------------------------
   2. HEADER SCROLL
   -------------------------------------------------------------------------- */
function initHeader() {
    const header = document.querySelector('.main-header');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav    = document.querySelector('.nav-links');

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggle.classList.remove('active');
                    nav.classList.remove('active');
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                toggle.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }
}

/* --------------------------------------------------------------------------
   3. ACORDEÓN FAQ
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(item => {
        const btn    = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Cerrar todos
            items.forEach(other => {
                other.classList.remove('is-open');
                const a = other.querySelector('.faq-answer');
                if (a) a.style.maxHeight = '0';
                const b = other.querySelector('.faq-question');
                if (b) b.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('is-open');
                const inner = answer.querySelector('.faq-answer-inner');
                answer.style.maxHeight = (inner ? inner.scrollHeight : answer.scrollHeight) + 32 + 'px';
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. FORMULARIO DE PREGUNTAS (SUPABASE)
   -------------------------------------------------------------------------- */
function initAskForm() {
    const form     = document.getElementById('ask-form');
    const success  = document.getElementById('ask-success');
    const resetBtn = document.getElementById('ask-reset-btn');
    const submit   = document.getElementById('ask-submit');

    // Inicializar Supabase
    const supabaseUrl = 'https://dgqlvvgdlrofuidxrkxl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncWx2dmdkbHJvZnVpZHhya3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzIxNTMsImV4cCI6MjA5NjcwODE1M30.Gi_AChU4LT_oAGZIeq3FzEE9zqkh6UNCB7JAYVcYU8Y';
    let supabase = null;
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    if (!form || !success) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameEl  = document.getElementById('ask-name');
        const emailEl = document.getElementById('ask-email'); // asumiendo que este es el ID del correo
        const qEl     = document.getElementById('ask-question');

        // Validación mínima
        let valid = true;
        [nameEl, qEl].forEach(el => {
            if (!el || !el.value.trim()) {
                if(el) {
                    el.style.borderColor  = 'rgba(231,76,60,.6)';
                    el.style.boxShadow    = '0 0 0 3px rgba(231,76,60,.1)';
                    setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1800);
                }
                valid = false;
            }
        });
        if (!valid) return;

        // Estado de carga
        if (submit) { submit.disabled = true; submit.textContent = 'Enviando…'; }

        try {
            if (supabase) {
                // Guardar en la base de datos
                const nameVal = nameEl.value.trim();
                const emailVal = emailEl ? emailEl.value.trim() : null;
                const questionVal = qEl.value.trim();

                const { error } = await supabase
                    .from('expert_questions')
                    .insert([{ name: nameVal, email: emailVal, question: questionVal }]);
                    
                if (error) throw error;
            }

            form.reset();
            success.classList.add('visible');
            success.setAttribute('aria-hidden', 'false');
        } catch (err) {
            console.error('Error al enviar pregunta:', err);
            alert('Hubo un error al enviar tu pregunta. Por favor, intenta de nuevo.');
        } finally {
            if (submit) {
                submit.disabled = false;
                submit.innerHTML = 'Enviar al Panel de Expertos <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>';
            }
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            success.classList.remove('visible');
            success.setAttribute('aria-hidden', 'true');
        });
    }
}

/* --------------------------------------------------------------------------
   5. MICRO-ANIMACIÓN TARJETAS DE LIBROS (hover tilt)
   -------------------------------------------------------------------------- */
function initBookCards() {
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const r   = card.getBoundingClientRect();
            const x   = (e.clientX - r.left) / r.width  - 0.5;
            const y   = (e.clientY - r.top)  / r.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* --------------------------------------------------------------------------
   6. SCROLL REVEAL SUAVE
   -------------------------------------------------------------------------- */
function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(el => io.observe(el));
}
