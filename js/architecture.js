// VulneraAI Architecture Module - Simplified Interactive Diagram (No Zoom/Pan)
// Features: Interactive components and blocks (click to see details), proper spacing between elements
(function () {
    'use strict';

    // Updated architecture blocks with better spacing
    const ARCHITECTURE_BLOCKS = {
        server: {
            title: "VulneraAI Server (Backend)",
            position: { x: 30, y: 70 },
            size: { width: 480, height: 420 },
            color: "#1e40af",
            components: ["api_gateway", "core_services", "storage", "queue"]
        },
        client: {
            title: "VulneraAI Client (Kali Linux)",
            position: { x: 550, y: 70 },
            size: { width: 380, height: 220 },
            color: "#047857",
            components: ["client_ui", "client_backend"]
        },
        integrations: {
            title: "Интеграции и внешние сервисы",
            position: { x: 550, y: 320 },
            size: { width: 380, height: 170 },
            color: "#7c2d12",
            components: ["gpt_tunnel", "monitoring", "webhooks"]
        }
    };

    // Updated components with proper spacing
    const architectureComponents = {
        api_gateway: {
            name: "API Gateway",
            technical_name: "FastAPI / Uvicorn",
            description: "REST API слой для клиентов и интеграций",
            details: "Отвечает за прием и маршрутизацию всех запросов от клиентов и интеграций. Реализован на FastAPI с Uvicorn в качестве ASGI-сервера. Поддерживает аутентификацию, rate limiting и базовую валидацию входных данных.",
            connections: ["core_services", "client_backend", "webhooks"],
            protocols: ["HTTPS/REST", "JSON"],
            position: { x: 50, y: 100 },
            size: { width: 200, height: 100 },
            color: "#3b82f6",
            block: "server"
        },
        core_services: {
            name: "Core Services",
            technical_name: "Pentests / Auth / Billing",
            description: "Бизнес-логика: пентесты, аккаунты, подписи",
            details: "Основной слой бизнес-логики VulneraAI. Управляет жизненным циклом пентестов, учётными записями, тарифами и фоновой обработкой задач. Все операции проходят через чётко определённые сервисные границы.",
            connections: ["api_gateway", "storage", "queue"],
            protocols: ["Internal API", "DB Queries"],
            position: { x: 280, y: 100 },
            size: { width: 200, height: 100 },
            color: "#f59e0b",
            block: "server"
        },
        storage: {
            name: "Хранилище данных",
            technical_name: "PostgreSQL / Redis",
            description: "Персистентные и кэширующие хранилища",
            details: "PostgreSQL хранит долгосрочные данные: пользователей, проекты, результаты пентестов. Redis используется для кэша, сессий и временных токенов. Это разделение дает баланс между надежностью и скоростью.",
            connections: ["core_services"],
            protocols: ["SQL", "Key/Value"],
            position: { x: 50, y: 240 },
            size: { width: 200, height: 100 },
            color: "#6366f1",
            block: "server"
        },
        queue: {
            name: "Очередь задач",
            technical_name: "RabbitMQ",
            description: "Асинхронные задания и обработка",
            details: "Очередь задач используется для фонового выполнения тяжелых операций: генерация отчетов, запуск сложных проверок, интеграция с внешними системами. Обеспечивает устойчивость и отказоустойчивость.",
            connections: ["core_services", "client_backend"],
            protocols: ["AMQP"],
            position: { x: 280, y: 240 },
            size: { width: 200, height: 100 },
            color: "#8b5cf6",
            block: "server"
        },
        client_ui: {
            name: "Client Web UI",
            technical_name: "React 18 / TypeScript",
            description: "Веб-интерфейс на Kali Linux",
            details: "Фронтенд клиента, работающий в браузере на машине Kali Linux. Предоставляет чат-подобный интерфейс, управление задачами и визуализацию результатов. Общается с локальным backend и центральным сервером.",
            connections: ["client_backend"],
            protocols: ["HTTP", "WebSocket"],
            position: { x: 570, y: 100 },
            size: { width: 160, height: 100 },
            color: "#10b981",
            block: "client"
        },
        client_backend: {
            name: "Client Backend Agent",
            technical_name: "FastAPI Agent",
            description: "Агент на Kali Linux для выполнения команд",
            details: "Локальный агент на FastAPI, запускаемый на Kali Linux. Принимает команды от центрального сервера и UI, выполняет реальные инструменты Kali и отправляет результаты обратно.",
            connections: ["client_ui", "api_gateway", "queue"],
            protocols: ["HTTP", "CLI"],
            position: { x: 760, y: 100 },
            size: { width: 160, height: 100 },
            color: "#22c55e",
            block: "client"
        },
        gpt_tunnel: {
            name: "GPT Tunnel",
            technical_name: "AI Processing",
            description: "Интеграция с ИИ для анализа и генерации",
            details: "Отдельный сервис/прокси для безопасного использования LLM/AI. Используется для анализа результатов, генерации рекомендаций, построения эксплойтов и других задач, где требуется мощный ИИ.",
            connections: ["core_services"],
            protocols: ["HTTPS", "API"],
            position: { x: 570, y: 340 },
            size: { width: 170, height: 90 },
            color: "#f97316",
            block: "integrations"
        },
        monitoring: {
            name: "Мониторинг",
            technical_name: "Metrics / Logs",
            description: "Метрики и логирование системы",
            details: "Подсистема мониторинга собирает технические метрики и логи для анализа производительности и стабильности. Используется для alerting и отладки в продакшене.",
            connections: ["core_services", "client_backend"],
            protocols: ["Metrics", "Logs"],
            position: { x: 760, y: 340 },
            size: { width: 160, height: 90 },
            color: "#e5e7eb",
            block: "integrations"
        },
        webhooks: {
            name: "Webhooks",
            technical_name: "Уведомления",
            description: "Обратные вызовы для интеграций",
            details: "Webhook-уведомления позволяют интегрировать VulneraAI с внешними системами: тикет-трекеры, SIEM, корпоративные порталы. Отправляют события о статусе пентестов и важных результатах.",
            connections: ["api_gateway"],
            protocols: ["HTTP"],
            position: { x: 570, y: 450 },
            size: { width: 350, height: 60 },
            color: "#ec4899",
            block: "integrations"
        }
    };

    // Simplified connection definitions
    const connections = [
        { from: "client_ui", to: "client_backend", type: "HTTP", label: "UI → Agent", color: "#22c55e" },
        { from: "client_backend", to: "api_gateway", type: "HTTPS", label: "Agent ↔ Server", color: "#3b82f6" },
        { from: "api_gateway", to: "core_services", type: "Internal", label: "Route", color: "#f59e0b" },
        { from: "core_services", to: "storage", type: "DB", label: "Persist", color: "#6366f1" },
        { from: "core_services", to: "queue", type: "AMQP", label: "Queue", color: "#8b5cf6" },
        { from: "core_services", to: "gpt_tunnel", type: "HTTPS", label: "AI", color: "#f97316" },
        { from: "core_services", to: "webhooks", type: "HTTP", label: "Events", color: "#ec4899" },
        { from: "core_services", to: "monitoring", type: "Metrics", label: "Observe", color: "#e5e7eb" },
        { from: "client_backend", to: "monitoring", type: "Metrics", label: "Metrics", color: "#e5e7eb" },
        { from: "queue", to: "client_backend", type: "Tasks", label: "Tasks", color: "#8b5cf6" }
    ];

    class ArchitectureManager {
        constructor() {
            this.components = architectureComponents;
            this.blocks = ARCHITECTURE_BLOCKS;
            this.connections = connections;
            this.selectedComponent = null;
            this.selectedBlock = null;
            this.detailsContainer = null;
            this.svgElement = null;
        }

        initialize() {
            this.detailsContainer = document.getElementById('componentDetails');
            if (!this.detailsContainer) {
                console.warn('Architecture: Details container not found');
                return;
            }

            this.createSVGDiagram();
            this.setupInteractions();
            this.showDefaultInfo();
        }

        createSVGDiagram() {
            const diagramContainer = document.querySelector('.architecture-diagram');
            if (!diagramContainer) return;

            diagramContainer.innerHTML = '';

            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgElement.setAttribute('width', '100%');
            this.svgElement.setAttribute('height', '600');
            this.svgElement.setAttribute('viewBox', '0 0 1000 600');
            this.svgElement.style.background = '#020617';

            const defs = this.createDefs();
            this.svgElement.appendChild(defs);

            const rootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            rootGroup.setAttribute('class', 'root-group');
            this.svgElement.appendChild(rootGroup);

            this.drawBlocks(rootGroup);
            this.drawConnections(rootGroup);
            this.drawComponents(rootGroup);

            diagramContainer.appendChild(this.svgElement);
        }

        createDefs() {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

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
                stop1.setAttribute('stop-opacity', '0.05');

                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '100%');
                stop2.setAttribute('stop-color', block.color);
                stop2.setAttribute('stop-opacity', '0.12');

                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                defs.appendChild(gradient);
            });

            return defs;
        }

        drawBlocks(rootGroup) {
            const blocksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            blocksGroup.setAttribute('class', 'blocks');

            Object.keys(this.blocks).forEach(blockId => {
                const block = this.blocks[blockId];
                const blockGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                blockGroup.setAttribute('class', 'block');
                blockGroup.setAttribute('data-block-id', blockId);

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', block.position.x);
                rect.setAttribute('y', block.position.y);
                rect.setAttribute('width', block.size.width);
                rect.setAttribute('height', block.size.height);
                rect.setAttribute('rx', '12');
                rect.setAttribute('fill', `url(#block-gradient-${blockId})`);
                rect.setAttribute('stroke', block.color);
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('stroke-dasharray', '8,4');
                rect.setAttribute('opacity', '0.5');

                const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                title.setAttribute('x', block.position.x + block.size.width / 2);
                title.setAttribute('y', block.position.y + 25);
                title.setAttribute('text-anchor', 'middle');
                title.setAttribute('fill', block.color);
                title.setAttribute('font-size', '14');
                title.setAttribute('font-weight', 'bold');
                title.textContent = block.title;

                blockGroup.appendChild(rect);
                blockGroup.appendChild(title);
                blocksGroup.appendChild(blockGroup);
            });

            rootGroup.appendChild(blocksGroup);
        }

        drawConnections(rootGroup) {
            const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            connectionsGroup.setAttribute('class', 'connections');

            this.connections.forEach(conn => {
                const fromComp = this.components[conn.from];
                const toComp = this.components[conn.to];
                if (!fromComp || !toComp) return;

                const fromPoint = this.getConnectionPoint(fromComp, toComp);
                const toPoint = this.getConnectionPoint(toComp, fromComp);

                const path = this.createCurvedPath(fromPoint, toPoint);
                path.setAttribute('stroke', conn.color);
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                path.setAttribute('class', 'connection-line');
                path.setAttribute('data-from', conn.from);
                path.setAttribute('data-to', conn.to);
                path.setAttribute('opacity', '0.7');

                connectionsGroup.appendChild(path);

                const midPoint = this.getPathMidpoint(fromPoint, toPoint);
                const labelGroup = this.createConnectionLabel(conn, midPoint);
                connectionsGroup.appendChild(labelGroup);
            });

            rootGroup.appendChild(connectionsGroup);
        }

        createCurvedPath(from, to) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const controlOffset = Math.min(distance * 0.25, 60);

            const cp1x = from.x + (dx > 0 ? controlOffset : -controlOffset);
            const cp1y = from.y;
            const cp2x = to.x - (dx > 0 ? controlOffset : -controlOffset);
            const cp2y = to.y;

            const pathData = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
            path.setAttribute('d', pathData);

            return path;
        }

        getPathMidpoint(from, to) {
            return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        }

        createConnectionLabel(conn, midPoint) {
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('class', 'connection-label');

            const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            labelBg.setAttribute('x', midPoint.x - 40);
            labelBg.setAttribute('y', midPoint.y - 16);
            labelBg.setAttribute('width', '80');
            labelBg.setAttribute('height', '28');
            labelBg.setAttribute('fill', '#020617');
            labelBg.setAttribute('stroke', conn.color);
            labelBg.setAttribute('stroke-width', '1');
            labelBg.setAttribute('rx', '4');
            labelBg.setAttribute('opacity', '0.9');

            const protocolText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            protocolText.setAttribute('x', midPoint.x);
            protocolText.setAttribute('y', midPoint.y - 2);
            protocolText.setAttribute('text-anchor', 'middle');
            protocolText.setAttribute('fill', conn.color);
            protocolText.setAttribute('font-size', '9');
            protocolText.setAttribute('font-weight', 'bold');
            protocolText.textContent = conn.type;

            const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            descText.setAttribute('x', midPoint.x);
            descText.setAttribute('y', midPoint.y + 8);
            descText.setAttribute('text-anchor', 'middle');
            descText.setAttribute('fill', '#9ca3af');
            descText.setAttribute('font-size', '8');
            descText.textContent = conn.label;

            labelGroup.appendChild(labelBg);
            labelGroup.appendChild(protocolText);
            labelGroup.appendChild(descText);

            return labelGroup;
        }

        drawComponents(rootGroup) {
            Object.keys(this.components).forEach(id => {
                const component = this.components[id];
                this.drawComponent(rootGroup, id, component);
            });
        }

        drawComponent(rootGroup, id, component) {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'component');
            group.setAttribute('data-id', id);
            group.style.cursor = 'pointer';

            const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shadow.setAttribute('x', component.position.x + 2);
            shadow.setAttribute('y', component.position.y + 2);
            shadow.setAttribute('width', component.size.width);
            shadow.setAttribute('height', component.size.height);
            shadow.setAttribute('rx', '8');
            shadow.setAttribute('fill', 'rgba(0,0,0,0.3)');

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', component.position.x);
            rect.setAttribute('y', component.position.y);
            rect.setAttribute('width', component.size.width);
            rect.setAttribute('height', component.size.height);
            rect.setAttribute('rx', '8');
            rect.setAttribute('fill', `url(#gradient-${id})`);
            rect.setAttribute('stroke', component.color);
            rect.setAttribute('stroke-width', '2');

            const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            innerRect.setAttribute('x', component.position.x + 1.5);
            innerRect.setAttribute('y', component.position.y + 1.5);
            innerRect.setAttribute('width', component.size.width - 3);
            innerRect.setAttribute('height', component.size.height - 3);
            innerRect.setAttribute('rx', '6.5');
            innerRect.setAttribute('fill', 'none');
            innerRect.setAttribute('stroke', 'rgba(255,255,255,0.2)');
            innerRect.setAttribute('stroke-width', '0.5');

            group.appendChild(shadow);
            group.appendChild(rect);
            group.appendChild(innerRect);

            this.addComponentText(group, component);
            rootGroup.appendChild(group);
        }

        addComponentText(group, component) {
            const centerX = component.position.x + component.size.width / 2;
            const startY = component.position.y + 22;

            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('x', centerX);
            title.setAttribute('y', startY);
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('fill', '#ffffff');
            title.setAttribute('font-size', '12');
            title.setAttribute('font-weight', 'bold');
            title.textContent = component.name;

            const techName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            techName.setAttribute('x', centerX);
            techName.setAttribute('y', startY + 14);
            techName.setAttribute('text-anchor', 'middle');
            techName.setAttribute('fill', 'rgba(255,255,255,0.75)');
            techName.setAttribute('font-size', '9');
            techName.setAttribute('font-style', 'italic');
            techName.textContent = `(${component.technical_name})`;

            group.appendChild(title);
            group.appendChild(techName);

            const description = component.description;
            const maxCharsPerLine = Math.floor((component.size.width - 12) / 5.5);
            const words = description.split(' ');
            let currentLine = '';
            let yOffset = startY + 30;

            words.forEach(word => {
                if ((currentLine + word).length > maxCharsPerLine && currentLine) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    line.setAttribute('x', centerX);
                    line.setAttribute('y', yOffset);
                    line.setAttribute('text-anchor', 'middle');
                    line.setAttribute('fill', 'rgba(255,255,255,0.7)');
                    line.setAttribute('font-size', '8');
                    line.textContent = currentLine.trim();
                    group.appendChild(line);

                    currentLine = word + ' ';
                    yOffset += 11;
                } else {
                    currentLine += word + ' ';
                }
            });

            if (currentLine.trim()) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                line.setAttribute('x', centerX);
                line.setAttribute('y', yOffset);
                line.setAttribute('text-anchor', 'middle');
                line.setAttribute('fill', 'rgba(255,255,255,0.7)');
                line.setAttribute('font-size', '8');
                line.textContent = currentLine.trim();
                group.appendChild(line);
            }
        }

        getConnectionPoint(fromComp, toComp) {
            const fromCenter = {
                x: fromComp.position.x + fromComp.size.width / 2,
                y: fromComp.position.y + fromComp.size.height / 2
            };
            const toCenter = {
                x: toComp.position.x + toComp.size.width / 2,
                y: toComp.position.y + toComp.size.height / 2
            };

            const dx = toCenter.x - fromCenter.x;
            const dy = toCenter.y - fromCenter.y;
            const angle = Math.atan2(dy, dx);

            const halfWidth = fromComp.size.width / 2;
            const halfHeight = fromComp.size.height / 2;

            let edgeX, edgeY;

            if (Math.abs(dx) > Math.abs(dy)) {
                edgeX = fromCenter.x + (dx > 0 ? halfWidth : -halfWidth);
                edgeY = fromCenter.y + (halfHeight * Math.tan(angle));
            } else {
                edgeX = fromCenter.x + (halfWidth / Math.tan(angle));
                edgeY = fromCenter.y + (dy > 0 ? halfHeight : -halfHeight);
            }

            return { x: edgeX, y: edgeY };
        }

        setupInteractions() {
            if (!this.svgElement) return;

            this.svgElement.addEventListener('click', (e) => {
                const component = e.target.closest('.component');
                const block = e.target.closest('.block');

                if (component) {
                    e.stopPropagation();
                    const id = component.getAttribute('data-id');
                    this.selectComponent(id);
                } else if (block) {
                    e.stopPropagation();
                    const id = block.getAttribute('data-block-id');
                    this.selectBlock(id);
                } else {
                    this.deselectAll();
                    this.showDefaultInfo();
                }
            });

            this.svgElement.addEventListener('mouseover', (e) => {
                const component = e.target.closest('.component');
                const connection = e.target.closest('.connection-line');

                if (component) {
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

        selectBlock(blockId) {
            this.deselectAll();
            const block = document.querySelector(`[data-block-id="${blockId}"]`);
            if (block) {
                block.classList.add('selected');
                this.selectedBlock = blockId;
                this.showBlockDetails(blockId);
            }
        }

        showComponentDetails(componentId) {
            const data = this.components[componentId];
            if (!data || !this.detailsContainer) return;

            const block = this.blocks[data.block];
            const connectionsHtml = data.connections.map(conn => {
                const connData = this.components[conn];
                return `<span class="connection-tag" style="background-color: ${connData ? connData.color : '#666'}40; color: ${connData ? connData.color : '#666'}; border-color: ${connData ? connData.color : '#666'};">${connData ? connData.name : conn}</span>`;
            }).join('');

            const protocolsHtml = data.protocols.map(protocol =>
                `<span class="protocol-tag">${protocol}</span>`
            ).join('');

            this.detailsContainer.innerHTML = `
                <div class="component-details-header" style="border-left: 4px solid ${data.color};">
                    <div class="component-name">${data.name}</div>
                    <div class="component-technical-name">${data.technical_name}</div>
                </div>
                
                <div class="component-details-content">
                    <div class="component-description">
                        <h4>Описание</h4>
                        <p>${data.description}</p>
                    </div>
                    
                    <div class="component-full-details">
                        <h4>Подробности</h4>
                        <p>${data.details}</p>
                    </div>
                    
                    <div class="component-connections">
                        <h4>Подключения</h4>
                        <div class="connections-list">${connectionsHtml}</div>
                    </div>
                    
                    <div class="component-protocols">
                        <h4>Протоколы</h4>
                        <div class="protocols-list">${protocolsHtml}</div>
                    </div>
                    
                    <div class="component-block-info">
                        <h4>Архитектурный блок</h4>
                        <div class="block-name" style="color: ${block.color};">${block.title}</div>
                    </div>
                </div>
            `;
        }

        showBlockDetails(blockId) {
            const blockData = this.blocks[blockId];
            if (!blockData || !this.detailsContainer) return;

            const componentsInBlock = blockData.components.map(compId => {
                const comp = this.components[compId];
                return `<div class="block-component" style="border-left: 3px solid ${comp.color};">
                    <div class="block-component-name">${comp.name}</div>
                    <div class="block-component-description">${comp.description}</div>
                </div>`;
            }).join('');

            this.detailsContainer.innerHTML = `
                <div class="block-details-header" style="border-left: 4px solid ${blockData.color};">
                    <div class="block-title">${blockData.title}</div>
                    <div class="block-subtitle">Архитектурный блок системы VulneraAI</div>
                </div>
                
                <div class="block-details-content">
                    <div class="block-description">
                        <h4>Компоненты блока</h4>
                        <div class="block-components-list">${componentsInBlock}</div>
                    </div>
                </div>
            `;
        }

        showDefaultInfo() {
            if (!this.detailsContainer) return;

            this.detailsContainer.innerHTML = `
                <div class="default-info">
                    <div class="default-info-header">
                        <div class="default-info-title">Архитектура VulneraAI</div>
                        <div class="default-info-subtitle">Server + Kali Client + Integrations</div>
                    </div>
                    
                    <div class="default-info-content">
                        <div class="default-info-description">
                            <h4>Интерактивная диаграмма:</h4>
                            <ul>
                                <li>🖱️ Нажмите на компонент для подробного описания</li>
                                <li>📦 Нажмите на блок (Server / Client / Integrations) для обзора</li>
                                <li>🧠 Видно как Client на Kali связан с сервером и ИИ</li>
                            </ul>
                            <p><em>*Диаграмма отражает актуальную архитектуру VulneraAI: FastAPI сервер, Kali клиент и внешние интеграции.*</em></p>
                        </div>
                    </div>
                </div>
            `;
        }

        deselectAll() {
            document.querySelectorAll('.selected').forEach(elem => {
                elem.classList.remove('selected');
            });
            this.selectedComponent = null;
            this.selectedBlock = null;
        }

        highlightComponent(component) {
            component.style.filter = 'brightness(1.1)';
        }

        unhighlightComponent(component) {
            component.style.filter = '';
        }

        highlightConnection(connection) {
            connection.style.strokeWidth = '3.5';
            connection.style.opacity = '1';
        }

        unhighlightConnection(connection) {
            connection.style.strokeWidth = '2';
            connection.style.opacity = '0.7';
        }

        highlightRelatedConnections(componentId) {
            const conns = document.querySelectorAll('.connection-line');
            conns.forEach(conn => {
                const from = conn.getAttribute('data-from');
                const to = conn.getAttribute('data-to');
                if (from === componentId || to === componentId) {
                    this.highlightConnection(conn);
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const architectureManager = new ArchitectureManager();
        architectureManager.initialize();
        window.VulneraAIArchitecture = architectureManager;
    });
})();
