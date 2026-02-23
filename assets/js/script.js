/**
 * Galeria de Carros - Main Script
 * Otimizado para performance e manutenibilidade
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais de Cache (Seleção de Elementos) ---
    const dom = {
        prevButton: document.getElementById('prev'),
        nextButton: document.getElementById('next'),
        container: document.querySelector('.conteiner'),
        list: document.querySelector('.conteiner .list'),
        indicators: document.querySelector('.indicators'),
        numberDisplay: document.querySelector('.indicators .number'),
        destaqueSection: document.getElementById('destaque'),
        contatoSection: document.getElementById('contato'),
        smoothLinks: document.querySelectorAll('a[href^="#"]')
    };

    // Fallback seguro se elementos críticos não existirem
    if (!dom.container || !dom.list) return;

    const items = dom.list.querySelectorAll('.item');
    const dots = dom.indicators.querySelectorAll('ul li');
    
    let active = 0;
    const count = items.length;
    let isAnimating = false; // Debounce para evitar cliques rápidos

    // --- Funções do Slider ---

    const updateSlider = (newActive) => {
        // Remove classe active dos elementos antigos
        const oldItem = dom.list.querySelector('.item.active');
        const oldDot = dom.indicators.querySelector('ul li.active');
        
        if(oldItem) oldItem.classList.remove('active');
        if(oldDot) oldDot.classList.remove('active');

        // Atualiza índice
        active = newActive;

        // Adiciona classe active nos novos elementos
        items[active].classList.add('active');
        dots[active].classList.add('active');

        // Atualiza número
        if(dom.numberDisplay) dom.numberDisplay.innerText = '0' + (active + 1);
    };

    const nextSlide = () => {
        if (isAnimating) return;
        isAnimating = true;
        
        dom.list.style.setProperty('--calculation', 1);
        const nextIndex = (active + 1) % count; // Loop circular
        updateSlider(nextIndex);
        
        setTimeout(() => isAnimating = false, 500); // Tempo da transição CSS
    };

    const prevSlide = () => {
        if (isAnimating) return;
        isAnimating = true;

        dom.list.style.setProperty('--calculation', -1);
        const prevIndex = (active - 1 + count) % count; // Loop circular reverso
        updateSlider(prevIndex);

        setTimeout(() => isAnimating = false, 500);
    };

    // Event Listeners dos Botões
    if(dom.nextButton) dom.nextButton.onclick = nextSlide;
    if(dom.prevButton) dom.prevButton.onclick = prevSlide;

    // --- Navegação por Indicadores (Dots) ---
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (active === index || isAnimating) return;
            isAnimating = true;

            const direction = index > active ? 1 : -1;
            dom.list.style.setProperty('--calculation', direction);
            updateSlider(index);

            setTimeout(() => isAnimating = false, 500);
        });
    });

    // --- Navegação por Swipe (Mobile) ---
    let touchStartX = 0;
    
    dom.container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    dom.container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        handleSwipe(touchStartX, touchEndX);
    }, { passive: true });

    function handleSwipe(start, end) {
        const threshold = 50;
        if (end < start - threshold) nextSlide();
        if (end > start + threshold) prevSlide();
    }

    // --- Intersection Observer (Animações ao rolar) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Reduzido para 20% para disparar mais fácil em mobile
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    if (dom.destaqueSection) observer.observe(dom.destaqueSection);
    if (dom.contatoSection) observer.observe(dom.contatoSection);

    // --- Smooth Scroll (Customizado) ---
    // Mantendo implementação JS para controle preciso da duração (800ms)
    // conforme solicitado originalmente, mesmo com CSS scroll-behavior: smooth
    dom.smoothLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const startPosition = window.scrollY;
                // Offset de 100px para header fixo
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - 100;
                const distance = targetPosition - startPosition;
                const duration = 800;
                let startTime = null;

                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }

                // Função Easing: Ease In Out Quad
                function easeInOutQuad(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t + b;
                    t--;
                    return -c / 2 * (t * (t - 2) - 1) + b;
                }

                requestAnimationFrame(animation);
            }
        });
    });
});
