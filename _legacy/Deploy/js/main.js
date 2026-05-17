/* ==========================================================================
   JJ Desserts - Main JS
   ========================================================================== */

// ---------- i18n translations ----------
const translations = {
    es: {
        topBar: "SABOR QUE ENAMORA",
        navHome: "Inicio",
        navMenu: "Menú",
        navAbout: "Nosotros",
        navOrders: "Pedidos",
        navContact: "Contacto",
        heroEyebrow: "POSTRES CASEROS",
        heroTitle1: "Sabor que",
        heroTitle2: "enamora",
        heroSubtitle: "Hechos con los mejores ingredientes y mucho amor.",
        heroCTA: "ORDENAR AHORA",
        ctaTitle: "¿ANTOJO DE ALGO DULCE?",
        ctaSubtitle: "Haz tu pedido ahora",
        ctaCTA: "VER MENÚ",
        value1Title1: "INGREDIENTES",
        value1Title2: "DE CALIDAD",
        value1Text: "Utilizamos los mejores ingredientes para garantizar el sabor perfecto.",
        value2Title1: "HECHO CON",
        value2Title2: "PASIÓN",
        value2Text: "Cada postre es hecho en casa con dedicación y amor.",
        value3Title1: "PERFECTO PARA",
        value3Title2: "CUALQUIER OCASIÓN",
        value3Text: "Cumpleaños, reuniones o simplemente porque sí. Nosotros te ayudamos.",
        newsletterTitle: "SUSCRÍBETE A NUESTROS CORREOS",
        newsletterSubtitle: "Recibe novedades, promociones y más postres que te encantarán.",
        newsletterPlaceholder: "Tu correo electrónico",
        footerTagline: "Hechos con amor, para momentos únicos.",
        footerLinks: "ENLACES RÁPIDOS",
        footerContact: "CONTÁCTANOS",
        footerCopyright: "© 2026 JJ DESSERTS. TODOS LOS DERECHOS RESERVADOS."
    },
    en: {
        topBar: "FLAVOR THAT MAKES YOU FALL IN LOVE",
        navHome: "Home",
        navMenu: "Menu",
        navAbout: "About",
        navOrders: "Orders",
        navContact: "Contact",
        heroEyebrow: "HOMEMADE DESSERTS",
        heroTitle1: "Flavor that",
        heroTitle2: "delights",
        heroSubtitle: "Made with the finest ingredients and lots of love.",
        heroCTA: "ORDER NOW",
        ctaTitle: "CRAVING SOMETHING SWEET?",
        ctaSubtitle: "Place your order now",
        ctaCTA: "VIEW MENU",
        value1Title1: "QUALITY",
        value1Title2: "INGREDIENTS",
        value1Text: "We use the finest ingredients to guarantee the perfect flavor.",
        value2Title1: "MADE WITH",
        value2Title2: "PASSION",
        value2Text: "Every dessert is made at home with dedication and love.",
        value3Title1: "PERFECT FOR",
        value3Title2: "ANY OCCASION",
        value3Text: "Birthdays, gatherings, or simply because. We're here to help.",
        newsletterTitle: "SUBSCRIBE TO OUR EMAILS",
        newsletterSubtitle: "Get news, promotions, and more desserts you'll love.",
        newsletterPlaceholder: "Your email address",
        footerTagline: "Made with love, for unique moments.",
        footerLinks: "QUICK LINKS",
        footerContact: "CONTACT US",
        footerCopyright: "© 2026 JJ DESSERTS. ALL RIGHTS RESERVED."
    }
};

let currentLang = localStorage.getItem('jjdesserts_lang') || 'es';

function applyTranslations(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('jjdesserts_lang', lang);

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Update language switcher UI
    const switcher = document.getElementById('langSwitcher');
    if (switcher) {
        const esEl = switcher.querySelector('.lang-active, .es-label');
        const enEl = switcher.querySelector('.lang-inactive, .en-label');
        // Reset
        switcher.innerHTML = `
            <span class="${lang === 'es' ? 'lang-active' : 'lang-inactive'} es-label">ES</span>
            <span class="lang-sep">/</span>
            <span class="${lang === 'en' ? 'lang-active' : 'lang-inactive'} en-label">EN</span>
        `;
    }
}

// ---------- Language switcher ----------
const langSwitcher = document.getElementById('langSwitcher');
if (langSwitcher) {
    langSwitcher.addEventListener('click', () => {
        const newLang = currentLang === 'es' ? 'en' : 'es';
        applyTranslations(newLang);
    });
}

// Apply saved language on load
applyTranslations(currentLang);

// ---------- Mobile menu ----------
const hamburger = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });
}

// ---------- Hero carousel ----------
const slides = document.querySelectorAll('.carousel-slide');
const currentSlideEl = document.getElementById('currentSlide');
const totalSlidesEl = document.getElementById('totalSlides');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

let currentSlide = 0;
let isPlaying = true;
let carouselInterval = null;

function updateSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    if (currentSlideEl) currentSlideEl.textContent = index + 1;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlide(currentSlide);
}

function startCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = null;
}

if (slides.length > 0) {
    if (totalSlidesEl) totalSlidesEl.textContent = slides.length;
    startCarousel();

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        if (isPlaying) startCarousel();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        if (isPlaying) startCarousel();
    });
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                startCarousel();
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            } else {
                stopCarousel();
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        });
    }
}

// ---------- Newsletter form ----------
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        const message = currentLang === 'es'
            ? `¡Gracias por suscribirte! Pronto recibirás novedades en ${email}`
            : `Thanks for subscribing! You'll soon receive news at ${email}`;
        alert(message);
        newsletterForm.reset();
    });
}

// ---------- Smooth scroll for anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
