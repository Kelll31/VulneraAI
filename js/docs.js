// VulneraAI Documentation Module
// Advanced documentation system with JSON loading and search

(function () {
    'use strict';

    class DocumentationManager {
        constructor() {
            this.docsData = null;
            this.currentArticle = null;
            this.searchIndex = [];
            this.isLoading = false;
        }

        // Инициализация системы документации
        async initialize() {
            console.log('Documentation: Initializing...');

            try {
                this.showLoading();
                await this.loadDocumentation();
                this.buildSearchIndex();
                this.renderNavigation();
                this.setupEventListeners();
                this.showWelcomePage();
                this.hideLoading();

                console.log('Documentation: Successfully initialized');
            } catch (error) {
                console.error('Documentation: Failed to initialize', error);
                this.showError('Ошибка загрузки документации');
            }
        }

        // Загрузка данных документации из внешнего JSON файла
        async loadDocumentation() {
            try {
                console.log('Загружаем документацию из папки docs/...');

                // Пытаемся загрузить файл со списком документации
                let docFiles = [];

                try {
                    const indexResponse = await fetch('./docs/index.json');
                    if (indexResponse.ok) {
                        const indexData = await indexResponse.json();
                        docFiles = indexData.files || indexData.documentation || [];
                        console.log('Список файлов загружен из index.json:', docFiles);
                    }
                } catch {
                    // Fallback к предопределенному списку
                    docFiles = [
                        'introduction.json',
                        'architecture.json',
                        'user-guide.json',
                        'api.json',
                        'pricing.json',
                        'support.json'
                    ];
                    console.log('Используем предопределенный список файлов');
                }

                // Инициализируем структуру данных
                this.docsData = {
                    title: "VulneraAI Documentation",
                    version: "1.0.0",
                    sections: []
                };

                // Загружаем файлы параллельно для скорости
                const loadPromises = docFiles.map(async (fileName) => {
                    try {
                        const url = `./docs/${fileName}`;
                        const response = await fetch(url);

                        if (!response.ok) {
                            console.warn(`Файл ${fileName} недоступен (${response.status})`);
                            return null;
                        }

                        const fileData = await response.json();
                        return { fileName, data: fileData };

                    } catch (error) {
                        console.error(`Ошибка загрузки ${fileName}:`, error.message);
                        return null;
                    }
                });

                // Ждем завершения всех загрузок
                const results = await Promise.all(loadPromises);

                // Обрабатываем результаты
                let loadedFiles = 0;
                for (const result of results) {
                    if (!result) continue;

                    const { fileName, data } = result;

                    if (data.sections && Array.isArray(data.sections)) {
                        this.docsData.sections.push(...data.sections);
                        loadedFiles++;
                    } else if (data.section) {
                        this.docsData.sections.push(data.section);
                        loadedFiles++;
                    } else if (data.id && data.title) {
                        this.docsData.sections.push(data);
                        loadedFiles++;
                    } else {
                        console.warn(`Неизвестный формат файла ${fileName}`);
                    }
                }

                if (this.docsData.sections.length === 0) {
                    throw new Error('Не удалось загрузить ни одной секции документации');
                }

                // Сортируем секции
                this.docsData.sections.sort((a, b) => (a.order || 999) - (b.order || 999));

                console.log(`✅ Документация загружена: ${loadedFiles}/${docFiles.length} файлов, ${this.docsData.sections.length} разделов`);

            } catch (error) {
                console.error('Критическая ошибка загрузки документации:', error);
                throw new Error(`Ошибка загрузки документации: ${error.message}`);
            }
        }



        // Построение поискового индекса
        buildSearchIndex() {
            this.searchIndex = [];

            this.docsData.sections.forEach(section => {
                section.articles.forEach(article => {
                    // Индексируем заголовок и описание
                    this.searchIndex.push({
                        id: article.id,
                        title: article.title,
                        description: article.description,
                        section: section.title,
                        content: this.extractTextContent(article.content),
                        url: `#${section.id}/${article.id}`
                    });
                });
            });
        }

        // Извлечение текстового контента для поиска
        extractTextContent(content) {
            return content.map(block => {
                switch (block.type) {
                    case 'paragraph':
                    case 'heading':
                        return block.text;
                    case 'list':
                        return block.items.join(' ');
                    case 'code':
                        return block.code;
                    default:
                        return '';
                }
            }).join(' ').toLowerCase();
        }

        // Отрисовка навигации
        renderNavigation() {
            const navContainer = document.querySelector('.docs-nav');
            if (!navContainer) return;

            navContainer.innerHTML = `
                <div class="docs-search">
                    <input type="text" 
                           placeholder="Поиск в документации..." 
                           class="docs-search-input"
                           id="docs-search">
                    <div class="docs-search-results" id="docs-search-results"></div>
                </div>
                
                <div class="docs-nav-sections">
                    ${this.docsData.sections.map(section => this.renderNavSection(section)).join('')}
                </div>
            `;
        }

        // Отрисовка секции навигации
        renderNavSection(section) {
            return `
                <div class="docs-nav-section" data-section="${section.id}">
                    <h3 class="docs-nav-title">
                        <span class="docs-nav-icon">${section.icon}</span>
                        ${section.title}
                    </h3>
                    <ul class="docs-nav-list">
                        ${section.articles.map(article => `
                            <li>
                                <a href="#${section.id}/${article.id}" 
                                   class="docs-nav-link" 
                                   data-article="${article.id}"
                                   data-section="${section.id}">
                                    <span class="article-title">${article.title}</span>
                                    <span class="article-description">${article.description}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Отображение статьи
        showArticle(sectionId, articleId) {
            const section = this.docsData.sections.find(s => s.id === sectionId);
            if (!section) return;

            const article = section.articles.find(a => a.id === articleId);
            if (!article) return;

            this.currentArticle = article;
            this.renderArticle(article, section);
            this.updateNavigation(sectionId, articleId);
        }

        // Отрисовка статьи
        renderArticle(article, section) {
            const contentContainer = document.querySelector('.docs-content');
            if (!contentContainer) return;

            const contentHtml = article.content.map(block => this.renderContentBlock(block)).join('');

            contentContainer.innerHTML = `
                <div class="docs-article">
                    <div class="docs-breadcrumb">
                        <span>${section.title}</span>
                        <span class="separator">›</span>
                        <span>${article.title}</span>
                    </div>
                    
                    <header class="docs-article-header">
                        <h1>${article.title}</h1>
                        <p class="docs-article-description">${article.description}</p>
                    </header>
                    
                    <div class="docs-article-content">
                        ${contentHtml}
                    </div>
                    
                    <footer class="docs-article-footer">
                        <div class="article-navigation">
                            ${this.renderArticleNavigation(section, article)}
                        </div>
                        
                        <div class="article-meta">
                            <p>Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}</p>
                        </div>
                    </footer>
                </div>
            `;

            // Подсветка кода
            this.highlightCode();
        }

        // Отрисовка блока контента
        renderContentBlock(block) {
            switch (block.type) {
                case 'heading':
                    const level = block.level || 2;
                    const id = this.slugify(block.text);
                    return `
                        <h${level} id="${id}" class="docs-heading">
                            <a href="#${id}" class="header-anchor">#</a>
                            ${block.text}
                        </h${level}>
                    `;

                case 'paragraph':
                    return `<p class="docs-paragraph">${this.parseMarkdown(block.text)}</p>`;

                case 'list':
                    const items = block.items.map(item => `<li>${this.parseMarkdown(item)}</li>`).join('');
                    return `<ul class="docs-list">${items}</ul>`;

                case 'code':
                    return `
                        <div class="docs-code-block">
                            ${block.title ? `<div class="code-title">${block.title}</div>` : ''}
                            <pre><code class="language-${block.language || 'text'}">${this.escapeHtml(block.code)}</code></pre>
                        </div>
                    `;

                case 'alert':
                    return `
                        <div class="docs-alert docs-alert--${block.variant || 'info'}">
                            <div class="alert-content">${this.parseMarkdown(block.text)}</div>
                        </div>
                    `;

                case 'table':
                    const headerRow = `<tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
                    const bodyRows = block.rows.map(row =>
                        `<tr>${row.map(cell => `<td>${this.parseMarkdown(cell)}</td>`).join('')}</tr>`
                    ).join('');
                    return `
                        <div class="docs-table-wrapper">
                            <table class="docs-table">
                                <thead>${headerRow}</thead>
                                <tbody>${bodyRows}</tbody>
                            </table>
                        </div>
                    `;

                case 'image':
                    return `
                        <figure class="docs-image">
                            <img src="${block.src}" alt="${block.alt || ''}" loading="lazy">
                            ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                        </figure>
                    `;

                case 'features':
                    const featuresHtml = block.items.map(feature => `
                        <div class="feature-item">
                            <h4>${feature.title}</h4>
                            <p>${feature.description}</p>
                        </div>
                    `).join('');
                    return `<div class="docs-features">${featuresHtml}</div>`;

                default:
                    return '';
            }
        }

        // Навигация между статьями
        renderArticleNavigation(section, currentArticle) {
            const currentIndex = section.articles.findIndex(a => a.id === currentArticle.id);
            const prevArticle = currentIndex > 0 ? section.articles[currentIndex - 1] : null;
            const nextArticle = currentIndex < section.articles.length - 1 ? section.articles[currentIndex + 1] : null;

            return `
                <div class="article-nav">
                    ${prevArticle ? `
                        <a href="#${section.id}/${prevArticle.id}" class="nav-link nav-prev">
                            <span class="nav-label">← Предыдущая</span>
                            <span class="nav-title">${prevArticle.title}</span>
                        </a>
                    ` : '<div></div>'}
                    
                    ${nextArticle ? `
                        <a href="#${section.id}/${nextArticle.id}" class="nav-link nav-next">
                            <span class="nav-label">Следующая →</span>
                            <span class="nav-title">${nextArticle.title}</span>
                        </a>
                    ` : '<div></div>'}
                </div>
            `;
        }

        // Обновление активной навигации
        updateNavigation(sectionId, articleId) {
            // Удаляем активные классы
            document.querySelectorAll('.docs-nav-link').forEach(link => {
                link.classList.remove('active');
            });

            // Добавляем активный класс
            const activeLink = document.querySelector(`[data-section="${sectionId}"][data-article="${articleId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Показать приветственную страницу
        showWelcomePage() {
            const contentContainer = document.querySelector('.docs-content');
            if (!contentContainer) return;

            contentContainer.innerHTML = `
                <div class="docs-welcome">
                    <div class="welcome-header">
                        <h1>📚 Добро пожаловать в документацию VulneraAI</h1>
                        <p class="welcome-subtitle">Полное руководство по использованию системы автоматизированного пентестинга</p>
                    </div>
                    
                    <div class="welcome-grid">
                        ${this.docsData.sections.map(section => `
                            <div class="welcome-card">
                                <div class="card-icon">${section.icon}</div>
                                <h3>${section.title}</h3>
                                <p>Изучите ${section.articles.length} статей в этом разделе</p>
                                <div class="card-articles">
                                    ${section.articles.slice(0, 3).map(article => `
                                        <a href="#${section.id}/${article.id}" class="article-link">
                                            ${article.title}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="welcome-footer">
                        <div class="quick-links">
                            <h3>🚀 Быстрые ссылки</h3>
                            <div class="links-grid">
                                <a href="#introduction/getting-started" class="quick-link">Быстрый старт</a>
                                <a href="#architecture/system-overview" class="quick-link">Архитектура</a>
                                <a href="#api/api-overview" class="quick-link">API Reference</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Поиск по документации
        performSearch(query) {
            if (!query.trim()) {
                document.getElementById('docs-search-results').innerHTML = '';
                return;
            }

            const results = this.searchIndex.filter(item => {
                const searchText = `${item.title} ${item.description} ${item.content}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            }).slice(0, 5);

            const resultsHtml = results.map(result => `
                <a href="${result.url}" class="search-result">
                    <div class="result-title">${this.highlightText(result.title, query)}</div>
                    <div class="result-section">${result.section}</div>
                    <div class="result-description">${this.highlightText(result.description, query)}</div>
                </a>
            `).join('');

            document.getElementById('docs-search-results').innerHTML = resultsHtml;
        }

        // Настройка обработчиков событий
        setupEventListeners() {
            // Навигация по ссылкам
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    e.preventDefault();
                    const hash = link.getAttribute('href').substring(1);
                    this.handleNavigation(hash);
                }
            });

            // Поиск
            const searchInput = document.getElementById('docs-search');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.performSearch(e.target.value);
                    }, 300);
                });

                // Скрытие результатов поиска при клике вне
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.docs-search')) {
                        document.getElementById('docs-search-results').innerHTML = '';
                    }
                });
            }

            // Обработка изменений в URL
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.substring(1);
                this.handleNavigation(hash);
            });
        }

        // Обработка навигации
        handleNavigation(hash) {
            if (!hash) {
                this.showWelcomePage();
                return;
            }

            const [sectionId, articleId] = hash.split('/');
            if (sectionId && articleId) {
                this.showArticle(sectionId, articleId);
                window.location.hash = hash;
            }
        }

        // Утилиты
        parseMarkdown(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        slugify(text) {
            return text.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
        }

        highlightText(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        highlightCode() {
            // Здесь можно подключить библиотеку подсветки синтаксиса, например Prism.js
            document.querySelectorAll('pre code').forEach((block) => {
                // Prism.highlightElement(block);
            });
        }

        showLoading() {
            const container = document.querySelector('.docs-content');
            if (container) {
                container.innerHTML = `
                    <div class="docs-loading">
                        <div class="loading-spinner"></div>
                        <p>Загрузка документации...</p>
                    </div>
                `;
            }
        }

        hideLoading() {
            // Загрузка скрыта автоматически при отрисовке контента
        }

        showError(message) {
            const container = document.querySelector('.docs-content');
            if (container) {
                container.innerHTML = `
                    <div class="docs-error">
                        <h2>❌ Ошибка</h2>
                        <p>${message}</p>
                        <button onclick="location.reload()" class="btn btn--primary">Попробовать снова</button>
                    </div>
                `;
            }
        }
    }

    // Глобальный экземпляр менеджера документации
    window.docsManager = new DocumentationManager();

    // Автоинициализация при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.docsManager.initialize();
        });
    } else {
        window.docsManager.initialize();
    }

})();
