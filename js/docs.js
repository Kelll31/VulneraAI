// VulneraAI Documentation Module - Полностью исправленная версия
(function () {
    'use strict';

    class DocumentationManager {
        constructor() {
            this.docsData = null;
            this.currentArticle = null;
            this.searchIndex = [];
            this.isLoading = false;
            this.expandedSections = new Set();
            this.searchTimeout = null;
        }

        async initialize() {
            console.log('Documentation: Initializing...');
            try {
                this.showLoading();
                await this.loadDocumentation();
                this.buildSearchIndex();
                this.injectStyles();
                this.renderNavigation();
                this.setupEventListeners();
                this.loadInitialArticle();
                this.hideLoading();
                console.log('Documentation: Successfully initialized');
            } catch (error) {
                console.error('Documentation: Failed to initialize', error);
                this.showError('Ошибка загрузки документации');
            }
        }

        async loadDocumentation() {
            try {
                console.log('Загружаем документацию из папки docs/...');

                let docFiles = [];
                try {
                    const indexResponse = await fetch('./docs/index.json');
                    if (indexResponse.ok) {
                        const indexData = await indexResponse.json();
                        docFiles = indexData.files || indexData.documentation || [];
                        console.log('Список файлов загружен из index.json:', docFiles);
                    }
                } catch {
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

                this.docsData = {
                    title: "VulneraAI Documentation",
                    version: "1.0.0",
                    sections: []
                };

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

                const results = await Promise.all(loadPromises);
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

                this.docsData.sections.sort((a, b) => (a.order || 999) - (b.order || 999));
                console.log(`✅ Документация загружена: ${loadedFiles}/${docFiles.length} файлов, ${this.docsData.sections.length} разделов`);

            } catch (error) {
                console.error('Критическая ошибка загрузки документации:', error);
                throw new Error(`Ошибка загрузки документации: ${error.message}`);
            }
        }

        buildSearchIndex() {
            this.searchIndex = [];
            this.docsData.sections.forEach(section => {
                section.articles?.forEach(article => {
                    const content = this.extractTextContent(article.content);
                    this.searchIndex.push({
                        id: article.id,
                        title: article.title,
                        description: article.description || '',
                        section: section.title,
                        sectionId: section.id,
                        content: content,
                        url: `#${section.id}/${article.id}`,
                        searchableText: `${article.title} ${article.description || ''} ${content}`.toLowerCase()
                    });
                });
            });
        }

        extractTextContent(content) {
            if (!content) return '';
            return content.map(block => {
                switch (block.type) {
                    case 'paragraph':
                    case 'heading':
                        return block.text || '';
                    case 'list':
                        return (block.items || []).join(' ');
                    case 'code':
                        return block.code || '';
                    case 'table':
                        return (block.rows || []).flat().join(' ');
                    default:
                        return '';
                }
            }).join(' ').toLowerCase();
        }

        injectStyles() {
            if (document.getElementById('docs-enhanced-styles')) return;

            const styles = `
                <style id="docs-enhanced-styles">
                    /* Исправляем скролл в навигации */
                    .docs-nav {
                        max-height: calc(100vh - 120px);
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding-right: 8px;
                        scrollbar-width: thin;
                        scrollbar-color: rgba(150, 150, 150, 0.5) transparent;
                    }
                    
                    .docs-nav::-webkit-scrollbar {
                        width: 8px;
                    }
                    
                    .docs-nav::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    .docs-nav::-webkit-scrollbar-thumb {
                        background-color: rgba(150, 150, 150, 0.5);
                        border-radius: 4px;
                    }
                    
                    /* Контейнер поиска */
                    .search-container {
                        position: relative;
                        margin-bottom: 20px;
                        z-index: 1000;
                    }
                    
                    .search-input {
                        width: 100%;
                        padding: 12px 16px 12px 40px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        background: rgba(0, 0, 0, 0.3);
                        color: #e5e7eb;
                        font-size: 14px;
                        transition: all 0.2s ease;
                        backdrop-filter: blur(8px);
                    }
                    
                    .search-input:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                        background: rgba(0, 0, 0, 0.4);
                    }
                    
                    .search-input::placeholder {
                        color: #9ca3af;
                    }
                    
                    .search-container::before {
                        content: '🔍';
                        position: absolute;
                        left: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #6b7280;
                        pointer-events: none;
                        z-index: 1;
                    }
                    
                    .search-results {
                        position: absolute;
                        top: calc(100% + 8px);
                        left: 0;
                        right: 0;
                        max-height: 400px;
                        overflow-y: auto;
                        background: rgba(17, 24, 39, 0.95);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        z-index: 1000;
                        backdrop-filter: blur(12px);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
                        scrollbar-width: thin;
                        scrollbar-color: #374151 transparent;
                        display: none;
                    }
                    
                    .search-results::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    .search-results::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    .search-results::-webkit-scrollbar-thumb {
                        background: #374151;
                        border-radius: 3px;
                    }
                    
                    .search-result-item {
                        padding: 12px 16px;
                        cursor: pointer;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        transition: all 0.2s ease;
                        position: relative;
                    }
                    
                    .search-result-item:hover {
                        background: rgba(59, 130, 246, 0.1);
                        padding-left: 20px;
                    }
                    
                    .search-result-item:last-child {
                        border-bottom: none;
                    }
                    
                    .search-result-title {
                        font-weight: 500;
                        color: #e5e7eb;
                        margin-bottom: 4px;
                        font-size: 14px;
                    }
                    
                    .search-result-section {
                        font-size: 12px;
                        color: #6b7280;
                    }
                    
                    .search-no-results {
                        padding: 16px;
                        text-align: center;
                        color: #6b7280;
                        font-style: italic;
                    }
                    
                    /* Выпадающие разделы навигации */
                    .nav-section {
                        margin-bottom: 8px;
                        border-radius: 8px;
                        overflow: hidden;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        transition: all 0.2s ease;
                    }
                    
                    .nav-section:hover {
                        border-color: rgba(255, 255, 255, 0.1);
                    }
                    
                    .nav-section-header {
                        display: flex;
                        align-items: center;
                        padding: 14px 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        background: transparent;
                        border: none;
                        width: 100%;
                        text-align: left;
                        color: #e5e7eb;
                        font-size: 14px;
                        user-select: none;
                    }
                    
                    .nav-section-header:hover {
                        background: rgba(59, 130, 246, 0.1);
                        color: #3b82f6;
                    }
                    
                    .nav-section-header.expanded {
                        background: rgba(59, 130, 246, 0.15);
                        color: #3b82f6;
                    }
                    
                    .nav-section-icon {
                        margin-right: 12px;
                        font-size: 16px;
                        min-width: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .nav-section-title {
                        flex: 1;
                        font-weight: 500;
                    }
                    
                    .nav-section-arrow {
                        color: #9ca3af;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 20px;
                        height: 20px;
                    }
                    
                    .nav-section-arrow.expanded {
                        transform: rotate(180deg);
                        color: #3b82f6;
                    }
                    
                    .nav-section-arrow svg {
                        width: 12px;
                        height: 12px;
                    }
                    
                    .nav-articles {
                        max-height: 0;
                        overflow: hidden;
                        opacity: 0;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        background: rgba(0, 0, 0, 0.2);
                    }
                    
                    .nav-articles.expanded {
                        max-height: 600px;
                        opacity: 1;
                        padding: 8px 0;
                    }
                    
                    .nav-article {
                        display: block;
                        padding: 10px 16px 10px 52px;
                        color: #9ca3af;
                        text-decoration: none;
                        font-size: 13px;
                        transition: all 0.2s ease;
                        border-left: 3px solid transparent;
                        position: relative;
                    }
                    
                    .nav-article:hover {
                        color: #3b82f6;
                        background: rgba(59, 130, 246, 0.1);
                        border-left-color: rgba(59, 130, 246, 0.5);
                        padding-left: 56px;
                    }
                    
                    .nav-article.active {
                        color: #3b82f6;
                        background: rgba(59, 130, 246, 0.15);
                        border-left-color: #3b82f6;
                        font-weight: 500;
                    }
                    
                    .nav-article.active::before {
                        content: '';
                        position: absolute;
                        left: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 4px;
                        height: 4px;
                        background: #3b82f6;
                        border-radius: 50%;
                    }
                    
                    .highlight, mark {
                        background: linear-gradient(120deg, #f59e0b, #f97316);
                        color: white;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-weight: 500;
                    }
                    
                    /* Контент со скроллом */
                    .docs-content {
                        max-height: calc(100vh - 80px);
                        overflow-y: auto;
                        scroll-behavior: smooth;
                        padding: 24px;
                    }
                    
                    .docs-content::-webkit-scrollbar {
                        width: 8px;
                    }
                    
                    .docs-content::-webkit-scrollbar-thumb {
                        background: rgba(100, 100, 100, 0.3);
                        border-radius: 4px;
                    }
                    
                    /* Отступы для заголовков при якорных ссылках */
                    .docs-content h1, .docs-content h2, .docs-content h3, 
                    .docs-content h4, .docs-content h5, .docs-content h6 {
                        scroll-margin-top: 80px;
                        padding-top: 8px;
                        margin-top: 32px;
                        position: relative;
                    }
                    
                    .docs-content h1:first-child {
                        margin-top: 0;
                    }
                    
                    /* НАВИГАЦИОННОЕ МЕНЮ ПО ЗАГОЛОВКАМ - СКРЫТО ПО УМОЛЧАНИЮ */
                    .article-toc {
                        position: fixed;
                        right: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(17, 24, 39, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 12px;
                        max-width: 200px;
                        max-height: 400px;
                        overflow-y: auto;
                        backdrop-filter: blur(8px);
                        z-index: 100;
                        display: none !important; /* ПРИНУДИТЕЛЬНО СКРЫТО */
                    }
                    
                    /* ТОЛЬКО для статей с currentArticle */
                    .article-toc.show-for-article {
                        display: block !important;
                    }
                    
                    .article-toc h4 {
                        margin: 0 0 8px 0;
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .toc-item {
                        display: block;
                        padding: 4px 8px;
                        color: #9ca3af;
                        text-decoration: none;
                        font-size: 12px;
                        border-left: 2px solid transparent;
                        transition: all 0.2s ease;
                        margin-bottom: 2px;
                    }
                    
                    .toc-item:hover {
                        color: #3b82f6;
                        border-left-color: #3b82f6;
                        background: rgba(59, 130, 246, 0.1);
                    }
                    
                    .toc-item.active {
                        color: #3b82f6;
                        border-left-color: #3b82f6;
                        font-weight: 500;
                    }
                    
                    .toc-item.level-1 { padding-left: 8px; }
                    .toc-item.level-2 { padding-left: 16px; }
                    .toc-item.level-3 { padding-left: 24px; }
                    .toc-item.level-4 { padding-left: 32px; }
                    
                    .breadcrumbs {
                        margin-bottom: 24px;
                        padding: 12px 0;
                        color: #6b7280;
                        font-size: 14px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .breadcrumbs a {
                        color: #3b82f6;
                        text-decoration: none;
                    }
                    
                    .breadcrumbs a:hover {
                        text-decoration: underline;
                    }
                    
                    .loading {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 60px;
                        color: #6b7280;
                    }
                    
                    .loading::before {
                        content: '';
                        width: 20px;
                        height: 20px;
                        border: 2px solid #374151;
                        border-top: 2px solid #3b82f6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-right: 12px;
                    }
                    
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    /* Welcome page styles */
                    .docs-welcome {
                        text-align: center;
                        padding: 40px 20px;
                    }

                    .docs-welcome-header h1 {
                        font-size: 2.5rem;
                        margin-bottom: 1rem;
                        color: #ffffff;
                    }

                    .docs-welcome-header p {
                        font-size: 1.2rem;
                        color: #9ca3af;
                        max-width: 600px;
                        margin: 0 auto 2rem;
                    }

                    .docs-welcome-sections {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 1.5rem;
                        margin-top: 3rem;
                    }

                    .welcome-section {
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 1.5rem;
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }

                    .welcome-section:hover {
                        background: rgba(255, 255, 255, 0.08);
                        transform: translateY(-2px);
                    }

                    .welcome-section-icon {
                        font-size: 2rem;
                        margin-bottom: 1rem;
                    }

                    .welcome-section-title {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #ffffff;
                        margin-bottom: 0.5rem;
                    }

                    .welcome-section-description {
                        color: #9ca3af;
                        margin-bottom: 1rem;
                    }

                    .welcome-section-meta {
                        font-size: 0.875rem;
                        color: #6b7280;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }

        renderNavigation() {
            const navContainer = document.querySelector('.docs-nav');
            if (!navContainer) return;

            const sections = this.docsData.sections.map(section => {
                const isExpanded = this.expandedSections.has(section.id);
                const articlesHtml = (section.articles || []).map(article =>
                    `<a href="#${section.id}/${article.id}" class="nav-article" data-section="${section.id}" data-article="${article.id}">
                        ${article.title}
                    </a>`
                ).join('');

                return `
                    <div class="nav-section" data-section="${section.id}">
                        <button class="nav-section-header${isExpanded ? ' expanded' : ''}" data-section="${section.id}" aria-expanded="${isExpanded}">
                            <span class="nav-section-icon">${section.icon || '📄'}</span>
                            <span class="nav-section-title">${section.title}</span>
                            <span class="nav-section-arrow${isExpanded ? ' expanded' : ''}">
                                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </span>
                        </button>
                        <div class="nav-articles${isExpanded ? ' expanded' : ''}" data-section="${section.id}">
                            ${articlesHtml}
                        </div>
                    </div>
                `;
            }).join('');

            navContainer.innerHTML = `
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Поиск в документации..." />
                    <div class="search-results" style="display: none;"></div>
                </div>
                <div class="nav-sections">
                    ${sections}
                </div>
            `;
        }

        setupEventListeners() {
            // Обработчик навигации
            document.addEventListener('click', (e) => {
                // Переключение разделов
                if (e.target.closest('.nav-section-header')) {
                    e.preventDefault();
                    const header = e.target.closest('.nav-section-header');
                    const sectionId = header.dataset.section;
                    this.toggleSection(sectionId);
                    return;
                }

                // Переход к статье
                const articleLink = e.target.closest('.nav-article');
                if (articleLink) {
                    e.preventDefault();
                    const sectionId = articleLink.dataset.section;
                    const articleId = articleLink.dataset.article;
                    this.showArticle(sectionId, articleId);
                    this.updateActiveLink(sectionId, articleId);
                    this.scrollToContentTop();
                    return;
                }

                // Клик по результату поиска
                const searchItem = e.target.closest('.search-result-item');
                if (searchItem) {
                    const url = searchItem.dataset.url;
                    if (url) {
                        const [sectionId, articleId] = url.replace('#', '').split('/');
                        this.showArticle(sectionId, articleId);
                        this.updateActiveLink(sectionId, articleId);
                        this.hideSearchResults();
                        this.scrollToHighlight();
                    }
                    return;
                }

                // Клик по TOC ссылке
                const tocItem = e.target.closest('.toc-item');
                if (tocItem) {
                    e.preventDefault();
                    const targetId = tocItem.getAttribute('href').slice(1);
                    this.scrollToHeading(targetId);
                    return;
                }
            });

            // Обработка поиска
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.searchTimeout);
                    const query = e.target.value.trim();

                    if (query.length < 2) {
                        this.hideSearchResults();
                        return;
                    }

                    this.searchTimeout = setTimeout(() => {
                        this.performSearch(query);
                    }, 200);
                });

                searchInput.addEventListener('blur', () => {
                    setTimeout(() => this.hideSearchResults(), 150);
                });
            }

            // Обработка браузерных кнопок назад/вперед
            window.addEventListener('popstate', () => {
                this.handleHashChange();
            });

            window.addEventListener('hashchange', () => {
                this.handleHashChange();
            });

            // Скрытие поиска при клике вне
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideSearchResults();
                }
            });
        }

        toggleSection(sectionId) {
            const section = document.querySelector(`.nav-section[data-section="${sectionId}"]`);
            const articles = section?.querySelector('.nav-articles');
            const arrow = section?.querySelector('.nav-section-arrow');
            const header = section?.querySelector('.nav-section-header');

            if (!section) return;

            if (this.expandedSections.has(sectionId)) {
                // Свернуть
                this.expandedSections.delete(sectionId);
                articles?.classList.remove('expanded');
                arrow?.classList.remove('expanded');
                header?.classList.remove('expanded');
            } else {
                // Развернуть
                this.expandedSections.add(sectionId);
                articles?.classList.add('expanded');
                arrow?.classList.add('expanded');
                header?.classList.add('expanded');
            }
        }

        performSearch(query) {
            const searchWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);

            const results = this.searchIndex.map(item => {
                let score = 0;
                let titleMatches = 0;
                let contentMatches = 0;

                searchWords.forEach(word => {
                    // Поиск в заголовке (вес 3)
                    const titlePos = item.title.toLowerCase().indexOf(word);
                    if (titlePos !== -1) {
                        titleMatches++;
                        score += 3;
                        if (titlePos === 0) score += 2; // Бонус за начало
                    }

                    // Поиск в описании (вес 2)
                    if (item.description.toLowerCase().indexOf(word) !== -1) {
                        score += 2;
                    }

                    // Поиск в контенте (вес 1)
                    if (item.content.indexOf(word) !== -1) {
                        contentMatches++;
                        score += 1;
                    }

                    // Поиск в секции (вес 1)
                    if (item.section.toLowerCase().indexOf(word) !== -1) {
                        score += 1;
                    }
                });

                // Бонус за полное совпадение
                if (item.searchableText.includes(query.toLowerCase())) {
                    score += 5;
                }

                return { ...item, score, titleMatches, contentMatches };
            })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 15);

            this.displaySearchResults(results, query);
        }

        displaySearchResults(results, query) {
            const searchResults = document.querySelector('.search-results');
            if (!searchResults) return;

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">Ничего не найдено</div>';
                searchResults.style.display = 'block';
                return;
            }

            const resultsHtml = results.map(result =>
                `<div class="search-result-item" data-url="${result.url}">
                    <div class="search-result-title">${this.highlightText(result.title, query)}</div>
                    <div class="search-result-section">${result.section}</div>
                </div>`
            ).join('');

            searchResults.innerHTML = resultsHtml;
            searchResults.style.display = 'block';
        }

        hideSearchResults() {
            const searchResults = document.querySelector('.search-results');
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }

        showArticle(sectionId, articleId) {
            const section = this.docsData.sections.find(s => s.id === sectionId);
            if (!section) return;

            const article = (section.articles || []).find(a => a.id === articleId);
            if (!article) return;

            // Убедимся, что раздел развернут
            if (!this.expandedSections.has(sectionId)) {
                this.expandedSections.add(sectionId);
                this.renderNavigation();
            }

            this.renderArticleContent(article, section);
            this.currentArticle = { section: sectionId, article: articleId };

            // Генерируем навигацию по заголовкам только для статей
            this.generateTableOfContents(article.content);

            // Обновляем URL
            history.pushState(null, null, `#${sectionId}/${articleId}`);

            // Обновляем видимость TOC
            this.updateTocVisibility();
        }

        renderArticleContent(article, section) {
            const container = document.querySelector('.docs-content');
            if (!container) return;

            const breadcrumbs = `
                <div class="breadcrumbs">
                    <a href="#" onclick="window.VulneraAIDocs.showWelcomePage()">Главная</a> › 
                    <span>${section.title}</span> › 
                    <span>${article.title}</span>
                </div>
            `;

            const content = (article.content || []).map(block => this.renderContentBlock(block)).join('');

            container.innerHTML = `
                ${breadcrumbs}
                <article class="docs-article">
                    <header class="docs-article-header">
                        <h1 class="docs-article-title">${article.title}</h1>
                        <p class="docs-article-description">${article.description || ''}</p>
                    </header>
                    <div class="docs-article-content">
                        ${content}
                    </div>
                </article>
            `;

            this.highlightCode();
        }

        renderContentBlock(block) {
            if (!block || !block.type) return '';

            switch (block.type) {
                case 'heading':
                    const level = Math.min(Math.max(block.level || 2, 1), 6);
                    const id = this.slugify(block.text);
                    return `<h${level} id="${id}">${this.parseMarkdown(block.text)}</h${level}>`;

                case 'paragraph':
                    return `<p>${this.parseMarkdown(block.text)}</p>`;

                case 'list':
                    const items = (block.items || []).map(item => `<li>${this.parseMarkdown(item)}</li>`).join('');
                    return `<ul>${items}</ul>`;

                case 'code':
                    const language = block.language || 'text';
                    const title = block.title ? `<div class="code-title">${block.title}</div>` : '';
                    return `<div class="code-block">${title}<pre><code class="language-${language}">${this.escapeHtml(block.code)}</code></pre></div>`;

                case 'alert':
                    const variant = block.variant || 'info';
                    return `<div class="alert alert-${variant}">${this.parseMarkdown(block.text)}</div>`;

                case 'table':
                    const headers = (block.headers || []).map(h => `<th>${h}</th>`).join('');
                    const rows = (block.rows || []).map(row =>
                        `<tr>${row.map(cell => `<td>${this.parseMarkdown(cell)}</td>`).join('')}</tr>`
                    ).join('');
                    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;

                case 'features':
                    const features = (block.items || []).map(feature =>
                        `<div class="feature-item">
                            <h4 class="feature-title">${feature.title}</h4>
                            <p class="feature-description">${feature.description}</p>
                        </div>`
                    ).join('');
                    return `<div class="features-grid">${features}</div>`;

                default:
                    return '';
            }
        }

        // ПРИНУДИТЕЛЬНО убираем существующий TOC
        hideToc() {
            const existingTocs = document.querySelectorAll('.article-toc');
            existingTocs.forEach(toc => {
                if (toc && toc.parentNode) {
                    toc.remove();
                }
            });
            console.log('TOC скрыт');
        }

        // Генерируем навигацию по заголовкам ТОЛЬКО для статей
        generateTableOfContents(content) {
            // ВСЕГДА убираем существующий TOC сначала
            this.hideToc();

            // Проверяем что мы в статье
            if (!this.currentArticle) {
                console.log('Нет currentArticle - не показываем TOC');
                return;
            }

            const headings = content.filter(block => block.type === 'heading');

            // Показываем TOC только если заголовков больше 1
            if (headings.length < 2) {
                console.log('Мало заголовков - не показываем TOC');
                return;
            }

            const tocItems = headings.map(heading => {
                const id = this.slugify(heading.text);
                const level = heading.level || 2;
                return `<a href="#${id}" class="toc-item level-${level}" data-heading="${id}">${heading.text}</a>`;
            }).join('');

            // Создаем новый TOC БЕЗ автоматического класса
            const toc = document.createElement('div');
            toc.className = 'article-toc'; // Убираем автоматический show-for-article
            toc.innerHTML = `
                <h4>Содержание</h4>
                ${tocItems}
            `;

            document.body.appendChild(toc);

            // Обновляем видимость TOC на основе текущей страницы
            this.updateTocVisibility();

            console.log('TOC создан для статьи');

            // Активируем текущий заголовок при скролле
            this.setupTocActiveTracking();
        }

        // Функция для управления видимостью TOC
        updateTocVisibility(currentHash = window.location.hash) {
            // Страницы документации, где должен отображаться TOC
            const docPages = [
                'introduction',
                'architecture',
                'user-guide',
                'api',
                'pricing',
                'support'
            ];

            const toc = document.querySelector('.article-toc');
            if (!toc) return;

            // Очищаем хэш от символа # и приводим к нижнему регистру
            const cleanHash = currentHash.replace(/^#/, '').toLowerCase();

            // Проверяем, находимся ли мы на документационной странице
            const isDocPage = docPages.some(page => {
                // Проверяем точное совпадение или начало хэша (для вложенных страниц типа #introduction/overview)
                return cleanHash === page || cleanHash.startsWith(page + '/');
            });

            // Управляем видимостью TOC
            if (isDocPage && this.currentArticle) {
                toc.classList.add('show-for-article');
                console.log('TOC показан для страницы:', cleanHash);
            } else {
                toc.classList.remove('show-for-article');
                console.log('TOC скрыт для страницы:', cleanHash);
            }
        }

        setupTocActiveTracking() {
            const contentContainer = document.querySelector('.docs-content');
            if (!contentContainer) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const id = entry.target.id;
                    const tocItem = document.querySelector(`.toc-item[data-heading="${id}"]`);

                    if (tocItem) {
                        if (entry.isIntersecting) {
                            // Убираем active с других элементов
                            document.querySelectorAll('.toc-item.active').forEach(item => {
                                item.classList.remove('active');
                            });
                            // Добавляем active к текущему
                            tocItem.classList.add('active');
                        }
                    }
                });
            }, {
                rootMargin: '-80px 0px -80% 0px',
                threshold: 0
            });

            // Наблюдаем за всеми заголовками
            contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                if (heading.id) observer.observe(heading);
            });
        }

        scrollToHeading(headingId) {
            const heading = document.getElementById(headingId);
            if (heading) {
                heading.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        updateActiveLink(sectionId, articleId) {
            document.querySelectorAll('.nav-article').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`.nav-article[data-section="${sectionId}"][data-article="${articleId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }

        scrollToContentTop() {
            const container = document.querySelector('.docs-content');
            if (container) {
                container.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }

        scrollToHighlight() {
            setTimeout(() => {
                const container = document.querySelector('.docs-content');
                if (!container) return;

                const highlight = container.querySelector('.highlight, mark');
                if (highlight) {
                    const rect = highlight.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
                        highlight.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                } else {
                    this.scrollToContentTop();
                }
            }, 100);
        }

        handleHashChange() {
            // Обновляем видимость TOC ПЕРЕД обработкой навигации
            this.updateTocVisibility();

            const hash = window.location.hash.slice(1);
            if (hash) {
                const [sectionId, articleId] = hash.split('/');
                if (sectionId && articleId) {
                    this.showArticle(sectionId, articleId);
                    this.updateActiveLink(sectionId, articleId);
                    this.scrollToContentTop();
                } else {
                    // Если неполный хэш, показываем главную и УБИРАЕМ TOC
                    this.showWelcomePage();
                }
            } else {
                // Если нет хэша, показываем главную и УБИРАЕМ TOC
                this.showWelcomePage();
            }
        }

        loadInitialArticle() {
            const hash = window.location.hash.slice(1);
            if (hash) {
                const [sectionId, articleId] = hash.split('/');
                if (sectionId && articleId) {
                    this.expandedSections.add(sectionId);
                    this.showArticle(sectionId, articleId);
                    this.updateActiveLink(sectionId, articleId);
                    return;
                }
            }

            // Показать главную страницу БЕЗ TOC
            this.showWelcomePage();
        }

        showWelcomePage() {
            const container = document.querySelector('.docs-content');
            if (!container) return;

            const sectionsOverview = this.docsData.sections.map(section =>
                `<div class="welcome-section">
                    <div class="welcome-section-icon">${section.icon || '📄'}</div>
                    <h3 class="welcome-section-title">${section.title}</h3>
                    <p class="welcome-section-description">${section.description || 'Полное руководство по использованию системы автоматизированного пентестинга'}</p>
                    <div class="welcome-section-meta">Изучите ${(section.articles || []).length} статей в этом разделе</div>
                </div>`
            ).join('');

            container.innerHTML = `
                <div class="docs-welcome">
                    <header class="docs-welcome-header">
                        <h1>Добро пожаловать в документацию VulneraAI</h1>
                        <p>Изучите возможности облачной платформы автоматизированного пентестинга с использованием ИИ</p>
                    </header>
                    <div class="docs-welcome-sections">
                        ${sectionsOverview}
                    </div>
                </div>
            `;

            // Очистить активные ссылки
            document.querySelectorAll('.nav-article').forEach(link => {
                link.classList.remove('active');
            });

            // ПРИНУДИТЕЛЬНО УБРАТЬ TOC НА ГЛАВНОЙ СТРАНИЦЕ
            this.hideToc();
            this.currentArticle = null;

            // Обновляем видимость TOC
            this.updateTocVisibility();

            console.log('Показана главная страница, TOC скрыт');
            history.pushState(null, null, '#');
        }

        // Утилиты
        parseMarkdown(text) {
            if (!text) return '';
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
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
            if (!query) return this.escapeHtml(text);
            const words = query.split(/\s+/);
            let result = this.escapeHtml(text);

            words.forEach(word => {
                if (word.length > 1) {
                    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    result = result.replace(regex, '<span class="highlight">$1</span>');
                }
            });

            return result;
        }

        highlightCode() {
            document.querySelectorAll('pre code').forEach((block) => {
                // Здесь можно подключить Prism.js или другую библиотеку подсветки синтаксиса
                // Prism.highlightElement(block);
            });
        }

        showLoading() {
            const container = document.querySelector('.docs-content');
            if (container) {
                container.innerHTML = `
                    <div class="loading">
                        Загрузка документации...
                    </div>
                `;
            }
        }

        hideLoading() {
            // Скрытие происходит автоматически при загрузке контента
        }

        showError(message) {
            const container = document.querySelector('.docs-content');
            if (container) {
                container.innerHTML = `
                    <div class="error">
                        <h2>Ошибка</h2>
                        <p>${message}</p>
                    </div>
                `;
            }

            // Убираем TOC на странице ошибки
            this.hideToc();
            this.currentArticle = null;
        }
    }

    // Глобальная функция для использования из app.js
    window.updateTocVisibility = function (currentHash = window.location.hash) {
        // Страницы документации, где должен отображаться TOC
        const docPages = [
            'introduction',
            'architecture',
            'user-guide',
            'api',
            'pricing',
            'support'
        ];

        const toc = document.querySelector('.article-toc');
        if (!toc) return;

        // Очищаем хэш от символа # и приводим к нижнему регистру
        const cleanHash = currentHash.replace(/^#/, '').toLowerCase();

        // Проверяем, находимся ли мы на документационной странице
        const isDocPage = docPages.some(page => {
            // Проверяем точное совпадение или начало хэша (для вложенных страниц типа #introduction/overview)
            return cleanHash === page || cleanHash.startsWith(page + '/');
        });

        // Управляем видимостью TOC
        if (isDocPage) {
            toc.classList.add('show-for-article');
            console.log('TOC показан для страницы:', cleanHash);
        } else {
            toc.classList.remove('show-for-article');
            console.log('TOC скрыт для страницы:', cleanHash);
        }
    };

    // Автоматическое обновление при изменении хэша
    window.addEventListener('hashchange', () => {
        window.updateTocVisibility();
    });

    // Обновление при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.updateTocVisibility();
        }, 100); // Небольшая задержка для загрузки элементов
    });

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
        window.VulneraAIDocs = new DocumentationManager();
        window.VulneraAIDocs.initialize();
    });

})();
