/* ==========================================================================
   DISEÑO Y FE - LABORATORIO ESCOLAR LÓGICA INTERACTIVA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLabBg();
    initHeader();
    initTabs();
    initGalleryStats();
    initScrollReveal();
    initLightbox();
    initCardTilt();
});

/* --------------------------------------------------------------------------
   1. FONDO DE PARTÍCULAS INTERACTIVO (Canvas 2D)
   -------------------------------------------------------------------------- */
function initLabBg() {
    const canvas = document.getElementById('lab-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    const COLORS = [
        'rgba(27,221,184,',  // Teal
        'rgba(167,139,250,', // Purple
        'rgba(251,191,36,',  // Amber
        'rgba(240,171,252,'  // Pink
    ];

    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        col: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.25 + 0.1,
        da: (Math.random() > 0.5 ? 1 : -1) * 0.0015
    }));

    (function loop() {
        ctx.clearRect(0, 0, W, H);
        
        // Efecto degradado sutil
        const grad = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, Math.max(W, H));
        grad.addColorStop(0, '#0c0b1e');
        grad.addColorStop(1, '#06060f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        for (const p of particles) {
            p.x = (p.x + p.vx + W) % W;
            p.y = (p.y + p.vy + H) % H;
            p.alpha = Math.max(0.05, Math.min(0.45, p.alpha + p.da));
            if (p.alpha >= 0.45 || p.alpha <= 0.05) p.da = -p.da;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.col + p.alpha + ')';
            ctx.fill();
        }
        requestAnimationFrame(loop);
    })();
}

/* --------------------------------------------------------------------------
   2. SCROLL DEL HEADER Y MENÚ MÓVIL
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
    }
}

/* --------------------------------------------------------------------------
   3. SISTEMA DE PESTAÑAS (TABS)
   -------------------------------------------------------------------------- */
function initTabs() {
    const tabs = document.querySelectorAll('.lab-tab');
    const panels = document.querySelectorAll('.lab-gallery-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const galleryId = tab.getAttribute('data-gallery');

            // Desactivar todas las pestañas
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });

            // Activar pestaña actual
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Mostrar el panel correspondiente
            panels.forEach(panel => {
                if (panel.id === `panel-${galleryId}`) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });

            // Forzar recálculo para scroll reveal en elementos visibles
            setTimeout(() => {
                window.dispatchEvent(new Event('scroll'));
            }, 50);
        });
    });
}

/* --------------------------------------------------------------------------
   4. ESTADÍSTICAS Y CONTADOR DE FOTOS DILATADAS
   -------------------------------------------------------------------------- */
function initGalleryStats() {
    // Contar imágenes reales en cada galería
    const counts = {
        micro: document.querySelectorAll('#grid-micro .lab-card[data-src]').length,
        bitacora: document.querySelectorAll('#grid-bitacora .lab-card[data-src]').length,
        anatomia: document.querySelectorAll('#grid-anatomia .lab-card[data-src]').length
    };

    // Actualizar badges de pestañas
    const elMicro = document.getElementById('count-micro');
    const elBitacora = document.getElementById('count-bitacora');
    const elAnatomia = document.getElementById('count-anatomia');

    if (elMicro) elMicro.textContent = counts.micro;
    if (elBitacora) elBitacora.textContent = counts.bitacora;
    if (elAnatomia) elAnatomia.textContent = counts.anatomia;

    // Calcular total fotos reales
    const totalPhotos = counts.micro + counts.bitacora + counts.anatomia;
    const photoCounterEl = document.getElementById('photo-count');
    if (photoCounterEl) {
        photoCounterEl.setAttribute('data-target', totalPhotos);
        photoCounterEl.textContent = '0';
    }

    // Animación de incremento numérico para todos los contadores
    const statsNums = document.querySelectorAll('.lab-stat-num');
    statsNums.forEach(numEl => {
        const target = parseInt(numEl.getAttribute('data-target') || '0', 10);
        let current = 0;
        const duration = 1200; // ms
        const stepTime = Math.max(Math.floor(duration / (target || 1)), 30);
        
        const timer = setInterval(() => {
            if (current >= target) {
                numEl.textContent = target;
                clearInterval(timer);
            } else {
                current++;
                numEl.textContent = current;
            }
        }, stepTime);
    });
}

