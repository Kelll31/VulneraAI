// VulneraAI Architecture Module - Block-Based Interactive Diagram
// Features: Zoom, Pan, Block Grouping, Modern Design

(function () {
    'use strict';

    // Architecture blocks with grouped components
    const ARCHITECTURE_BLOCKS = {
        userInterface: {
            title: "Интерфейс пользователя",
            position: { x: 40, y: 80 },
            size: { width: 320, height: 480 },
            color: "#1e40af",
            components: ["ui", "webhook"]
        },
        systemCore: {
            title: "Ядро системы",
            position: { x: 480, y: 80 },
            size: { width: 750, height: 500 },
            color: "#7c2d12",
            components: ["core", "orchestrator", "datastream"]
        },
        toolsAndEngines: {
            title: "Инструменты и движки",
            position: { x: 1350, y: 80 },
            size: { width: 700, height: 600 },
            color: "#065f46",
            components: ["rag", "battlenet", "tools", "kali"]
        }
    };

    const architectureComponents = {
        ui: {
            name: "Интерфейс пользователя",
            technical_name: "OpenWeb UI",
            description: "Веб-интерфейс • Настройки • Конфигурация",
            details: "Современный веб-интерфейс обеспечивает полное управление системой VulneraAI. Включает настройки пентест-заданий, мониторинг выполнения, просмотр результатов и отчетов. Поддерживает интеграцию с внешними системами через REST API.",
            connections: ["core"],
            protocols: ["REST/HTTPS", "Webhook"],
            position: { x: 80, y: 220 },
            size: { width: 240, height: 120 },
            color: "#3b82f6",
            block: "userInterface"
        },
        webhook: {
            name: "Webhook",
            technical_name: "Уведомления",
            description: "Система уведомлений для обратной связи",
            details: "Обеспечивает асинхронную доставку уведомлений о результатах выполнения задач, статусе системы и важных событиях безопасности. Интегрируется с основными компонентами системы.",
            connections: ["core", "ui"],
            protocols: ["Webhook"],
            position: { x: 80, y: 420 },
            size: { width: 240, height: 100 },
            color: "#ec4899",
            block: "userInterface"
        },
        core: {
            name: "VulneraAI Core",
            technical_name: "API",
            description: "Конвейер OpenWebUI • Webhook события",
            details: "Центральное ядро системы, координирующее работу всех компонентов. Включает конвейер OpenWebUI для обработки запросов, систему Webhook уведомлений, центральную логику планирования и выполнения задач пентестинга.",
            connections: ["orchestrator", "ui", "webhook"],
            protocols: ["RPC", "REST/HTTPS", "Webhook"],
            position: { x: 520, y: 220 },
            size: { width: 260, height: 100 },
            color: "#f59e0b",
            block: "systemCore"
        },
        orchestrator: {
            name: "Оркестратор",
            technical_name: "Менеджер процессов",
            description: "Планирование задач • Агрегация результатов • Управление очередями • Мониторинг состояния • Retry механизмы",
            details: "Интеллектуальный менеджер процессов с планированием задач, агрегацией результатов, управлением очередями, мониторингом состояния и механизмами повторов. Обеспечивает эффективное распределение ресурсов и координацию выполнения задач тестирования безопасности.",
            connections: ["core", "datastream", "battlenet"],
            protocols: ["RPC", "API"],
            position: { x: 900, y: 200 },
            size: { width: 280, height: 130 },
            color: "#8b5cf6",
            block: "systemCore"
        },
        datastream: {
            name: "DataStream",
            technical_name: "Контекстные данные",
            description: "Обработка данных в реальном времени",
            details: "Обрабатывает контекстные данные, необходимые для проведения тестирования. Обеспечивает обмен информацией между компонентами системы в режиме реального времени, поддерживает различные форматы данных.",
            connections: ["orchestrator", "rag"],
            protocols: ["API"],
            position: { x: 520, y: 420 },
            size: { width: 220, height: 120 },
            color: "#6b7280",
            block: "systemCore"
        },
        rag: {
            name: "RAG-модуль",
            technical_name: "Retrieval-Augmented Generation",
            description: "База знаний CVE • Контекстный поиск • Семантическая индексация",
            details: "Содержит актуальную базу данных уязвимостей CVE, обеспечивает контекстный поиск информации, семантическую индексацию данных. Использует технологии машинного обучения для анализа и рекомендаций по векторам атак.",
            connections: ["datastream"],
            protocols: ["API"],
            position: { x: 1400, y: 320 },
            size: { width: 220, height: 120 },
            color: "#f59e0b",
            block: "toolsAndEngines"
        },
        battlenet: {
            name: "BattleNet",
            technical_name: "Атакующая нейросеть",
            description: "Генерация эксплойтов • Адаптивные атаки • Zero-day детекция",
            details: "Специализированная нейронная сеть для генерации эксплойтов, проведения адаптивных атак и детекции zero-day уязвимостей. Использует глубокое обучение для анализа целевых систем и автоматической разработки стратегий атак.",
            connections: ["orchestrator", "tools", "kali"],
            protocols: ["API", "CLI/API"],
            position: { x: 1800, y: 200 },
            size: { width: 200, height: 120 },
            color: "#10b981",
            block: "toolsAndEngines"
        },
        tools: {
            name: "Инструменты и данные",
            technical_name: "API Tools",
            description: "Рекомендации • Запрос контекста • Результаты сканирования",
            details: "Набор вспомогательных API и инструментов для расширения функциональности системы. Включает рекомендации по векторам атак, запросы контекстной информации, результаты сканирования внешних систем.",
            connections: ["battlenet", "kali"],
            protocols: ["API"],
            position: { x: 1400, y: 520 },
            size: { width: 220, height: 120 },
            color: "#6b7280",
            block: "toolsAndEngines"
        },
        kali: {
            name: "Kali Linux",
            technical_name: "Тестирование безопасности",
            description: "CLI/API • Выполнение тестов",
            details: "Интегрированная среда Kali Linux с полным набором инструментов для тестирования на проникновение. Предоставляет CLI/API интерфейс для выполнения тестов, автоматизации сценариев и интеграции с внешними инструментами.",
            connections: ["battlenet", "ui", "tools"],
            protocols: ["CLI/API", "SSH/API"],
            position: { x: 1800, y: 520 },
            size: { width: 200, height: 100 },
            color: "#10b981",
            block: "toolsAndEngines"
        }
    };



    // Enhanced connection definitions
    const connections = [
        { from: "ui", to: "core", type: "REST/HTTPS", label: "Запросы API", color: "#3b82f6" },
        { from: "core", to: "orchestrator", type: "RPC", label: "Делегирование задач", color: "#8b5cf6" },
        { from: "orchestrator", to: "datastream", type: "API", label: "Обогащение данных", color: "#f59e0b" },
        { from: "datastream", to: "rag", type: "API", label: "Контекстные данные", color: "#f59e0b" },
        { from: "orchestrator", to: "battlenet", type: "API", label: "Запуск атак", color: "#10b981" },
        { from: "core", to: "webhook", type: "Webhook", label: "Результаты атак", color: "#ec4899", dashed: true },
        { from: "webhook", to: "ui", type: "Webhook", label: "Уведомления", color: "#ec4899", dashed: true },
        { from: "battlenet", to: "tools", type: "API", label: "Рекомендации", color: "#6b7280" },
        { from: "battlenet", to: "kali", type: "CLI/API", label: "Выполнение тестов", color: "#10b981" },
        { from: "tools", to: "kali", type: "API", label: "Результаты сканирования", color: "#10b981" },
    ];

    // Advanced Architecture Manager with Block Support
    class ArchitectureManager {
        constructor() {
            this.components = architectureComponents;
            this.blocks = ARCHITECTURE_BLOCKS;
            this.connections = connections;
            this.selectedComponent = null;
            this.selectedBlock = null;
            this.detailsContainer = null;
            this.svgElement = null;
            this.zoomGroup = null;
            this.isDragging = false;
            this.dragStart = { x: 0, y: 0 };
            this.currentTransform = { x: 0, y: 0, scale: 1 };
            this.minZoom = 0.2;
            this.maxZoom = 4;
        }

        // Initialize the enhanced diagram
        initialize() {
            console.log('Architecture: Initializing advanced block-based diagram...');

            this.detailsContainer = document.getElementById('componentDetails');
            if (!this.detailsContainer) {
                console.warn('Architecture: Details container not found');
                return;
            }

            this.createEnhancedSVGDiagram();
            this.setupZoomAndPan();
            this.setupInteractions();
            this.showDefaultInfo();
            this.addEnhancedControls();
        }

        // Create enhanced SVG with blocks
        createEnhancedSVGDiagram() {
            const diagramContainer = document.querySelector('.architecture-diagram');
            if (!diagramContainer) return;

            diagramContainer.innerHTML = '';

            // Create SVG with larger viewBox for blocks
            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgElement.setAttribute('width', '100%');
            this.svgElement.setAttribute('height', '100%');
            this.svgElement.setAttribute('viewBox', '0 0 1600 700');
            this.svgElement.setAttribute('id', 'architectureSvg');
            this.svgElement.style.background = 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 70%)';
            this.svgElement.style.cursor = 'grab';

            // Create definitions
            const defs = this.createEnhancedDefs();
            this.svgElement.appendChild(defs);

            // Create zoom group
            this.zoomGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.zoomGroup.setAttribute('class', 'zoom-group');
            this.svgElement.appendChild(this.zoomGroup);

            // Draw blocks first
            this.drawBlocks();

            // Draw connections
            this.drawConnections();

            // Draw components
            this.drawComponents();

            diagramContainer.appendChild(this.svgElement);
        }

        // Create enhanced definitions (gradients, patterns, markers)
        createEnhancedDefs() {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

            // Create gradients for each component
            Object.keys(this.components).forEach(id => {
                const component = this.components[id];
                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                gradient.setAttribute('id', `gradient-${id}`);
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '0%');
                gradient.setAttribute('y2', '100%');

                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop1.setAttribute('offset', '0%');
                stop1.setAttribute('stop-color', component.color);
                stop1.setAttribute('stop-opacity', '0.95');

                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '100%');
                stop2.setAttribute('stop-color', component.color);
                stop2.setAttribute('stop-opacity', '0.7');

                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                defs.appendChild(gradient);
            });

            // Create block gradients
            Object.keys(this.blocks).forEach(blockId => {
                const block = this.blocks[blockId];
                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                gradient.setAttribute('id', `block-gradient-${blockId}`);
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '100%');
                gradient.setAttribute('y2', '100%');

                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop1.setAttribute('offset', '0%');
                stop1.setAttribute('stop-color', block.color);
                stop1.setAttribute('stop-opacity', '0.03');

                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '100%');
                stop2.setAttribute('stop-color', block.color);
                stop2.setAttribute('stop-opacity', '0.08');

                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                defs.appendChild(gradient);
            });

            return defs;
        }

        // Draw architectural blocks
        drawBlocks() {
            const blocksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            blocksGroup.setAttribute('class', 'blocks');

            Object.keys(this.blocks).forEach(blockId => {
                const block = this.blocks[blockId];
                const blockGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                blockGroup.setAttribute('class', `block block-${blockId}`);
                blockGroup.setAttribute('data-block-id', blockId);

                // Block background with gradient
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', block.position.x);
                rect.setAttribute('y', block.position.y);
                rect.setAttribute('width', block.size.width);
                rect.setAttribute('height', block.size.height);
                rect.setAttribute('rx', '16');
                rect.setAttribute('fill', `url(#block-gradient-${blockId})`);
                rect.setAttribute('stroke', block.color);
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('stroke-dasharray', '10,5');
                rect.setAttribute('opacity', '0.6');

                // Block title
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                title.setAttribute('x', block.position.x + block.size.width / 2);
                title.setAttribute('y', block.position.y + 30);
                title.setAttribute('text-anchor', 'middle');
                title.setAttribute('fill', block.color);
                title.setAttribute('font-size', '16');
                title.setAttribute('font-weight', 'bold');
                title.setAttribute('opacity', '0.9');
                title.textContent = block.title;

                blockGroup.appendChild(rect);
                blockGroup.appendChild(title);
                blocksGroup.appendChild(blockGroup);
            });

            this.zoomGroup.appendChild(blocksGroup);
        }

        // Draw enhanced connections with curved paths
        drawConnections() {
            const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            connectionsGroup.setAttribute('class', 'connections');

            this.connections.forEach((conn, index) => {
                const fromComp = this.components[conn.from];
                const toComp = this.components[conn.to];

                if (!fromComp || !toComp) return;

                // Calculate connection points
                const fromPoint = this.getConnectionPoint(fromComp, toComp);
                const toPoint = this.getConnectionPoint(toComp, fromComp);

                // Create curved path
                const path = this.createCurvedPath(fromPoint, toPoint);
                path.setAttribute('stroke', conn.color);
                path.setAttribute('stroke-width', '3');
                path.setAttribute('fill', 'none');

                if (conn.dashed) {
                    path.setAttribute('stroke-dasharray', '12,6');
                }

                path.setAttribute('class', 'connection-line');
                path.setAttribute('data-from', conn.from);
                path.setAttribute('data-to', conn.to);
                path.setAttribute('opacity', '0.8');

                connectionsGroup.appendChild(path);

                // Add enhanced connection label
                const midPoint = this.getPathMidpoint(fromPoint, toPoint);
                const labelGroup = this.createConnectionLabel(conn, midPoint);
                connectionsGroup.appendChild(labelGroup);
            });

            this.zoomGroup.appendChild(connectionsGroup);
        }

        // Create curved path between points
        createCurvedPath(from, to) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Calculate control points for smooth curve
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const controlOffset = Math.min(distance * 0.3, 100);
            const cp1x = from.x + (dx > 0 ? controlOffset : -controlOffset);
            const cp1y = from.y;
            const cp2x = to.x - (dx > 0 ? controlOffset : -controlOffset);
            const cp2y = to.y;

            const pathData = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
            path.setAttribute('d', pathData);

            return path;
        }

        // Get midpoint of curved path
        getPathMidpoint(from, to) {
            return {
                x: (from.x + to.x) / 2,
                y: (from.y + to.y) / 2
            };
        }

        // Create enhanced connection label
        createConnectionLabel(conn, midPoint) {
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('class', 'connection-label');

            // Label background
            const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            labelBg.setAttribute('x', midPoint.x - 50);
            labelBg.setAttribute('y', midPoint.y - 20);
            labelBg.setAttribute('width', '100');
            labelBg.setAttribute('height', '40');
            labelBg.setAttribute('fill', '#1a1a1a');
            labelBg.setAttribute('stroke', conn.color);
            labelBg.setAttribute('stroke-width', '1');
            labelBg.setAttribute('rx', '6');
            labelBg.setAttribute('opacity', '0.95');

            // Protocol text
            const protocolText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            protocolText.setAttribute('x', midPoint.x);
            protocolText.setAttribute('y', midPoint.y - 5);
            protocolText.setAttribute('text-anchor', 'middle');
            protocolText.setAttribute('fill', conn.color);
            protocolText.setAttribute('font-size', '11');
            protocolText.setAttribute('font-weight', 'bold');
            protocolText.textContent = conn.type;

            // Description text
            const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            descText.setAttribute('x', midPoint.x);
            descText.setAttribute('y', midPoint.y + 10);
            descText.setAttribute('text-anchor', 'middle');
            descText.setAttribute('fill', '#b0b0b0');
            descText.setAttribute('font-size', '9');
            descText.textContent = conn.label;

            labelGroup.appendChild(labelBg);
            labelGroup.appendChild(protocolText);
            labelGroup.appendChild(descText);

            return labelGroup;
        }

        // Draw enhanced components
        drawComponents() {
            Object.keys(this.components).forEach(id => {
                const component = this.components[id];
                this.drawEnhancedComponent(id, component);
            });
        }

        // Draw individual enhanced component
        drawEnhancedComponent(id, component) {
            const componentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            componentGroup.setAttribute('class', 'component');
            componentGroup.setAttribute('data-id', id);
            componentGroup.style.cursor = 'pointer';

            // Component shadow
            const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shadow.setAttribute('x', component.position.x + 4);
            shadow.setAttribute('y', component.position.y + 4);
            shadow.setAttribute('width', component.size.width);
            shadow.setAttribute('height', component.size.height);
            shadow.setAttribute('rx', '12');
            shadow.setAttribute('fill', 'rgba(0,0,0,0.2)');
            shadow.setAttribute('class', 'component-shadow');

            // Main rectangle with enhanced styling
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', component.position.x);
            rect.setAttribute('y', component.position.y);
            rect.setAttribute('width', component.size.width);
            rect.setAttribute('height', component.size.height);
            rect.setAttribute('rx', '12');
            rect.setAttribute('fill', `url(#gradient-${id})`);
            rect.setAttribute('stroke', component.color);
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('class', 'component-rect');

            // Inner border for depth
            const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            innerRect.setAttribute('x', component.position.x + 2);
            innerRect.setAttribute('y', component.position.y + 2);
            innerRect.setAttribute('width', component.size.width - 4);
            innerRect.setAttribute('height', component.size.height - 4);
            innerRect.setAttribute('rx', '10');
            innerRect.setAttribute('fill', 'none');
            innerRect.setAttribute('stroke', 'rgba(255,255,255,0.2)');
            innerRect.setAttribute('stroke-width', '1');

            componentGroup.appendChild(shadow);
            componentGroup.appendChild(rect);
            componentGroup.appendChild(innerRect);

            // Component text with better layout
            this.addEnhancedComponentText(componentGroup, component);

            this.zoomGroup.appendChild(componentGroup);
        }

        // Add enhanced component text with better typography
        addEnhancedComponentText(group, component) {
            const centerX = component.position.x + component.size.width / 2;
            const startY = component.position.y + 30;

            // Main title
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('x', centerX);
            title.setAttribute('y', startY);
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('fill', '#ffffff');
            title.setAttribute('font-size', '15');
            title.setAttribute('font-weight', 'bold');
            title.textContent = component.name;

            // Technical name
            const techName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            techName.setAttribute('x', centerX);
            techName.setAttribute('y', startY + 20);
            techName.setAttribute('text-anchor', 'middle');
            techName.setAttribute('fill', 'rgba(255,255,255,0.8)');
            techName.setAttribute('font-size', '11');
            techName.setAttribute('font-style', 'italic');
            techName.textContent = `(${component.technical_name})`;

            group.appendChild(title);
            group.appendChild(techName);

            // Description text with word wrapping
            const description = component.description;
            const maxCharsPerLine = Math.floor((component.size.width - 20) / 6);
            const words = description.split(' ');
            let currentLine = '';
            let yOffset = startY + 45;

            words.forEach(word => {
                if ((currentLine + word).length > maxCharsPerLine && currentLine) {
                    const descLine = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    descLine.setAttribute('x', centerX);
                    descLine.setAttribute('y', yOffset);
                    descLine.setAttribute('text-anchor', 'middle');
                    descLine.setAttribute('fill', 'rgba(255,255,255,0.7)');
                    descLine.setAttribute('font-size', '10');
                    descLine.textContent = currentLine.trim();
                    group.appendChild(descLine);

                    currentLine = word + ' ';
                    yOffset += 15;
                } else {
                    currentLine += word + ' ';
                }
            });

            // Add remaining text
            if (currentLine.trim()) {
                const descLine = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                descLine.setAttribute('x', centerX);
                descLine.setAttribute('y', yOffset);
                descLine.setAttribute('text-anchor', 'middle');
                descLine.setAttribute('fill', 'rgba(255,255,255,0.7)');
                descLine.setAttribute('font-size', '10');
                descLine.textContent = currentLine.trim();
                group.appendChild(descLine);
            }
        }

        // Enhanced connection point calculation
        getConnectionPoint(fromComp, toComp) {
            const fromCenter = {
                x: fromComp.position.x + fromComp.size.width / 2,
                y: fromComp.position.y + fromComp.size.height / 2
            };
            const toCenter = {
                x: toComp.position.x + toComp.size.width / 2,
                y: toComp.position.y + toComp.size.height / 2
            };

            // Calculate edge point with better precision
            const dx = toCenter.x - fromCenter.x;
            const dy = toCenter.y - fromCenter.y;
            const angle = Math.atan2(dy, dx);

            const halfWidth = fromComp.size.width / 2;
            const halfHeight = fromComp.size.height / 2;

            let edgeX, edgeY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Connection is more horizontal
                edgeX = fromCenter.x + (dx > 0 ? halfWidth : -halfWidth);
                edgeY = fromCenter.y + (dx > 0 ? halfHeight : -halfHeight) * Math.tan(angle);
            } else {
                // Connection is more vertical
                edgeX = fromCenter.x + (dy > 0 ? halfWidth : -halfWidth) / Math.tan(angle);
                edgeY = fromCenter.y + (dy > 0 ? halfHeight : -halfHeight);
            }

            return { x: edgeX, y: edgeY };
        }

        // Setup enhanced zoom and pan
        setupZoomAndPan() {
            if (!this.svgElement || !this.zoomGroup) return;

            // Mouse wheel zoom
            this.svgElement.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 1.15 : 0.87;
                this.zoom(delta, e.clientX, e.clientY);
            });

            // Enhanced drag behavior
            let dragStart = null;

            this.svgElement.addEventListener('mousedown', (e) => {
                if (e.target.closest('.component') || e.target.closest('.block')) return;

                this.isDragging = true;
                dragStart = { x: e.clientX, y: e.clientY };
                this.svgElement.style.cursor = 'grabbing';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging || !dragStart) return;

                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;

                this.currentTransform.x += dx;
                this.currentTransform.y += dy;

                this.updateTransform();

                dragStart = { x: e.clientX, y: e.clientY };
            });

            document.addEventListener('mouseup', () => {
                this.isDragging = false;
                this.svgElement.style.cursor = 'grab';
                dragStart = null;
            });

            // Touch support
            this.setupTouchSupport();
        }

        // Setup touch support for mobile
        setupTouchSupport() {
            let touchStart = null;

            this.svgElement.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    touchStart = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                }
            });

            this.svgElement.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (e.touches.length === 1 && touchStart) {
                    const dx = e.touches[0].clientX - touchStart.x;
                    const dy = e.touches[0].clientY - touchStart.y;

                    this.currentTransform.x += dx;
                    this.currentTransform.y += dy;

                    this.updateTransform();

                    touchStart = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                }
            });

            this.svgElement.addEventListener('touchend', () => {
                touchStart = null;
            });
        }

        // Enhanced zoom function
        zoom(factor, centerX, centerY) {
            const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentTransform.scale * factor));

            if (newScale === this.currentTransform.scale) return;

            const rect = this.svgElement.getBoundingClientRect();
            const x = centerX - rect.left;
            const y = centerY - rect.top;

            const scaleFactor = newScale / this.currentTransform.scale;

            this.currentTransform.x = x - scaleFactor * (x - this.currentTransform.x);
            this.currentTransform.y = y - scaleFactor * (y - this.currentTransform.y);
            this.currentTransform.scale = newScale;

            this.updateTransform();
        }

        // Update SVG transform
        updateTransform() {
            if (this.zoomGroup) {
                this.zoomGroup.setAttribute('transform',
                    `translate(${this.currentTransform.x}, ${this.currentTransform.y}) scale(${this.currentTransform.scale})`
                );
            }
        }

        // Setup enhanced interactions
        setupInteractions() {
            // Component interactions
            this.svgElement.addEventListener('click', (e) => {
                const component = e.target.closest('.component');
                const block = e.target.closest('.block');

                if (component) {
                    e.stopPropagation();
                    const componentId = component.getAttribute('data-id');
                    this.selectComponent(componentId);
                } else if (block) {
                    e.stopPropagation();
                    const blockId = block.getAttribute('data-block-id');
                    this.selectBlock(blockId);
                } else {
                    this.deselectAll();
                }
            });

            // Enhanced hover effects
            this.svgElement.addEventListener('mouseover', (e) => {
                const component = e.target.closest('.component');
                const connection = e.target.closest('.connection-line');

                if (component && !this.isDragging) {
                    this.highlightComponent(component);
                } else if (connection) {
                    this.highlightConnection(connection);
                }
            });

            this.svgElement.addEventListener('mouseout', (e) => {
                const component = e.target.closest('.component');
                const connection = e.target.closest('.connection-line');

                if (component) {
                    this.unhighlightComponent(component);
                } else if (connection) {
                    this.unhighlightConnection(connection);
                }
            });
        }

        // Select and highlight component
        selectComponent(componentId) {
            this.deselectAll();

            const component = document.querySelector(`[data-id="${componentId}"]`);
            if (component) {
                component.classList.add('selected');
                this.selectedComponent = componentId;
                this.showComponentDetails(componentId);
                this.highlightRelatedConnections(componentId);
            }
        }

        // Select and highlight block
        selectBlock(blockId) {
            this.deselectAll();

            const block = document.querySelector(`[data-block-id="${blockId}"]`);
            if (block) {
                block.classList.add('selected');
                this.selectedBlock = blockId;
                this.showBlockDetails(blockId);
            }
        }

        // Show enhanced component details
        showComponentDetails(componentId) {
            const data = this.components[componentId];
            if (!data || !this.detailsContainer) return;

            const block = this.blocks[data.block];
            const connectionsHtml = data.connections.map(conn => {
                const connData = this.components[conn];
                return `<li><strong>${connData.name}</strong> (${connData.technical_name})</li>`;
            }).join('');

            const protocolsHtml = data.protocols.map(protocol =>
                `<span class="protocol-badge" style="background: ${data.color}20; color: ${data.color}; border: 1px solid ${data.color}40;">${protocol}</span>`
            ).join('');

            this.detailsContainer.innerHTML = `
                <div class="component-info">
                    <div class="component-header">
                        <h3 class="component-title">${data.name}</h3>
                        <span class="component-block" style="background: ${block.color}20; color: ${block.color};">${block.title}</span>
                    </div>
                    <p class="component-subtitle">${data.technical_name}</p>
                    <p class="component-description">${data.description}</p>
                    
                    <div class="component-details">
                        <h4>Подробное описание</h4>
                        <p>${data.details}</p>
                        
                        <h4>Протоколы взаимодействия</h4>
                        <div class="protocols">${protocolsHtml}</div>
                        
                        <h4>Связанные компоненты</h4>
                        <ul class="connections-list">${connectionsHtml}</ul>
                    </div>
                </div>
            `;
        }

        // Show block details
        showBlockDetails(blockId) {
            const block = this.blocks[blockId];
            if (!block || !this.detailsContainer) return;

            const componentsHtml = block.components.map(compId => {
                const comp = this.components[compId];
                return `<li><strong>${comp.name}</strong> - ${comp.technical_name}</li>`;
            }).join('');

            this.detailsContainer.innerHTML = `
                <div class="block-info">
                    <h3 class="block-title" style="color: ${block.color};">${block.title}</h3>
                    <p class="block-description">Архитектурный блок системы VulneraAI</p>
                    
                    <div class="block-details">
                        <h4>Компоненты блока</h4>
                        <ul class="block-components">${componentsHtml}</ul>
                        
                        <h4>Характеристики</h4>
                        <div class="block-specs">
                            <div class="spec-item">
                                <strong>Количество компонентов:</strong> ${block.components.length}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Show default info
        showDefaultInfo() {
            if (!this.detailsContainer) return;

            this.detailsContainer.innerHTML = `
                <div class="details-placeholder">
                    <h3>Архитектура VulneraAI</h3>
                    <p>Интерактивная блочная диаграмма системы с возможностями:</p>
                    <ul>
                        <li><strong>Зум и панорамирование</strong> - колесо мыши или управление</li>
                        <li><strong>Блоки системы</strong> - группировка по функциональности</li>
                        <li><strong>Детали компонентов</strong> - клик по элементам</li>
                        <li><strong>Связи между модулями</strong> - интерактивные соединения</li>
                    </ul>
                    
                    <div class="system-blocks">
                        <h4>Архитектурные блоки:</h4>
                        <div class="block-list">
                            <div class="block-item" style="border-left: 4px solid #1e40af;">
                                <strong>Интерфейс пользователя</strong>
                                <span>OpenWeb UI, Webhook уведомления</span>
                            </div>
                            <div class="block-item" style="border-left: 4px solid #7c2d12;">
                                <strong>Ядро системы</strong>
                                <span>API, Оркестратор, DataStream</span>
                            </div>
                            <div class="block-item" style="border-left: 4px solid #065f46;">
                                <strong>Инструменты и движки</strong>
                                <span>RAG, BattleNet, Tools, Kali Linux</span>
                            </div>
                        </div>
                    </div>
                    
                    <p><em>Нажмите на блок или компонент для получения подробной информации.</em></p>
                </div>
            `;
        }

        // Highlight component with enhanced effects
        highlightComponent(component) {
            const rect = component.querySelector('.component-rect');
            if (rect) {
                rect.style.filter = 'brightness(1.3) drop-shadow(0 0 15px rgba(59, 130, 246, 0.6))';
                rect.style.strokeWidth = '3';
                rect.style.transform = 'scale(1.02)';
                rect.style.transformOrigin = 'center';
            }
        }

        // Remove component highlight
        unhighlightComponent(component) {
            if (!component.classList.contains('selected')) {
                const rect = component.querySelector('.component-rect');
                if (rect) {
                    rect.style.filter = 'none';
                    rect.style.strokeWidth = '2';
                    rect.style.transform = 'scale(1)';
                }
            }
        }

        // Highlight connection
        highlightConnection(connection) {
            connection.style.strokeWidth = '5';
            connection.style.opacity = '1';
            connection.style.filter = 'drop-shadow(0 0 8px currentColor)';
        }

        // Remove connection highlight
        unhighlightConnection(connection) {
            connection.style.strokeWidth = '3';
            connection.style.opacity = '0.8';
            connection.style.filter = 'none';
        }

        // Highlight related connections
        highlightRelatedConnections(componentId) {
            // Dim all connections
            document.querySelectorAll('.connection-line').forEach(line => {
                line.style.opacity = '0.2';
            });

            // Highlight related connections
            const relatedConnections = this.connections.filter(conn =>
                conn.from === componentId || conn.to === componentId
            );

            relatedConnections.forEach(conn => {
                const line = document.querySelector(`[data-from="${conn.from}"][data-to="${conn.to}"]`);
                if (line) {
                    line.style.opacity = '1';
                    line.style.strokeWidth = '5';
                    line.style.filter = 'drop-shadow(0 0 10px currentColor)';
                }
            });

            // Reset after delay
            setTimeout(() => {
                document.querySelectorAll('.connection-line').forEach(line => {
                    line.style.opacity = '0.8';
                    line.style.strokeWidth = '3';
                    line.style.filter = 'none';
                });
            }, 3000);
        }

        // Deselect all elements
        deselectAll() {
            document.querySelectorAll('.component, .block').forEach(elem => {
                elem.classList.remove('selected');
            });

            document.querySelectorAll('.component .component-rect').forEach(rect => {
                rect.style.filter = 'none';
                rect.style.strokeWidth = '2';
                rect.style.transform = 'scale(1)';
            });

            this.selectedComponent = null;
            this.selectedBlock = null;
            this.showDefaultInfo();
        }

        // Add enhanced controls
        addEnhancedControls() {
            const controls = document.createElement('div');
            controls.className = 'diagram-controls';
            controls.innerHTML = `
                <button class="control-btn zoom-in" title="Увеличить">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                </button>
                <button class="control-btn zoom-out" title="Уменьшить">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                </button>
                <button class="control-btn zoom-reset" title="Сбросить">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                </button>
                <button class="control-btn fullscreen" title="Полный экран">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                </button>
            `;

            // Enhanced control styles
            const style = document.createElement('style');
            style.textContent = `
                .diagram-controls {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    z-index: 100;
                }
                
                .control-btn {
                    width: 44px;
                    height: 44px;
                    background: rgba(15, 15, 15, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(10px);
                }
                
                .control-btn:hover {
                    background: rgba(59, 130, 246, 0.9);
                    border-color: #3b82f6;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
                }
                
                .control-btn:active {
                    transform: translateY(0);
                }

                .protocol-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    margin: 2px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: bold;
                }

                .component-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .component-block {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .block-list {
                    margin-top: 16px;
                }

                .block-item {
                    padding: 12px;
                    margin: 8px 0;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                }

                .block-item strong {
                    display: block;
                    margin-bottom: 4px;
                }

                .block-item span {
                    color: #888;
                    font-size: 13px;
                }
            `;
            document.head.appendChild(style);

            const diagramContainer = document.querySelector('.architecture-diagram');
            if (diagramContainer) {
                diagramContainer.style.position = 'relative';
                diagramContainer.appendChild(controls);

                // Enhanced control handlers
                controls.querySelector('.zoom-in').addEventListener('click', () => {
                    this.zoom(1.25, this.svgElement.clientWidth / 2, this.svgElement.clientHeight / 2);
                });

                controls.querySelector('.zoom-out').addEventListener('click', () => {
                    this.zoom(0.8, this.svgElement.clientWidth / 2, this.svgElement.clientHeight / 2);
                });

                controls.querySelector('.zoom-reset').addEventListener('click', () => {
                    this.resetView();
                });

                controls.querySelector('.fullscreen').addEventListener('click', () => {
                    this.toggleFullscreen();
                });
            }
        }

        // Fit diagram to view
        fitToView() {
            const viewBox = this.svgElement.viewBox.baseVal;
            const containerRect = this.svgElement.getBoundingClientRect();

            const scaleX = containerRect.width / viewBox.width;
            const scaleY = containerRect.height / viewBox.height;
            const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

            this.currentTransform = {
                x: (containerRect.width - viewBox.width * scale) / 2,
                y: (containerRect.height - viewBox.height * scale) / 2,
                scale: scale
            };

            this.updateTransform();
        }

        // Reset view to default
        resetView() {
            this.currentTransform = { x: 0, y: 0, scale: 1 };
            this.updateTransform();
        }

        // Toggle fullscreen mode
        toggleFullscreen() {
            const container = document.querySelector('.architecture-container');
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(console.error);
            } else {
                document.exitFullscreen();
            }
        }
    }

    // Initialize the enhanced architecture manager
    window.architectureManager = new ArchitectureManager();

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.architectureManager.initialize();
        });
    } else {
        window.architectureManager.initialize();
    }

})();
