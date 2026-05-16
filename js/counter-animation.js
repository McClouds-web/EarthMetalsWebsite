document.addEventListener('DOMContentLoaded', () => {
    function animateCounter(el) {
        const targetAttr = el.getAttribute('data-target');
        const target = parseFloat(targetAttr);
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            const decimalPlaces = target % 1 !== 0 ? 1 : 0;
            el.textContent = current.toLocaleString(undefined, { 
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces 
            });
        }, 16);
    }

    const statElements = Array.from(document.querySelectorAll('.stat-number'));
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = statElements.indexOf(entry.target);
                setTimeout(() => {
                    animateCounter(entry.target);
                }, index * 150); // Stagger for left-to-right effect
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statElements.forEach(el => statObserver.observe(el));
});
