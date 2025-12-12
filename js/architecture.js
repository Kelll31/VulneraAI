    // Updated architecture blocks with proper spacing
    const ARCHITECTURE_BLOCKS = {
        server: {
            title: "VulneraAI Server (Backend)",
            position: { x: 20, y: 60 },
            size: { width: 460, height: 440 },
            color: "#1e40af",
            components: ["api_gateway", "core_services", "storage", "queue"]
        },
        client: {
            title: "VulneraAI Client (Kali Linux)",
            position: { x: 520, y: 60 },
            size: { width: 340, height: 200 },
            color: "#047857",
            components: ["client_ui", "client_backend"]
        },
        integrations: {
            title: "Интеграции и внешние сервисы",
            position: { x: 520, y: 300 },
            size: { width: 340, height: 200 },
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
            position: { x: 35, y: 90 },
            size: { width: 180, height: 90 },
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
            position: { x: 245, y: 90 },
            size: { width: 200, height: 90 },
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
            position: { x: 35, y: 220 },
            size: { width: 180, height: 90 },
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
            position: { x: 245, y: 220 },
            size: { width: 200, height: 90 },
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
            position: { x: 540, y: 90 },
            size: { width: 150, height: 90 },
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
            position: { x: 710, y: 90 },
            size: { width: 140, height: 90 },
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
            position: { x: 540, y: 320 },
            size: { width: 150, height: 85 },
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
            position: { x: 710, y: 320 },
            size: { width: 140, height: 85 },
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
            position: { x: 540, y: 425 },
            size: { width: 310, height: 60 },
            color: "#ec4899",
            block: "integrations"
        }
    };