/* --------------------------------------------------------------------------
   5. LIGHTBOX DE IMÁGENES DILATADAS (Bucle de Navegación por Galería)
   -------------------------------------------------------------------------- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const backdrop = document.getElementById('lb-backdrop');
    const lbImg = document.getElementById('lb-img');
    const lbCaption = document.getElementById('lb-caption');
    const btnClose = document.getElementById('lb-close');
    const btnPrev = document.getElementById('lb-prev');
    const btnNext = document.getElementById('lb-next');
    const loader = lightbox ? lightbox.querySelector('.lb-loader') : null;

    if (!lightbox || !backdrop || !lbImg) return;

    let activePhotos = [];
    let currentIndex = -1;

    // Abrir lightbox al hacer clic en tarjeta con data-src
    document.addEventListener('click', e => {
        const card = e.target.closest('.lab-card[data-src]');
        if (!card) return;

        // Obtener todas las fotos reales de la galería del panel activo actual
        const activePanel = card.closest('.lab-gallery-panel');
        if (!activePanel) return;

        activePhotos = Array.from(activePanel.querySelectorAll('.lab-card[data-src]'));
        currentIndex = activePhotos.indexOf(card);

        if (currentIndex !== -1) {
            openLightbox();
            showPhoto(currentIndex);
        }
    });

    function openLightbox() {
        lightbox.removeAttribute('hidden');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden'; // Detener scroll de fondo
    }

    function closeLightbox() {
        lightbox.setAttribute('hidden', '');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        lbImg.classList.remove('loaded');
        lbImg.src = '';
    }

    function showPhoto(idx) {
        if (idx < 0 || idx >= activePhotos.length) return;
        
        lbImg.classList.remove('loaded');
        if (loader) loader.style.opacity = '1';

        const photoCard = activePhotos[idx];
        const src = photoCard.getAttribute('data-src');
        const caption = photoCard.getAttribute('data-caption') || '';

        lbImg.src = src;
        lbCaption.textContent = caption;

        // Mostrar/ocultar botones de navegación si hay solo 1 foto
        if (activePhotos.length <= 1) {
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        } else {
            btnPrev.style.display = 'flex';
            btnNext.style.display = 'flex';
        }
    }

    lbImg.addEventListener('load', () => {
        lbImg.classList.add('loaded');
        if (loader) loader.style.opacity = '0';
    });

    // Eventos de Navegación
    btnPrev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + activePhotos.length) % activePhotos.length;
        showPhoto(currentIndex);
    });

    btnNext.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % activePhotos.length;
        showPhoto(currentIndex);
    });

    // Cerrar
    btnClose.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);

    // Controles por teclado
    document.addEventListener('keydown', e => {
        if (lightbox.hasAttribute('hidden')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight' && activePhotos.length > 1) {
            btnNext.click();
        } else if (e.key === 'ArrowLeft' && activePhotos.length > 1) {
            btnPrev.click();
        }
    });
}

/* --------------------------------------------------------------------------
   6. SCROLL REVEAL EFECTOS
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
    }, { threshold: 0.1 });

    targets.forEach(el => io.observe(el));
}

/* --------------------------------------------------------------------------
   7. MICRO-ANIMACIÓN TILT EN HOVER PARA TARJETAS
   -------------------------------------------------------------------------- */
function initCardTilt() {
    const cards = document.querySelectorAll('.lab-card:not(.lab-placeholder)');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            
            // Rotación 3D sutil para sensación táctil premium
            card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
