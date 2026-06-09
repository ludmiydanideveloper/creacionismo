document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo del Menú Mobile
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mobileMenuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // 2. Control de la Cabecera Scrolled
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // 3. Animación de Fondo en Scroll (Días de la Creación)
    const bgContainer = document.getElementById('timeline-bg-container');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (bgContainer && timelineItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -40% 0px', // Detectar cuando está en la zona central de la pantalla
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const day = entry.target.getAttribute('data-day');
                    
                    // Reset class y asignar nuevo día
                    bgContainer.className = 'timeline-bg';
                    bgContainer.classList.add('day' + day);
                    
                    // Activar item actual en la línea de tiempo
                    timelineItems.forEach(item => item.classList.remove('active'));
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }
});
