// VulneraAI Professional Website JavaScript
(function () {
    'use strict';

    // Application state
    let currentPage = 'home';
    let aiBackground = null;
    let isDocsActive = false; // оставлено для совместимости логики hashchange

    document.addEventListener('DOMContentLoaded', function () {
        console.log('VulneraAI: Initializing professional interface...');

        injectNotificationStyles();
        initializeNavigation();
        initializeContactForm();
        initializeScrollEffects();
        initializeAnimations();
        initializeAIBackground();

        console.log('VulneraAI: Initialization complete');
    });

    // Initialize AI Background once
    function initializeAIBackground() {
        if (aiBackground) return;
        if (isMobile()) return;

        setTimeout(() => {
            // повторная проверка после timeout
            if (aiBackground) return;
            aiBackground = createDynamicAIBackground();
            if (aiBackground) {
                console.log('VulneraAI: AI Background initialized for all pages');
            }
        }, 500);
    }

    // Enhanced Navigation system with hash support (avoiding docs conflicts)
    function initializeNavigation() {
        // Handle navigation links (header/menu/buttons)
        const navLinks = document.querySelectorAll('[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                if (!targetPage) return;

                console.log('VulneraAI: Clicking on:', targetPage);

                // Для документации - особая обработка
                if (targetPage === 'documentation') {
                    navigateToDocumentation();
                    return;
                }

                // Для остальных страниц - обновляем хэш
                navigateToPage(targetPage, true);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('hashchange', handleHashChange);

        // Initialize with current state
        initializeFromCurrentState();
    }

    function initializeFromCurrentState() {
        const hash = window.location.hash.slice(1);

        // Документация или вложенная навигация документации — редиректим во внешние docs
        if (hash === 'documentation' || hash.includes('/')) {
            navigateToDocumentation();
            return;
        }

        // Пустой хэш - показываем главную
        if (!hash) {
            navigateToPage('home', false);
            return;
        }

        // Проверяем, существует ли страница
        const targetPage = document.getElementById(hash);
        if (targetPage && targetPage.classList.contains('page')) {
            navigateToPage(hash, false);
        } else {
            navigateToPage('home', false);
        }
    }

    function handleHashChange() {
        // На случай старой логики: если docs активны — игнорируем (хотя теперь docs внешние)
        if (isDocsActive) {
            console.log('VulneraAI: Ignoring hash change - docs is active');
            return;
        }

        const hash = window.location.hash.slice(1);
        console.log('VulneraAI: Hash changed to:', hash);

        // Если это документация или навигация документации
        if (hash === 'documentation' || hash.includes('/')) {
            navigateToDocumentation();
            return;
        }

        // Если пустой хэш
        if (!hash) {
            navigateToPage('home', false);
            return;
        }

        // Проверяем, существует ли страница
        const targetPage = document.getElementById(hash);
        if (targetPage && targetPage.classList.contains('page')) {
            navigateToPage(hash, false);
        } else {
            // Неизвестный хэш - перенаправляем на главную
            navigateToPage('home', true);
        }
    }

    function navigateToDocumentation() {
        console.log('VulneraAI: Navigating to documentation');
        isDocsActive = false;

        // Важно: внешний переход не должен ломать текущую страницу.
        // Если хочешь открывать в новой вкладке — замени на window.open(url, '_blank', 'noopener,noreferrer')
        window.location.assign('https://docs.vulneraai.ru');
    }

    function navigateToPage(pageName, updateHash = true) {
        console.log('VulneraAI: Navigating to page:', pageName);

        isDocsActive = false;

        // Показываем страницу
        showPage(pageName);

        // Управляем футером в зависимости от страницы
        controlFooterVisibility(pageName);

        // Обновляем хэш если нужно
        if (updateHash && window.location.hash.slice(1) !== pageName) {
            window.history.pushState(null, '', `#${pageName}`);
        }
    }

    function showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(pageName);
        if (!targetPage) return;

        targetPage.classList.add('active');
        currentPage = pageName;

        // Update navigation
        updateNavigation(pageName);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        console.log('VulneraAI: Displayed page:', pageName);
    }

    function updateNavigation(activePage) {
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === activePage) link.classList.add('active');
            else link.classList.remove('active');
        });
    }

    // Contact form functionality
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            console.log('Contact form submitted:', data);

            showNotification('Сообщение отправлено успешно! Мы свяжемся с вами в ближайшее время.', 'success');
            this.reset();
        });
    }

    // Scroll effects and animations
    function initializeScrollEffects() {
        if (!('IntersectionObserver' in window)) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate-in');
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.feature-card, .docs-section, .hero-content');
        animateElements.forEach(element => observer.observe(element));
    }

    // Initialize smooth animations
    function initializeAnimations() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-2px)';
            });
            button.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });

        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // ============================================
    // FOOTER VISIBILITY CONTROL
    // ============================================
    function controlFooterVisibility(pageName) {
        const footer = document.querySelector('.footer');
        if (!footer) {
            console.warn('VulneraAI: Footer element not found');
            return;
        }

        // ТОЛЬКО на странице архитектуры футер скрывается
        const pagesWithoutFooter = ['architecture'];

        if (pagesWithoutFooter.includes(pageName)) {
            footer.style.display = 'none';
            footer.classList.add('footer--hidden');
            document.body.classList.add('no-footer');
        } else {
            footer.style.display = 'block';
            footer.classList.remove('footer--hidden');
            document.body.classList.remove('no-footer');
        }
    }

    // ============================================
    // PERSISTENT DYNAMIC AI BACKGROUND (НЕ ЛОМАЕМ)
    // ============================================
    function createDynamicAIBackground() {
        // Если уже есть canvas — не создаём второй, иначе начнутся «двойные» анимации
        const existingCanvas = document.getElementById('ai-background-canvas');
        if (existingCanvas) {
            console.log('VulneraAI: AI Background already exists');
            return {
                destroy: () => {
                    if (existingCanvas.parentNode) existingCanvas.remove();
                },
                canvas: existingCanvas
            };
        }

        const canvas = document.createElement('canvas');
        canvas.id = 'ai-background-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1.5s ease-in-out';

        document.body.appendChild(canvas);

        // Плавное появление
        setTimeout(() => { canvas.style.opacity = '0.75'; }, 200);

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
            console.warn('VulneraAI: Canvas 2D context not available');
            canvas.remove();
            return null;
        }

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Настройки частиц
        let particlesCount = Math.min(120, Math.floor((width * height) / 16000));
        let maxDistance = 160;

        const particles = [];
        let mouseX = width / 2;
        let mouseY = height / 2;
        let animationId = null;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.size = Math.random() * 1.8 + 0.8;
                this.baseSize = this.size;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.opacity = Math.random() * 0.4 + 0.3;
            }

            update() {
                // Движение
                this.x += this.vx;
                this.y += this.vy;

                // Отражение от границ
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Ограничение позиции
                this.x = Math.max(0, Math.min(width, this.x));
                this.y = Math.max(0, Math.min(height, this.y));

                // Пульсация
                this.size = this.baseSize + Math.sin(Date.now() * 0.002 + this.pulsePhase) * 0.4;

                // Очень слабое притягивание к мыши
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0.001 && distance < 250) {
                    const force = ((250 - distance) / 250) * 0.008;
                    this.vx += (dx / distance) * force;
                    this.vy += (dy / distance) * force;
                }

                // Ограничение скорости
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const maxSpeed = 1.5;
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;

                const glowRadius = this.size * 5;
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
                gradient.addColorStop(0.4, 'rgba(16, 185, 129, 0.5)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

                ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
                ctx.shadowBlur = 12;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                ctx.restore();
            }
        }

        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < particlesCount; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            ctx.save();

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.25;

                        const gradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity})`);
                        gradient.addColorStop(1, `rgba(16, 185, 129, ${opacity})`);

                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1;
                        ctx.globalAlpha = opacity;

                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            ctx.restore();
        }

        function drawBackground() {
            const time = Date.now() * 0.0002;

            // Основной радиальный градиент
            const baseGradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) * 0.9
            );
            baseGradient.addColorStop(0, `rgba(15, 23, 42, ${0.96 + Math.sin(time) * 0.04})`);
            baseGradient.addColorStop(0.7, 'rgba(10, 10, 25, 0.98)');
            baseGradient.addColorStop(1, 'rgba(5, 5, 15, 1)');

            ctx.fillStyle = baseGradient;
            ctx.fillRect(0, 0, width, height);

            // Дополнительные световые эффекты
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            // Синее пятно
            const spot1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 0, width * 0.2, height * 0.3, 350);
            spot1.addColorStop(0, `rgba(59, 130, 246, ${0.06 + Math.sin(time * 1.2) * 0.02})`);
            spot1.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = spot1;
            ctx.fillRect(0, 0, width, height);

            // Зеленое пятно
            const spot2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 0, width * 0.8, height * 0.7, 450);
            spot2.addColorStop(0, `rgba(16, 185, 129, ${0.04 + Math.sin(time * 1.8) * 0.02})`);
            spot2.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.fillStyle = spot2;
            ctx.fillRect(0, 0, width, height);

            ctx.restore();
        }

        function animate() {
            // Если canvas уже удалили — прекращаем цикл
            if (!canvas || !canvas.parentNode) return;

            ctx.clearRect(0, 0, width, height);

            drawBackground();
            connectParticles();

            for (const p of particles) {
                p.update();
                p.draw();
            }

            animationId = requestAnimationFrame(animate);
        }

        function handleResize() {
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width;
            canvas.height = height;

            // Актуализируем параметры под новое разрешение
            particlesCount = Math.min(120, Math.floor((width * height) / 16000));
            maxDistance = 160;

            initParticles();
        }

        function handleMouseMove(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        // Подписки
        window.addEventListener('resize', handleResize, { passive: true });
        document.addEventListener('mousemove', handleMouseMove, { passive: true });

        initParticles();
        animate();

        return {
            destroy: () => {
                console.log('VulneraAI: Destroying AI background');

                if (animationId) cancelAnimationFrame(animationId);

                window.removeEventListener('resize', handleResize);
                document.removeEventListener('mousemove', handleMouseMove);

                if (canvas && canvas.parentNode) {
                    canvas.style.opacity = '0';
                    setTimeout(() => {
                        if (canvas && canvas.parentNode) canvas.remove();
                    }, 800);
                }
            },
            canvas: canvas
        };
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function isMobile() {
        return window.innerWidth <= 768 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existing = document.querySelectorAll('.notification.vulneraai-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification vulneraai-notification notification--${type}`;
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = String(message);

        document.body.appendChild(notification);

        // Авто-удаление
        window.setTimeout(() => {
            notification.classList.add('is-hiding');
            window.setTimeout(() => {
                if (notification.parentNode) notification.remove();
            }, 300);
        }, 3000);
    }

    function injectNotificationStyles() {
        if (document.getElementById('vulneraai-notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'vulneraai-notification-styles';
        style.textContent = `
@keyframes vul-slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes vul-slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
}
.notification.vulneraai-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: #fff;
  z-index: 10000;
  animation: vul-slideIn 0.3s ease-out;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  max-width: min(520px, calc(100vw - 40px));
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
}
.notification.vulneraai-notification.notification--success { background: #10b981; }
.notification.vulneraai-notification.notification--info { background: #3b82f6; }
.notification.vulneraai-notification.notification--error { background: #ef4444; }

.notification.vulneraai-notification.is-hiding {
  animation: vul-slideOut 0.3s ease-out forwards;
}
    `.trim();

        document.head.appendChild(style);
    }
})();
