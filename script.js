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
function playHeroEnter(){
  const hero = document.querySelector('.hero');
  if (hero) hero.classList.add('hero--enter');
}

if (sessionStorage.getItem('lightsShown') === '1') {
  document.body.classList.add('no-lights');
  requestAnimationFrame(() => requestAnimationFrame(playHeroEnter));
} else {
  sessionStorage.setItem('lightsShown', '1');
  // Remove overlay from DOM after animation to avoid blocking
  setTimeout(() => {
    const el = document.getElementById('startLights');
    if (el) el.remove();
    playHeroEnter();
  }, 5100);
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  playHeroEnter();
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

// Reveal on scroll (skip carousel slides — they stay visible for autoplay)
const revealTargets = document.querySelectorAll(
  '.grid-slot, .about__content p, .skills-group, .senna-block__inner'
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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Respect reduced motion
if (prefersReducedMotion) {
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
  });
}

// Auto-scrolling carousels (projects + highlights + grid mobile)
const MOBILE_CAROUSEL_MQ = window.matchMedia('(max-width: 720px)');

function initCarousel(track, { mobileOnly = false } = {}) {
  let running = false;
  let paused = false;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let halfWidth = 0;
  let rafId = 0;
  let cloneCount = 0;
  const speed = 0.85;
  const cleanups = [];

  const on = (target, type, handler, opts) => {
    target.addEventListener(type, handler, opts);
    cleanups.push(() => target.removeEventListener(type, handler, opts));
  };

  const pause = () => { paused = true; track.classList.add('is-paused'); };
  const resume = () => {
    if (dragging) return;
    paused = false;
    track.classList.remove('is-paused');
  };

  const measure = () => {
    halfWidth = track.scrollWidth / 2;
  };

  const loopScroll = () => {
    if (halfWidth > 0 && track.scrollLeft >= halfWidth) {
      track.scrollLeft -= halfWidth;
    }
  };

  const tick = () => {
    if (!running) return;
    if (!paused && !prefersReducedMotion && !document.hidden) {
      track.scrollLeft += speed;
      loopScroll();
    }
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    paused = false;
    dragging = false;
    moved = false;

    const originals = Array.from(track.children);
    if (originals.length < 2) {
      running = false;
      return;
    }

    originals.forEach(child => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
      track.appendChild(clone);
      cloneCount += 1;
    });

    on(track, 'mouseenter', pause);
    on(track, 'mouseleave', resume);
    on(track, 'focusin', pause);
    on(track, 'focusout', (e) => {
      if (!track.contains(e.relatedTarget)) resume();
    });
    on(track, 'touchstart', pause, { passive: true });
    on(track, 'touchend', () => setTimeout(resume, 900), { passive: true });
    on(track, 'touchcancel', () => setTimeout(resume, 900), { passive: true });

    on(track, 'pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      pause();
      track.setPointerCapture?.(e.pointerId);
    });

    on(track, 'pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      setTimeout(resume, 0);
    };

    on(track, 'pointerup', endDrag);
    on(track, 'pointercancel', endDrag);
    on(track, 'click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    on(track, 'scroll', loopScroll, { passive: true });
    on(window, 'resize', measure);

    requestAnimationFrame(() => {
      measure();
      if (!prefersReducedMotion) rafId = requestAnimationFrame(tick);
    });
  };

  const stop = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    cleanups.splice(0).forEach(fn => fn());
    while (cloneCount > 0 && track.lastElementChild) {
      track.removeChild(track.lastElementChild);
      cloneCount -= 1;
    }
    track.scrollLeft = 0;
    track.classList.remove('is-paused', 'is-dragging');
    paused = false;
    dragging = false;
  };

  const sync = () => {
    if (!mobileOnly || MOBILE_CAROUSEL_MQ.matches) start();
    else stop();
  };

  sync();
  if (mobileOnly) {
    MOBILE_CAROUSEL_MQ.addEventListener('change', sync);
  }
}

document.querySelectorAll('[data-carousel]').forEach(track => initCarousel(track));
document.querySelectorAll('[data-carousel-mobile]').forEach(track => {
  initCarousel(track, { mobileOnly: true });
});