/* ============================================================
   AL-BURHAN — main.js
   Fixes:
   1. Tab IDs for Miracles (scientific/mathematical) were
      colliding with nav section IDs. Renamed content divs to
      use a "m-" prefix (m-scientific-content, etc.) so the
      querySelector never grabs the wrong element.
   2. Horizontal scroll black-flash — handled in CSS by giving
      .horizontal-container an explicit background-color.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── Starfield ───────────────────────────────────────────── */
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let width, height, stars = [], mouse = { x: 0, y: 0 };

function resize() {
    width = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Star {
    constructor() { this.reset(); }
    reset() {
        this.x       = Math.random() * width;
        this.y       = Math.random() * height;
        this.z       = Math.random() * 2 + 0.5;
        this.size    = Math.random() * 1.5;
        this.speed   = Math.random() * 0.2 + 0.05;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkle = Math.random() * Math.PI * 2;
    }
    update() {
        this.y -= this.speed * this.z;
        this.twinkle += 0.02;
        const dx = (mouse.x - width  / 2) * 0.001 * this.z;
        const dy = (mouse.y - height / 2) * 0.001 * this.z;
        this.x -= dx;
        this.y -= dy;
        if (this.y < 0) { this.y = height; this.x = Math.random() * width; }
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
    }
    draw() {
        const alpha = this.opacity * (0.7 + 0.3 * Math.sin(this.twinkle));
        ctx.fillStyle = `rgba(212, 223, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.z * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initStars() {
    stars = [];
    const count = Math.min(400, Math.floor((width * height) / 3000));
    for (let i = 0; i < count; i++) stars.push(new Star());
}

function animateStars() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', () => { resize(); initStars(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize(); initStars(); animateStars();

/* ── Custom Cursor ───────────────────────────────────────── */
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
window.addEventListener('mousemove', e => {
    const posX = e.clientX, posY = e.clientY;
    if (cursorDot)     { cursorDot.style.left = `${posX}px`; cursorDot.style.top = `${posY}px`; }
    if (cursorOutline) {
        cursorOutline.animate(
            { left: `${posX}px`, top: `${posY}px` },
            { duration: 500, fill: 'forwards' }
        );
    }
});

/* ── Hero Animation ──────────────────────────────────────── */
const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
heroTl
    .to('.hero-subtitle',  { opacity: 1, y: 0, duration: 1, delay: 0.5 })
    .to('.hero-title span',{ opacity: 1, y: 0, stagger: 0.2, duration: 1.2 }, '-=0.5')
    .to('.hero-body',      { opacity: 1, y: 0, duration: 1 }, '-=0.8')
    .to('.hero-cta',       { opacity: 1, scale: 1, duration: 0.8 }, '-=0.5')
    .to('.hero-scroll',    { opacity: 0.6, duration: 1 }, '-=0.3')
    .to('.hero-ayah',      { opacity: 0.7, duration: 1.5 }, '-=1');

/* ── Horizontal Scroll ───────────────────────────────────── */
const track = document.getElementById('journeyTrack');
if (track) {
    const cards = track.querySelectorAll('.journey-card');
    gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 100),
        ease: 'none',
        scrollTrigger: {
            trigger: '.horizontal-section',
            start: 'top top',
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

/* ── Reveal Animations ───────────────────────────────────── */
document.querySelectorAll('.reveal').forEach(el => {
    gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });
});

/* ── Counters ────────────────────────────────────────────── */
document.querySelectorAll('.counter-value').forEach(counter => {
    const target    = parseInt(counter.getAttribute('data-target'));
    const increment = target / 125;
    let current = 0;
    ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        onEnter: () => {
            const tick = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(tick);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            tick();
        },
        once: true
    });
});

/* ── Accordion ───────────────────────────────────────────── */
function toggleAccordion(btn) {
    const content = btn.nextElementSibling;
    const arrow   = btn.querySelector('svg');
    const isOpen  = !content.classList.contains('hidden');
    document.querySelectorAll('.accordion-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.scientific-item svg').forEach(s => s.style.transform = 'rotate(0deg)');
    if (!isOpen) {
        content.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
    }
}
window.toggleAccordion = toggleAccordion; // expose to inline onclick

/* ── Progress Bar ────────────────────────────────────────── */
window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('progressBar').style.width = (winScroll / maxScroll) * 100 + '%';
});

/* ── Mobile Menu ─────────────────────────────────────────── */
const menuBtn    = document.getElementById('menuBtn');
const closeMenu  = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn   .addEventListener('click', () => { mobileMenu.classList.remove('hidden'); mobileMenu.classList.add('flex'); });
closeMenu .addEventListener('click', () => { mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('flex'); });
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => { mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('flex'); });
});

/* ── Smooth Scroll ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

/* ── Magnetic Buttons ────────────────────────────────────── */
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width  / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; });
});

/* ── Tab System ──────────────────────────────────────────── */
/*  FIX: The Miracles tab contents used IDs like "scientific-content"
    which collided with the nav anchor <section id="scientific">.
    The HTML has been updated to use "m-scientific-content" etc.
    The initTabs function below uses a prefix param to match.        */
function initTabs(tabContainerId, contentContainerId, contentPrefix) {
    const tabBtns     = document.querySelectorAll(`#${tabContainerId} .tab-btn`);
    const tabContents = document.querySelectorAll(`#${contentContainerId} .tab-content`);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns    .forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(`${contentPrefix}${tabId}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
                // Refresh ScrollTrigger so reveal animations inside tabs work
                setTimeout(() => ScrollTrigger.refresh(), 50);
            }
        });
    });
}

// Christianity tabs — IDs stay as-is (c-{tab}-content)
initTabs('christianity-tabs', 'christianity-content', 'c-');

// Miracles tabs — use "m-" prefix to avoid collisions with nav section IDs
initTabs('miracles-tabs', 'miracles-content', 'm-');
