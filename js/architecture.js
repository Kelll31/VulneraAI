// VulneraAI Architecture Diagram - Improved Spacing & Bidirectional Arrows
(function () {
    'use strict';

    class VulneraAIArchitecture {
        constructor() {
            this.nodes = [];
            this.edges = [];
            this.selectedNode = null;
            this.hoveredNode = null;
            this.svg = null;
            this.detailsPanel = null;
            this.width = 1400;  // Увеличена ширина
            this.height = 650;  // Увеличена высота
            this.nodeRadius = 55;
            this.nodesMap = new Map();
        }

        initialize() {
            this.detailsPanel = document.getElementById('componentDetails');
            if (!this.detailsPanel) return;

            this.defineCompleteArchitecture();
            this.updateNodesMap();
            this.createDiagram();
            this.setupForceSimulation();
            this.render();
            this.showWelcome();
            this.setupGlobalEvents();
        }

        defineCompleteArchitecture() {
            this.nodes = [
                // AGENT BLOCK
                { id: 'agent_api', name: 'Agent (FastAPI)', tech: 'FastAPI/Uvicorn', group: 'agent', color: '#3b82f6', size: 1.2 },
                { id: 'auth', name: 'Authentication', tech: 'JWT', group: 'agent', color: '#0ea5e9', size: 0.9 },
                { id: 'sessions', name: 'Sessions', tech: 'Commands Execution', group: 'agent', color: '#10b981', size: 1.0 },
                { id: 'instance', name: 'Instance Mgmt', tech: 'System Status', group: 'agent', color: '#f59e0b', size: 0.9 },
                { id: 'health', name: 'Health Monitor', tech: 'Metrics', group: 'agent', color: '#8b5cf6', size: 0.8 },

                // STORAGE BLOCK
                { id: 'postgres', name: 'PostgreSQL', tech: 'Data Storage', group: 'storage', color: '#6366f1', size: 1.1 },
                { id: 'redis', name: 'Redis', tech: 'Cache & Queues', group: 'storage', color: '#ec4899', size: 1.1 }
            ];

            // Связи с указанием двухсторонних
            this.edges = [
                { source: 'agent_api', target: 'auth', protocol: 'Internal', bidirectional: true },
                { source: 'agent_api', target: 'sessions', protocol: 'Internal', bidirectional: true },
                { source: 'agent_api', target: 'instance', protocol: 'Internal', bidirectional: true },
                { source: 'agent_api', target: 'health', protocol: 'Internal', bidirectional: true },
                { source: 'agent_api', target: 'postgres', protocol: 'SQL', bidirectional: true },
                { source: 'agent_api', target: 'redis', protocol: 'TCP', bidirectional: true },
                { source: 'sessions', target: 'redis', protocol: 'Tasks', bidirectional: true },
                { source: 'auth', target: 'postgres', protocol: 'SQL', bidirectional: true }
            ];
        }

        updateNodesMap() {
            this.nodesMap.clear();
            this.nodes.forEach(node => {
                this.nodesMap.set(node.id, node);
            });
        }

        createDiagram() {
            const container = document.querySelector('.architecture-diagram');
            if (!container) return;

            container.innerHTML = '';

            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('width', '100%');
            this.svg.setAttribute('height', '650');
            this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
            this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            this.svg.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
            this.svg.style.borderRadius = '12px';

            this.createDefs();
            container.appendChild(this.svg);
        }

        createDefs() {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

            // Градиенты
            const gradients = [
                { id: 'serverGrad', colors: ['#1e40af', '#3b82f6'] },
                { id: 'clientGrad', colors: ['#047857', '#10b981'] },
                { id: 'integrationGrad', colors: ['#c2410c', '#f97316'] }
            ];

            gradients.forEach(grad => {
                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                gradient.setAttribute('id', grad.id);
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '100%');
                gradient.setAttribute('y2', '100%');

                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop1.setAttribute('offset', '0%');
                stop1.setAttribute('stop-color', grad.colors[0]);

                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '100%');
                stop2.setAttribute('stop-color', grad.colors[1]);

                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                defs.appendChild(gradient);
            });

            // Фильтр свечения
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            glow.setAttribute('id', 'glow');
            glow.setAttribute('x', '-50%');
            glow.setAttribute('y', '-50%');
            glow.setAttribute('width', '200%');
            glow.setAttribute('height', '200%');
            glow.innerHTML = `
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            `;
            defs.appendChild(glow);

            // Маркеры стрелок (обычные и двухсторонние)
            const markers = [
                { id: 'arrow-normal', color: '#64748b' },
                { id: 'arrow-active', color: '#3b82f6' },
                { id: 'arrow-bidirectional', color: '#10b981' }
            ];

            markers.forEach(m => {
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', m.id);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '10');
                marker.setAttribute('refX', '9');
                marker.setAttribute('refY', '3');
                marker.setAttribute('orient', 'auto');
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '0 0, 10 3, 0 6');
                polygon.setAttribute('fill', m.color);
                marker.appendChild(polygon);
                defs.appendChild(marker);
            });

            this.svg.appendChild(defs);
        }

        setupForceSimulation() {
            // Увеличенные расстояния между группами
            const groupCenters = {
                agent: { x: 400, y: 330 },       // Левая группа
                storage: { x: 1000, y: 330 },    // Правая группа
                integration: { x: 1120, y: 340 } // Оставлено для совместимости
            };

            this.nodes.forEach(node => {
                const center = groupCenters[node.group];
                node.x = center.x + (Math.random() - 0.5) * 100;
                node.y = center.y + (Math.random() - 0.5) * 100;
            });

            this.runPhysicsSimulation();
        }

        runPhysicsSimulation() {
            const iterations = 300;
            const baseAlpha = 0.5;

            for (let iteration = 0; iteration < iterations; iteration++) {
                const alpha = baseAlpha * (1 - iteration / iterations);

                // Отталкивание - увеличенный коэффициент
                for (let i = 0; i < this.nodes.length; i++) {
                    for (let j = i + 1; j < this.nodes.length; j++) {
                        const n1 = this.nodes[i];
                        const n2 = this.nodes[j];

                        const dx = n2.x - n1.x;
                        const dy = n2.y - n1.y;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                        const minDist = (n1.size + n2.size) * this.nodeRadius * 2.5; // Увеличено

                        if (distance < minDist) {
                            const force = alpha * (minDist - distance) / distance * 0.6;
                            const fx = dx * force;
                            const fy = dy * force;

                            n1.x -= fx;
                            n1.y -= fy;
                            n2.x += fx;
                            n2.y += fy;
                        }
                    }
                }

                // Притяжение по связям
                this.edges.forEach(edge => {
                    const source = this.nodesMap.get(edge.source);
                    const target = this.nodesMap.get(edge.target);

                    if (source && target) {
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                        const idealDistance = 220; // Увеличено
                        const force = alpha * (distance - idealDistance) / distance * 0.15;

                        const fx = dx * force;
                        const fy = dy * force;

                        source.x += fx;
                        source.y += fy;
                        target.x -= fx;
                        target.y -= fy;
                    }
                });

                // Группировка
                const groups = { agent: [], storage: [], integration: [] };
                this.nodes.forEach(n => {
                    if (groups[n.group]) groups[n.group].push(n);
                });

                Object.keys(groups).forEach(groupName => {
                    const groupNodes = groups[groupName];
                    if (groupNodes.length === 0) return;

                    const centerX = groupNodes.reduce((sum, n) => sum + n.x, 0) / groupNodes.length;
                    const centerY = groupNodes.reduce((sum, n) => sum + n.y, 0) / groupNodes.length;

                    groupNodes.forEach(n => {
                        const dx = centerX - n.x;
                        const dy = centerY - n.y;
                        n.x += dx * alpha * 0.1;
                        n.y += dy * alpha * 0.1;
                    });
                });

                // Границы
                this.nodes.forEach(n => {
                    const margin = this.nodeRadius * n.size + 30;
                    n.x = Math.max(margin, Math.min(this.width - margin, n.x));
                    n.y = Math.max(margin + 50, Math.min(this.height - margin - 50, n.y));
                });
            }
        }

        render() {
            this.drawGroupBoundaries();
            this.drawAllNodes();
            this.drawLegend();
            this.drawTitle();
        }

        drawGroupBoundaries() {
            const groups = {
                agent: { nodes: [], color: '#3b82f6', name: 'Agent', gradient: 'serverGrad' },
                storage: { nodes: [], color: '#10b981', name: 'Storage', gradient: 'clientGrad' }
            };

            this.nodes.forEach(n => {
                if (groups[n.group]) groups[n.group].nodes.push(n);
            });

            Object.keys(groups).forEach(key => {
                const group = groups[key];
                if (group.nodes.length === 0) return;

                const xs = group.nodes.map(n => n.x);
                const ys = group.nodes.map(n => n.y);
                const padding = 80; // Увеличен padding

                const minX = Math.min(...xs) - padding;
                const maxX = Math.max(...xs) + padding;
                const minY = Math.min(...ys) - padding;
                const maxY = Math.max(...ys) + padding;

                // Фон
                const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bgRect.setAttribute('x', minX);
                bgRect.setAttribute('y', minY);
                bgRect.setAttribute('width', maxX - minX);
                bgRect.setAttribute('height', maxY - minY);
                bgRect.setAttribute('rx', '20');
                bgRect.setAttribute('fill', `url(#${group.gradient})`);
                bgRect.setAttribute('opacity', '0.05');
                this.svg.appendChild(bgRect);

                // Граница
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', minX);
                rect.setAttribute('y', minY);
                rect.setAttribute('width', maxX - minX);
                rect.setAttribute('height', maxY - minY);
                rect.setAttribute('rx', '20');
                rect.setAttribute('fill', 'none');
                rect.setAttribute('stroke', group.color);
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('stroke-dasharray', '10,5');
                rect.setAttribute('opacity', '0.4');
                this.svg.appendChild(rect);

                // Заголовок
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', minX + 20);
                text.setAttribute('y', minY + 25);
                text.setAttribute('fill', group.color);
                text.setAttribute('font-size', '15');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('filter', 'url(#glow)');
                text.textContent = group.name;
                this.svg.appendChild(text);

                // Счётчик
                const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                count.setAttribute('x', maxX - 20);
                count.setAttribute('y', minY + 25);
                count.setAttribute('text-anchor', 'end');
                count.setAttribute('fill', group.color);
                count.setAttribute('font-size', '12');
                count.setAttribute('opacity', '0.6');
                count.textContent = `${group.nodes.length} components`;
                this.svg.appendChild(count);
            });
        }

        drawAllNodes() {
            this.nodes.forEach(node => this.drawNode(node));
        }

        drawNode(node) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'node');
            g.setAttribute('data-id', node.id);
            g.style.cursor = 'pointer';

            const radius = this.nodeRadius * node.size;

            // Внешнее кольцо
            const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outerCircle.setAttribute('cx', node.x);
            outerCircle.setAttribute('cy', node.y);
            outerCircle.setAttribute('r', radius + 3);
            outerCircle.setAttribute('fill', 'none');
            outerCircle.setAttribute('stroke', node.color);
            outerCircle.setAttribute('stroke-width', '1');
            outerCircle.setAttribute('opacity', '0.3');
            g.appendChild(outerCircle);

            // Основной круг
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', node.color);
            circle.setAttribute('opacity', '0.85');
            circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
            circle.setAttribute('stroke-width', '2');
            g.appendChild(circle);

            // Название
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('x', node.x);
            title.setAttribute('y', node.y - 8);
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('fill', '#ffffff');
            title.setAttribute('font-size', '14');
            title.setAttribute('font-weight', 'bold');
            title.setAttribute('pointer-events', 'none');
            title.textContent = node.name;
            g.appendChild(title);

            // Технология
            const tech = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tech.setAttribute('x', node.x);
            tech.setAttribute('y', node.y + 8);
            tech.setAttribute('text-anchor', 'middle');
            tech.setAttribute('fill', 'rgba(255,255,255,0.7)');
            tech.setAttribute('font-size', '11');
            tech.setAttribute('pointer-events', 'none');
            tech.textContent = node.tech;
            g.appendChild(tech);

            // События
            g.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectNode(node);
            });

            g.addEventListener('mouseenter', () => {
                circle.setAttribute('opacity', '1');
                circle.setAttribute('stroke', '#ffffff');
                circle.setAttribute('stroke-width', '3');
                circle.setAttribute('filter', 'url(#glow)');
                outerCircle.setAttribute('opacity', '0.6');
                this.showConnections(node);
            });

            g.addEventListener('mouseleave', () => {
                if (this.selectedNode !== node) {
                    circle.setAttribute('opacity', '0.85');
                    circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
                    circle.setAttribute('stroke-width', '2');
                    circle.removeAttribute('filter');
                    outerCircle.setAttribute('opacity', '0.3');
                }
                this.hideConnections();
            });

            this.svg.appendChild(g);
        }

        showConnections(node) {
            const connectedEdges = this.edges.filter(e =>
                e.source === node.id || e.target === node.id
            );

            connectedEdges.forEach(edge => {
                const source = this.nodesMap.get(edge.source);
                const target = this.nodesMap.get(edge.target);

                if (source && target) {
                    this.drawConnection(source, target, edge, true);
                }
            });
        }

        drawConnection(source, target, edge, isActive = false) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'connection-line');

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const sourceRadius = this.nodeRadius * source.size;
            const targetRadius = this.nodeRadius * target.size;

            const startX = source.x + (dx / distance) * sourceRadius;
            const startY = source.y + (dy / distance) * sourceRadius;
            const endX = target.x - (dx / distance) * targetRadius;
            const endY = target.y - (dy / distance) * targetRadius;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const perpX = -(dy / distance) * 30;
            const perpY = (dx / distance) * 30;

            const controlX = midX + perpX;
            const controlY = midY + perpY;

            // Основная линия
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
            path.setAttribute('d', d);

            // Двухсторонние стрелки - другой цвет
            if (edge.bidirectional) {
                path.setAttribute('stroke', isActive ? '#10b981' : '#64748b');
                path.setAttribute('marker-end', 'url(#arrow-bidirectional)');
                path.setAttribute('marker-start', 'url(#arrow-bidirectional)');
                path.setAttribute('stroke-dasharray', '5,3');
            } else {
                path.setAttribute('stroke', isActive ? '#3b82f6' : '#64748b');
                path.setAttribute('marker-end', `url(#arrow-${isActive ? 'active' : 'normal'})`);
            }

            path.setAttribute('stroke-width', isActive ? '2.5' : '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', isActive ? '0.8' : '0.5');
            g.appendChild(path);

            // Метка протокола
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', controlX);
            text.setAttribute('y', controlY - 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', edge.bidirectional ? '#10b981' : (isActive ? '#3b82f6' : '#64748b'));
            text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', 'bold');
            text.textContent = edge.protocol + (edge.bidirectional ? ' ⇄' : '');
            g.appendChild(text);

            this.svg.insertBefore(g, this.svg.firstChild.nextSibling);
        }

        hideConnections() {
            this.svg.querySelectorAll('.connection-line').forEach(conn => conn.remove());
        }

        selectNode(node) {
            this.selectedNode = node;

            const nodes = this.svg.querySelectorAll('.node');
            nodes.forEach(n => {
                const circle = n.querySelector('circle:nth-child(2)');
                const outerCircle = n.querySelector('circle:first-child');

                if (n.getAttribute('data-id') === node.id) {
                    circle.setAttribute('opacity', '1');
                    circle.setAttribute('stroke', '#ffffff');
                    circle.setAttribute('stroke-width', '3');
                    circle.setAttribute('filter', 'url(#glow)');
                    outerCircle.setAttribute('opacity', '0.6');
                } else {
                    circle.setAttribute('opacity', '0.85');
                    circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
                    circle.setAttribute('stroke-width', '2');
                    circle.removeAttribute('filter');
                    outerCircle.setAttribute('opacity', '0.3');
                }
            });

            this.showNodeDetails(node);
        }

        showNodeDetails(node) {
            const details = this.getComponentDetails(node.id);
            const connections = this.getNodeConnections(node);

            this.detailsPanel.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, ${node.color}22 0%, ${node.color}11 100%);
                    border-left: 4px solid ${node.color};
                    border-radius: 12px;
                    padding: 24px;
                    animation: slideIn 0.3s ease;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center;">
                            <div style="
                                width: 14px;
                                height: 14px;
                                background: ${node.color};
                                border-radius: 50%;
                                margin-right: 12px;
                                box-shadow: 0 0 16px ${node.color};
                            "></div>
                            <h3 style="margin: 0; color: #fff; font-size: 22px;">${node.name}</h3>
                        </div>
                        <span style="
                            background: ${node.color}33;
                            color: ${node.color};
                            padding: 4px 12px;
                            border-radius: 12px;
                            font-size: 11px;
                            font-weight: bold;
                            text-transform: uppercase;
                        ">${node.group}</span>
                    </div>
                    
                    <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; font-style: italic;">Технология: ${node.tech}</p>
                    <p style="margin: 0 0 20px 0; color: #e2e8f0; font-size: 15px; line-height: 1.7;">${details.description}</p>
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 10px; margin-bottom: 16px;">
                        <h4 style="margin: 0 0 14px 0; color: #cbd5e1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Основные функции</h4>
                        <ul style="margin: 0; padding-left: 24px; color: #cbd5e1; font-size: 14px; line-height: 2;">
                            ${details.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <h4 style="margin: 0 0 12px 0; color: #cbd5e1; font-size: 13px;">Связи с другими компонентами</h4>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.8;">
                            ${connections.incoming.length > 0 ? `
                                <div style="margin-bottom: 8px;">
                                    <strong style="color: #3b82f6;">← Входящие:</strong><br>
                                    ${connections.incoming.map(c => `&nbsp;&nbsp;• ${c.name} <span style="color: #64748b;">(${c.protocol}${c.bidirectional ? ' ⇄' : ''})</span>`).join('<br>')}
                                </div>
                            ` : ''}
                            ${connections.outgoing.length > 0 ? `
                                <div>
                                    <strong style="color: #10b981;">→ Исходящие:</strong><br>
                                    ${connections.outgoing.map(c => `&nbsp;&nbsp;• ${c.name} <span style="color: #64748b;">(${c.protocol}${c.bidirectional ? ' ⇄' : ''})</span>`).join('<br>')}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="margin: 0; color: #64748b; font-size: 12px; font-style: italic;">
                            💡 Наведите курсор на компонент для отображения всех его связей (⇄ = двусторонняя связь)
                        </p>
                    </div>
                </div>
            `;
        }

        getNodeConnections(node) {
            const incoming = [];
            const outgoing = [];

            this.edges.forEach(edge => {
                if (edge.target === node.id) {
                    const source = this.nodesMap.get(edge.source);
                    if (source) {
                        incoming.push({ name: source.name, protocol: edge.protocol, bidirectional: edge.bidirectional });
                    }
                }
                if (edge.source === node.id) {
                    const target = this.nodesMap.get(edge.target);
                    if (target) {
                        outgoing.push({ name: target.name, protocol: edge.protocol, bidirectional: edge.bidirectional });
                    }
                }
            });

            return { incoming, outgoing };
        }

        drawTitle() {
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('x', this.width / 2);
            title.setAttribute('y', 35);
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('fill', '#ffffff');
            title.setAttribute('font-size', '20');
            title.setAttribute('font-weight', 'bold');
            title.setAttribute('opacity', '0.9');
            title.textContent = 'VulneraAI System Architecture';
            this.svg.appendChild(title);
        }

        drawLegend() {
            const legendData = [
                { color: '#3b82f6', label: 'Agent API' },
                { color: '#10b981', label: 'Storage & Cache' }
            ];

            let x = 300;
            const y = 610;

            legendData.forEach(item => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', '8');
                circle.setAttribute('fill', item.color);
                circle.setAttribute('opacity', '0.85');
                this.svg.appendChild(circle);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + 16);
                text.setAttribute('y', y + 4);
                text.setAttribute('fill', '#94a3b8');
                text.setAttribute('font-size', '13');
                text.textContent = item.label;
                this.svg.appendChild(text);

                x += 380;
            });
        }

        showWelcome() {
            this.detailsPanel.innerHTML = `
                <div style="padding: 28px; text-align: center;">
                    <div style="
                        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 16px;
                    ">VulneraAI Architecture</div>
                    
                    <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                        Интерактивная схема с автоматическим позиционированием<br>
                        и двухсторонними связями между компонентами
                    </p>
                    
                    <div style="background: rgba(59, 130, 246, 0.1); border: 2px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; text-align: left;">
                        <h4 style="margin: 0 0 16px 0; color: #e2e8f0; font-size: 16px;">💡 Возможности:</h4>
                        <ul style="margin: 0; padding-left: 24px; color: #cbd5e1; font-size: 14px; line-height: 2.2;">
                            <li><strong>Кликните</strong> на компонент для детальной информации</li>
                            <li><strong>Наведите курсор</strong> для просмотра связей</li>
                            <li><strong>⇄ Двухсторонние связи</strong> показаны пунктиром зелёным цветом</li>
                            <li><strong>Увеличенные расстояния</strong> между блоками для лучшей читаемости</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        setupGlobalEvents() {
            this.svg.addEventListener('click', (e) => {
                if (e.target === this.svg || e.target.tagName === 'rect') {
                    this.deselectAll();
                    this.showWelcome();
                }
            });
        }

        deselectAll() {
            this.selectedNode = null;
            this.svg.querySelectorAll('.node').forEach(n => {
                const circle = n.querySelector('circle:nth-child(2)');
                const outerCircle = n.querySelector('circle:first-child');
                circle.setAttribute('opacity', '0.85');
                circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
                circle.setAttribute('stroke-width', '2');
                circle.removeAttribute('filter');
                outerCircle.setAttribute('opacity', '0.3');
            });
        }

        getComponentDetails(id) {
            const allDetails = {
                'agent_api': {
                    description: 'Основной REST API агент, написанный на FastAPI. Является точкой входа для всех операций, маршрутизирует запросы и управляет жизненным циклом сессий и инстансов.',
                    features: [
                        'FastAPI 0.104+ асинхронный framework',
                        'Pydantic V2 для валидации данных',
                        'Uvicorn ASGI сервер',
                        'Auto-generated Swagger/OpenAPI документация',
                        'CORS middleware для cross-origin запросов'
                    ]
                },
                'auth': {
                    description: 'Модуль аутентификации на основе JWT токенов. Отвечает за проверку доступа, генерацию токенов и безопасность API.',
                    features: [
                        'JWT (Access и Refresh токены)',
                        'Безопасное хранение паролей',
                        'Bearer-авторизация на защищенных эндпоинтах',
                        'Пользователи и роли доступа'
                    ]
                },
                'sessions': {
                    description: 'Управление сессиями сканирования и выполнения команд. Обрабатывает запуск, остановку и отслеживание статуса задач.',
                    features: [
                        'Создание и выполнение команд',
                        'Мониторинг статуса (running, completed, error)',
                        'Ограничения времени выполнения (timeout)',
                        'Хранение вывода и результатов команд'
                    ]
                },
                'instance': {
                    description: 'Управление и мониторинг самого инстанса агента. Отвечает за контроль загрузки и системных ресурсов.',
                    features: [
                        'Метрики использования CPU и памяти',
                        'Статус и аптайм (uptime)',
                        'Статистика выполненных задач',
                        'Управление конфигурацией (max concurrent tasks)'
                    ]
                },
                'health': {
                    description: 'Модуль проверок работоспособности (Health Checks). Предоставляет эндпоинт для мониторинга состояния сервисов.',
                    features: [
                        'Проверка доступности базы данных (PostgreSQL)',
                        'Проверка доступности кеша (Redis)',
                        'Общий статус приложения (ok / error)'
                    ]
                },
                'postgres': {
                    description: 'Основная реляционная база данных для персистентного хранения всех данных агента.',
                    features: [
                        'Хранение пользователей и хешей паролей',
                        'Хранение истории и результатов сессий',
                        'PostgreSQL 14+ в Docker контейнере',
                        'SQLAlchemy ORM для работы с БД'
                    ]
                },
                'redis': {
                    description: 'Быстрое in-memory хранилище (key-value), используемое для кеширования, временных данных и очередей задач.',
                    features: [
                        'Кеширование частых запросов',
                        'Использование в качестве брокера задач',
                        'Быстрое обновление статусов сессий',
                        'Redis 7+ в Docker контейнере'
                    ]
                }
            };

            return allDetails[id] || {
                description: 'Компонент системы VulneraAI для автоматизированного пентестинга.',
                features: ['Подробная информация будет добавлена']
            };
        }


    }

    // CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .node { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .connection-line { transition: all 0.2s ease; }
    `;
    document.head.appendChild(style);

    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        const architecture = new VulneraAIArchitecture();
        architecture.initialize();

        console.log('%cVulneraAI Architecture Loaded', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
        console.log('%cNodes:', 'color: #10b981; font-weight: bold;', architecture.nodes.length);
        console.log('%cEdges:', 'color: #f97316; font-weight: bold;', architecture.edges.length);
    });
})();
