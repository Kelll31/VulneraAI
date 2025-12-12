// VulneraAI Professional Website JavaScript
(function () {
    'use strict';

    // Application state
    let currentPage = 'home';
    let aiBackground = null;
    let isDocsActive = false; // Флаг для отслеживания активности docs

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        console.log('VulneraAI: Initializing professional interface...');
        initializeNavigation();
        initializeContactForm();
        initializeScrollEffects();
        initializeAnimations();
        initializeAIBackground();
        console.log('VulneraAI: Initialization complete');
    });

    // Initialize AI Background once
    function initializeAIBackground() {
        if (!aiBackground && !isMobile()) {
            setTimeout(() => {
                aiBackground = createDynamicAIBackground();
                console.log('VulneraAI: AI Background initialized for all pages');
            }, 500);
        }
    }

    // Enhanced Navigation system with hash support (avoiding docs conflicts)
    function initializeNavigation() {
        // Handle navigation links
        const navLinks = document.querySelectorAll('[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');

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

        // Handle browser back/forward buttons - НО НЕ для документации
        window.addEventListener('hashchange', handleHashChange);

        // Initialize with current state
        initializeFromCurrentState();
    }

    function initializeFromCurrentState() {
        const hash = window.location.hash.slice(1);

        // Если хэш содержит слэш или это документация - передаем управление docs.js
        if (hash.includes('/') || hash === 'documentation' || !hash) {
            if (hash.includes('/')) {
                // Это навигация документации - активируем документы
                navigateToDocumentation();
                return;
            } else if (hash === 'documentation') {
                navigateToDocumentation();
                return;
            } else {
                // Пустой хэш - показываем главную
                navigateToPage('home', false);
                return;
            }
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
        // ИГНОРИРУЕМ hashchange если активны документы
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

        // Показываем страницу документации
        showPage('documentation');

        // Активируем флаг документации
        isDocsActive = true;

        // Управляем футером
        controlFooterVisibility('documentation');

        // Если нет хэша документации, ставим базовый
        if (!window.location.hash || !window.location.hash.includes('/')) {
            window.history.replaceState(null, null, '#documentation');
        }
    }

    function navigateToPage(pageName, updateHash = true) {
        console.log('VulneraAI: Navigating to page:', pageName);

        // Деактивируем флаг документации
        isDocsActive = false;

        // Показываем страницу
        showPage(pageName);

        // Управляем футером в зависимости от страницы
        controlFooterVisibility(pageName);

        // Обновляем хэш если нужно
        if (updateHash && window.location.hash.slice(1) !== pageName) {
            window.history.pushState(null, null, `#${pageName}`);
        }
    }


    function showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            currentPage = pageName;

            // Update navigation
            updateNavigation(pageName);

            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            console.log('VulneraAI: Displayed page:', pageName);
        }
    }

    function updateNavigation(activePage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Contact form functionality
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            console.log('Contact form submitted:', data);

            // Show success message
            showNotification('Сообщение отправлено успешно! Мы свяжемся с вами в ближайшее время.', 'success');

            // Reset form
            this.reset();
        });
    }

    // Scroll effects and animations
    function initializeScrollEffects() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.feature-card, .docs-section, .hero-content');
        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Initialize smooth animations
    function initializeAnimations() {
        // Add smooth hover effects to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add hover effects to feature cards
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

        // Страницы, на которых футер скрывается
        const pagesWithoutFooter = ['architecture', 'documentation'];

        if (pagesWithoutFooter.includes(pageName)) {
            console.log('VulneraAI: Hiding footer for page:', pageName);
            footer.style.display = 'none';
            footer.classList.add('footer--hidden');
            document.body.classList.add('no-footer');
        } else {
            console.log('VulneraAI: Showing footer for page:', pageName);
            footer.style.display = 'block';
            footer.classList.remove('footer--hidden');
            document.body.classList.remove('no-footer');
        }
    }
    
    // ============================================
    // PERSISTENT DYNAMIC AI BACKGROUND
    // ============================================
    function createDynamicAIBackground() {
        // Проверяем, не создан ли уже фон
        const existingCanvas = document.getElementById('ai-background-canvas');
        if (existingCanvas) {
            console.log('VulneraAI: AI Background already exists');
            return {
                destroy: () => {
                    if (existingCanvas.parentNode) {
                        existingCanvas.remove();
                    }
                },
                canvas: existingCanvas
            };
        }

        console.log('VulneraAI: Creating persistent AI background for all pages');

        // Создаем canvas элемент
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
        setTimeout(() => {
            canvas.style.opacity = '0.75';
        }, 200);

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Настройки частиц
        const particlesCount = Math.min(100, Math.floor((width * height) / 18000));
        const maxDistance = 160;
        const particles = [];
        let mouseX = width / 2;
        let mouseY = height / 2;
        let animationId = null;

        // Класс частицы
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
                // Движение частиц
                this.x += this.vx;
                this.y += this.vy;

                // Отражение от границ
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Ограничение позиции
                this.x = Math.max(0, Math.min(width, this.x));
                this.y = Math.max(0, Math.min(height, this.y));

                // Пульсация размера
                this.size = this.baseSize + Math.sin(Date.now() * 0.002 + this.pulsePhase) * 0.4;

                // Очень слабое притягивание к мыши
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 250) {
                    const force = (250 - distance) / 250 * 0.008;
                    this.vx += (dx / distance) * force;
                    this.vy += (dy / distance) * force;
                }

                // Ограничение скорости
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 1.5) {
                    this.vx = (this.vx / speed) * 1.5;
                    this.vy = (this.vy / speed) * 1.5;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;

                // Создаем градиент для свечения
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 5
                );
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

        // Создание частиц
        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < particlesCount; i++) {
                particles.push(new Particle());
            }
        }

        // Соединение близких частиц линиями
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

        // Создание динамического фонового градиента
        function drawBackground() {
            const time = Date.now() * 0.0002;

            // Основной градиент
            const gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) * 0.9
            );
            gradient.addColorStop(0, `rgba(15, 23, 42, ${0.96 + Math.sin(time) * 0.04})`);
            gradient.addColorStop(0.7, 'rgba(10, 10, 25, 0.98)');
            gradient.addColorStop(1, 'rgba(5, 5, 15, 1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Дополнительные световые эффекты
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            // Синее пятно
            const spot1 = ctx.createRadialGradient(
                width * 0.2, height * 0.3, 0,
                width * 0.2, height * 0.3, 350
            );
            spot1.addColorStop(0, `rgba(59, 130, 246, ${0.06 + Math.sin(time * 1.2) * 0.02})`);
            spot1.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = spot1;
            ctx.fillRect(0, 0, width, height);

            // Зеленое пятно
            const spot2 = ctx.createRadialGradient(
                width * 0.8, height * 0.7, 0,
                width * 0.8, height * 0.7, 450
            );
            spot2.addColorStop(0, `rgba(16, 185, 129, ${0.04 + Math.sin(time * 1.8) * 0.02})`);
            spot2.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.fillStyle = spot2;
            ctx.fillRect(0, 0, width, height);

            ctx.restore();
        }

        // Основной цикл анимации
        function animate() {
            if (!canvas || !canvas.parentNode) return;

            ctx.clearRect(0, 0, width, height);
            drawBackground();
            connectParticles();

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationId = requestAnimationFrame(animate);
        }

        // Обработка изменения размера окна
        function handleResize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Пересоздаем частицы с новыми параметрами
            initParticles();
        }

        // Отслеживание мыши для интерактивности
        function handleMouseMove(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        // Настройка обработчиков событий
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousemove', handleMouseMove);

        // Инициализация и запуск
        initParticles();
        animate();

        // Возврат объекта для управления фоном
        return {
            destroy: () => {
                console.log('VulneraAI: Destroying AI background');
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                window.removeEventListener('resize', handleResize);
                document.removeEventListener('mousemove', handleMouseMove);
                if (canvas && canvas.parentNode) {
                    canvas.style.opacity = '0';
                    setTimeout(() => {
                        if (canvas && canvas.parentNode) {
                            canvas.remove();
                        }
                    }, 800);
                }
            },
            canvas: canvas
        };
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    // Performance optimization for mobile
    function isMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Utility functions
    function showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Global functions for HTML onclick handlers
    window.navigateToPage = navigateToPage;
    window.showNotification = showNotification;

})();
