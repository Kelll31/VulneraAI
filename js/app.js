// VulneraAI Professional Website JavaScript
(function () {
    'use strict';

    // Application state
    let currentPage = 'home';
    let aiBackground = null;

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        console.log('VulneraAI: Initializing professional interface...');
        initializeNavigation();
        initializeContactForm();
        initializeScrollEffects();
        initializeAnimations();
        initializeAIBackground(); // Инициализируем фон сразу
        console.log('VulneraAI: Initialization complete');
    });

    // Initialize AI Background once
    function initializeAIBackground() {
        if (!aiBackground && !isMobile()) {
            setTimeout(() => {
                aiBackground = createDynamicAIBackground();
                console.log('VulneraAI: AI Background initialized for all pages');
            }, 500); // Небольшая задержка для плавности
        }
    }

    // Navigation system
    function initializeNavigation() {
        // Handle navigation links
        const navLinks = document.querySelectorAll('[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                navigateToPage(targetPage);
            });
        });

        // Initialize with home page
        navigateToPage('home');
    }

    function navigateToPage(pageName) {
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

            // УБИРАЕМ логику управления фоном - теперь он работает везде
            // Фон создается один раз и остается на всех страницах

            // Update navigation
            updateNavigation(pageName);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log('Navigated to:', pageName);
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
        const particlesCount = Math.min(100, Math.floor((width * height) / 18000)); // Оптимизированное количество
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
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            font-family: var(--font-family-primary);
        `;

        // CSS для анимации
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.innerHTML = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    margin-left: auto;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Автоудаление через 5 секунд
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification && notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Global error handler
    window.addEventListener('error', function (e) {
        console.error('VulneraAI Error:', e.error);
        showNotification('Произошла ошибка. Попробуйте обновить страницу.', 'error');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
        if (aiBackground && aiBackground.destroy) {
            aiBackground.destroy();
        }
    });

    // Expose some functions globally for debugging
    window.VulneraAI = {
        navigateToPage,
        showNotification,
        createBackground: createDynamicAIBackground,
        currentPage: () => currentPage,
        backgroundStatus: () => aiBackground ? 'active' : 'inactive'
    };

    console.log('VulneraAI: App.js loaded successfully');

})();
