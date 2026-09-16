/* ===================================================================
   ALARAN OLUWATUMININU | PORTFOLIO INTERACTION ENGINE
   Awwwards-Class GSAP Animations, Theme Toggle & Cinema Player
   =================================================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ==========================================
// 1. THEME TOGGLE (LIGHT & DARK THEMES)
// ==========================================
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const themeLabel = document.querySelector('.theme-label');

// Initialize saved theme or system preference
const savedTheme = localStorage.getItem('tumi_theme') || 'dark';
setTheme(savedTheme);

function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('tumi_theme', theme);
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Smooth transition effect
        gsap.to('body', {
            opacity: 0.85,
            duration: 0.15,
            onComplete: () => {
                setTheme(newTheme);
                gsap.to('body', { opacity: 1, duration: 0.25 });
            }
        });
    });
}

// ==========================================
// 2. AMBIENT BACKGROUND CANVAS
// ==========================================
const canvas = document.getElementById('ambientCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 28 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.4 + 0.1
    }));

    function renderAmbient() {
        ctx.clearRect(0, 0, width, height);
        const isDark = htmlEl.getAttribute('data-theme') !== 'light';
        const particleColor = isDark ? '212, 175, 55' : '176, 130, 24';

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(renderAmbient);
    }
    renderAmbient();
}

// ==========================================
// 3. PRELOADER & ENTRANCE SEQUENCE
// ==========================================
const preloader = document.querySelector('.preloader');
const preloaderChars = document.querySelectorAll('.preloader-char');
const preloaderProgress = document.querySelector('.preloader-progress');
const preloaderCounter = document.querySelector('.preloader-counter');

document.body.classList.add('loading');

// Animate preloader characters in
gsap.to(preloaderChars, {
    y: 0,
    rotate: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.08,
    ease: "power4.out",
    delay: 0.1
});

let loadPercent = 0;
const loaderTimer = setInterval(() => {
    loadPercent += Math.floor(Math.random() * 16) + 4;
    if (loadPercent >= 100) {
        loadPercent = 100;
        clearInterval(loaderTimer);
        setTimeout(dismissPreloader, 350);
    }
    if (preloaderProgress) preloaderProgress.style.width = loadPercent + '%';
    if (preloaderCounter) preloaderCounter.textContent = loadPercent + '%';
}, 70);

function dismissPreloader() {
    const tl = gsap.timeline({
        onComplete: () => {
            if (preloader) preloader.style.display = 'none';
            document.body.classList.remove('loading');
            startHeroAnimation();
        }
    });

    tl.to(preloaderChars, {
        y: -100,
        opacity: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: "power3.in"
    })
    .to(preloader, {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut"
    }, "-=0.2");
}

// ==========================================
// 4. CUSTOM DUAL CURSOR
// ==========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
        gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.08, ease: "power2.out" });
    }
});

function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    if (cursorRing) {
        gsap.set(cursorRing, { x: ringX, y: ringY });
    }
    requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

// Hover interactions
const hoverTargets = document.querySelectorAll('a, button, .magnetic-btn, .filter-btn, .cinema-play-circle, .theme-toggle');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing && cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => {
        if (cursorRing) {
            cursorRing.classList.remove('hover');
            cursorRing.classList.remove('video-hover');
        }
    });
});

const portfolioCards = document.querySelectorAll('.portfolio-item');
portfolioCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        if (cursorRing) {
            cursorRing.classList.add('video-hover');
            cursorRing.classList.remove('hover');
        }
    });
    card.addEventListener('mouseleave', () => {
        if (cursorRing) cursorRing.classList.remove('video-hover');
    });
});

// ==========================================
// 5. MAGNETIC BUTTON EFFECT
// ==========================================
const magneticElements = document.querySelectorAll('.magnetic-btn');
magneticElements.forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const bounds = item.getBoundingClientRect();
        const deltaX = e.clientX - bounds.left - bounds.width / 2;
        const deltaY = e.clientY - bounds.top - bounds.height / 2;
        gsap.to(item, {
            x: deltaX * 0.35,
            y: deltaY * 0.35,
            duration: 0.35,
            ease: "power2.out"
        });
    });
    item.addEventListener('mouseleave', () => {
        gsap.to(item, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// ==========================================
// 6. HERO SECTION ENTRANCE & PARALLAX
// ==========================================
function startHeroAnimation() {
    const heroTl = gsap.timeline();

    heroTl.to('.hero-eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    })
    .to('.hero-title .char-wrap', {
        y: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.035,
        ease: "power4.out"
    }, "-=0.5")
    .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out"
    }, "-=0.6")
    .to('.hero-subtext', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.6")
    .to('.hero-actions', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.5")
    .to('.scroll-cta', {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.4");
}

// Parallax on hero image
gsap.to('.parallax-bg', {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6
    }
});

// ==========================================
// 7. NAVBAR SCROLL DYNAMICS
// ==========================================
const navbar = document.querySelector('.navbar');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Scrolled styling (blur & border)
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Hide on scroll down, reveal on scroll up
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        gsap.to(navbar, { y: -110, duration: 0.35, ease: "power2.out" });
    } else {
        gsap.to(navbar, { y: 0, duration: 0.35, ease: "power2.out" });
    }
    lastScrollY = currentScrollY;
});

// ==========================================
// 8. PORTFOLIO VIDEO HOVER & EXPAND MODAL
// ==========================================
const cinemaModal = document.getElementById('cinemaModal');
const modalVideo = document.getElementById('modalVideo');
const modalTitle = document.getElementById('modalTitle');
const modalRole = document.getElementById('modalRole');
const modalDesc = document.getElementById('modalDesc');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBackdrop = document.getElementById('modalBackdrop');

portfolioCards.forEach(card => {
    const video = card.querySelector('video');

    // Hover-to-preview
    if (video) {
        card.addEventListener('mouseenter', () => {
            video.currentTime = 0;
            video.play().catch(() => {});
        });

        card.addEventListener('mouseleave', () => {
            video.pause();
        });
    }

    // Click to open fullscreen cinema
    card.addEventListener('click', () => {
        const videoSrc = card.getAttribute('data-video');
        const title = card.getAttribute('data-title');
        const role = card.getAttribute('data-role');
        const desc = card.getAttribute('data-desc');

        if (modalVideo && videoSrc) {
            modalVideo.src = videoSrc;
            modalTitle.textContent = title;
            modalRole.textContent = role;
            modalDesc.textContent = desc;

            cinemaModal.classList.add('active');
            cinemaModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            modalVideo.play().catch(() => {});
        }
    });
});

function closeCinema() {
    if (cinemaModal) {
        cinemaModal.classList.remove('active');
        cinemaModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
        }
    }
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCinema);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeCinema);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cinemaModal.classList.contains('active')) {
        closeCinema();
    }
});

// ==========================================
// 9. FILTERING CATEGORIES
// ==========================================
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (filter === 'all' || cardCat === filter) {
                gsap.to(card, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.45,
                    display: 'flex',
                    ease: "power2.out"
                });
            } else {
                gsap.to(card, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.35,
                    display: 'none',
                    ease: "power2.in"
                });
            }
        });
    });
});

// ==========================================
// 10. CLIENT SPOTLIGHT VLOG VIDEO
// ==========================================
const clientVlogVideo = document.getElementById('clientVlogVideo');
const spotlightPlayBtn = document.getElementById('spotlightPlayBtn');

if (spotlightPlayBtn && clientVlogVideo) {
    spotlightPlayBtn.addEventListener('click', () => {
        clientVlogVideo.play();
        spotlightPlayBtn.classList.add('hidden');
    });

    clientVlogVideo.addEventListener('pause', () => {
        spotlightPlayBtn.classList.remove('hidden');
    });

    clientVlogVideo.addEventListener('play', () => {
        spotlightPlayBtn.classList.add('hidden');
    });
}

// ==========================================
// 11. SCROLL TRIGGER REVEALS
// ==========================================
// Titles
document.querySelectorAll('.split-text').forEach(el => {
    gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true
        }
    });
});

// Upward reveals
document.querySelectorAll('.reveal-up').forEach((el, index) => {
    gsap.from(el, {
        y: 45,
        opacity: 0,
        duration: 0.85,
        delay: (index % 4) * 0.08,
        ease: "power3.out",
        scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true
        }
    });
});

// Portfolio item entrances
gsap.from('.portfolio-item', {
    y: 70,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
        trigger: '.portfolio-grid',
        start: "top 82%",
        once: true
    }
});

// About image mask reveal
gsap.to('.img-reveal-mask', {
    scaleY: 0,
    duration: 1.2,
    ease: "power4.inOut",
    scrollTrigger: {
        trigger: '.about-img-frame',
        start: "top 75%",
        once: true
    }
});

// Animated Counter values
document.querySelectorAll('.counter').forEach(counter => {
    const targetValue = parseInt(counter.getAttribute('data-target'), 10);
    ScrollTrigger.create({
        trigger: counter,
        start: "top 90%",
        once: true,
        onEnter: () => {
            gsap.to(counter, {
                innerHTML: targetValue,
                duration: 2.2,
                snap: { innerHTML: 1 },
                ease: "power2.out"
            });
        }
    });
});

// ==========================================
// 12. MOBILE MENU
// ==========================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function closeMobileMenu() {
    if (hamburger) hamburger.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';

        if (mobileMenu.classList.contains('active')) {
            gsap.fromTo(mobileLinks, 
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.2 }
            );
        }
    });

    // Mobile link click: close menu then scroll
    mobileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const href = this.getAttribute('href');
            closeMobileMenu();

            // Small delay so the menu animation completes before scroll
            setTimeout(() => {
                const targetEl = document.querySelector(href);
                if (targetEl) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: targetEl, offsetY: 70 },
                        ease: "power3.inOut"
                    });
                }
            }, 150);
        });
    });
}

// ==========================================
// 13. SMOOTH ANCHOR SCROLL (desktop nav links)
// ==========================================
document.querySelectorAll('.nav-links a[href^="#"], .scroll-cta, .hero-actions a[href^="#"], .logo[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const targetEl = document.querySelector(href);
        if (targetEl) {
            e.preventDefault();
            gsap.to(window, {
                duration: 1.1,
                scrollTo: { y: targetEl, offsetY: 70 },
                ease: "power3.inOut"
            });
        }
    });
});

// ==========================================
// 14. CONTACT FORM SUBMISSION
// ==========================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.cta-btn');
        const textSpan = submitBtn.querySelector('.btn-text');
        const originalText = textSpan.textContent;

        textSpan.textContent = 'Inquiry Dispatched ✓';
        submitBtn.style.background = '#4ade80';
        submitBtn.style.color = '#070708';

        setTimeout(() => {
            textSpan.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            contactForm.reset();
        }, 3000);
    });
}
