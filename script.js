document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');

    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('href').substring(1);
            const target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Active nav highlight on scroll
    const sections = document.querySelectorAll('section[id], footer[id]');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${entry.target.id}`;
                    link.classList.toggle('active', isActive);
                });
            }
        });
    }, { threshold: 0.35 });
    sections.forEach(s => io.observe(s));

    // Staggered entrance: skill chips
    const chips = document.querySelectorAll('.skill-chip');
    const chipIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const idx = [...chips].indexOf(entry.target);
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, idx * 55);
            chipIO.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    chips.forEach(chip => {
        chip.style.opacity = '0';
        chip.style.transform = 'translateY(10px)';
        chip.style.transition = 'opacity 0.4s ease, transform 0.4s ease, background 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease, color 0.28s ease';
        chipIO.observe(chip);
    });

    // Fade-in: project cards
    const cards = document.querySelectorAll('.card');
    const cardIO = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, i * 80);
            cardIO.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(18px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.28s ease, box-shadow 0.28s ease';
        cardIO.observe(card);
    });

    // Slide-in: highlight items
    const items = document.querySelectorAll('.highlight-item');
    const itemIO = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, i * 100);
            itemIO.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-16px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        itemIO.observe(item);
    });
});