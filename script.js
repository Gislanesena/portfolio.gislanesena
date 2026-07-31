/* =========================================================
   sena.dev — enhancements
   ========================================================= */

// Tachometer scroll progress
const tachFill = document.getElementById('tachFill');
function updateTach(){
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const total = h.scrollHeight - h.clientHeight;
  const pct = total > 0 ? (scrolled / total) * 100 : 0;
  if (tachFill) tachFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateTach, { passive: true });
updateTach();

// Skip start-lights on subsequent visits within session
if (sessionStorage.getItem('lightsShown') === '1') {
  document.body.classList.add('no-lights');
} else {
  sessionStorage.setItem('lightsShown', '1');
  // Remove overlay from DOM after animation to avoid blocking
  setTimeout(() => {
    const el = document.getElementById('startLights');
    if (el) el.remove();
  }, 5400);
}

// Smooth-scroll offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId === '#' || targetId.length < 2) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('.site-header');
    const offset = (header ? header.offsetHeight : 0) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Reveal on scroll
const revealTargets = document.querySelectorAll(
  '.card, .grid-slot, .highlight-item, .about__content p, .skills-group, .senna-block__inner'
);

revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .55s ease, transform .55s ease';
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => io.observe(el));

// Respect reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
  });
}