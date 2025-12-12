# VulneraAI

[![Production Ready](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)](https://github.com/Kelll31/VulneraAI)
[![FastAPI](https://img.shields.io/badge/Server-FastAPI-00a651.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Client-React%2018-61dafb.svg)](https://react.dev)
[![Kubernetes](https://img.shields.io/badge/K8s-Ready-326ce5.svg)](https://kubernetes.io/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Полностью автоматизированная платформа для тестирования на проникновение с использованием искусственного интеллекта**

## 📋 Содержание

- [О проекте](#о-проекте)
- [Архитектура](#архитектура)
- [Компоненты](#компоненты)
- [Быстрый старт](#быстрый-старт)
- [Документация](#документация)
- [Технологический стек](#технологический-стек)
- [Контакты](#контакты)

---

## О проекте

**VulneraAI** — это профессиональная платформа нового поколения для предприятий и специалистов по кибербезопасности. Система использует передовые методы искусственного интеллекта и машинного обучения, чтобы полностью автоматизировать и ускорить процесс тестирования на проникновение.

Проект состоит из **трёх основных компонентов**:

1. **VulneraAI Server** — мощный REST API на FastAPI с поддержкой Kubernetes
2. **VulneraAI Client** — лёгкий клиент для Kali Linux (Python + React)
3. **VulneraAI Website** — информационный сайт проекта (этот репозиторий)

---

## Архитектура

### 2025 - Современная микросервисная архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   Kali Linux Client                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ React UI (Chat Interface) + FastAPI Backend      │   │
│  │ CLI Commands | Real-time Status Monitoring       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP/REST
                 ▼
┌────────────────────────────────────────────────────────────┐
│          VulneraAI Server (Production Ready)               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ FastAPI Gateway | Core Services | Admin Panel      │  │
│  │ Auth | Pentests | Subscriptions | Webhooks         │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │ PostgreSQL   │ Redis        │ RabbitMQ             │   │
│  │ Users, Data  │ Cache/Token  │ Async Tasks          │   │
│  │ Port 5432    │ Port 6379    │ Port 5672            │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │ GPT Tunnel   │ Prometheus   │ Webhooks             │   │
│  │ AI Processing│ Monitoring   │ Real-time Updates    │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## Компоненты

### 🖥️ VulneraAI Server

**Полнофункциональный REST API сервер на FastAPI с поддержкой Kubernetes**

- **Tech Stack**: FastAPI, Python 3.11+, PostgreSQL, Redis, RabbitMQ
- **Features**:
  - REST API с автоматической Swagger документацией
  - JWT аутентификация с refresh токенами
  - Управление подписками (Demo, Standard, Enterprise)
  - Webhook интеграции для real-time уведомлений
  - Экспорт отчётов (JSON, PDF, SARIF)
  - Admin Panel (Appsmith) - локальная сеть
  - Kubernetes-ready с HPA и health checks
  - Prometheus метрики и Grafana dashboards

- **Развёртывание**:
  - Docker: `docker-compose up -d`
  - Kubernetes: `kubectl apply -k k8s/`
  - Debian+K8s: `bash scripts/debian-k8s/install-all.sh`

📖 **[VulneraAI_Server Repository](https://github.com/Kelll31/VulneraAI_Server)**

---

### 🐧 VulneraAI Client (Kali Linux)

**Лёгкий клиент только для Kali Linux с Python backend и React frontend**

- **Tech Stack**: Python 3.11+, React 18, TypeScript, Vite, FastAPI
- **Features**:
  - React Web UI с интерфейсом чата (как ChatGPT)
  - FastAPI backend агент с asyncio worker
  - CLI команды (system-check, agent-status, server-health)
  - Реальное выполнение команд на машине клиента
  - Real-time мониторинг статуса
  - Обязательная проверка Kali Linux (не запустится на других ОС)

- **Порты**:
  - Frontend: 5173 (dev) / 80 (prod)
  - Backend: 8001

- **Развёртывание**:
  - На Kali: `make install && make dev`
  - Docker: `docker-compose up -d`

📖 **[VulneraAI_Client_Kali_Linux Repository](https://github.com/Kelll31/VulneraAI_Client_Kali_Linux)**

---

### 🌐 VulneraAI Website

**Информационный сайт проекта с полной документацией (этот репозиторий)**

- **Tech Stack**: HTML5, CSS3, JavaScript, GitHub Pages
- **Разделы**:
  - Главная страница с обзором
  - Архитектура системы (интерактивная диаграмма)
  - Описание компонентов (Server / Client / Website)
  - Техническая документация со ссылками
  - Контактная информация и GitHub Issues

---

## Быстрый старт

### 1️⃣ Установить Server

```bash
git clone https://github.com/Kelll31/VulneraAI_Server.git
cd VulneraAI_Server
cp .env.example .env
docker-compose up -d
```

**Server API доступен**: http://localhost:8000/docs

### 2️⃣ Установить Client (на Kali Linux)

```bash
git clone https://github.com/Kelll31/VulneraAI_Client_Kali_Linux.git
cd VulneraAI_Client_Kali_Linux
make install
make dev
```

**Client Web UI доступен**: http://localhost:5173

### 3️⃣ Открыть Website

```bash
git clone https://github.com/Kelll31/VulneraAI.git
cd VulneraAI
# Откройте index.html в браузере
```

**Website доступен**: http://localhost:3000 (локально)

---

## Основные возможности платформы

✅ **Автоматическая генерация эксплойтов**  
✅ **Детекция unknown уязвимостей (ML)**  
✅ **RAG-система с контекстным поиском по CVE**  
✅ **Адаптивные стратегии атак в real-time**  
✅ **Полная автоматизация процессов**  
✅ **Экспорт отчётов (JSON/PDF/SARIF)**  
✅ **Webhook интеграции**  
✅ **Admin Panel (Appsmith)**  
✅ **Kubernetes-ready**  
✅ **Prometheus monitoring**  

---

## Документация

### Server Documentation
- **Quick Start**: [Server README](https://github.com/Kelll31/VulneraAI_Server/blob/main/README.md)
- **Debian Setup**: [QUICK_START_DEBIAN.md](https://github.com/Kelll31/VulneraAI_Server/blob/main/QUICK_START_DEBIAN.md)
- **Docker Setup**: [DEBIAN_DOCKER_SETUP.md](https://github.com/Kelll31/VulneraAI_Server/blob/main/DEBIAN_DOCKER_SETUP.md)
- **Kubernetes**: [KUBERNETES_QUICK_START.md](https://github.com/Kelll31/VulneraAI_Server/blob/main/KUBERNETES_QUICK_START.md)
- **API Docs**: [README API Section](https://github.com/Kelll31/VulneraAI_Server#-api-%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F)
- **Admin Panel**: [README Admin Section](https://github.com/Kelll31/VulneraAI_Server#%F0%9F%86%95-admin-panel)

### Client Documentation
- **Quick Start**: [Client README](https://github.com/Kelll31/VulneraAI_Client_Kali_Linux/blob/main/README.md)
- **Development**: [DEVELOPMENT.md](https://github.com/Kelll31/VulneraAI_Client_Kali_Linux/blob/main/DEVELOPMENT.md)
- **Docker Setup**: [DOCKER_README.md](https://github.com/Kelll31/VulneraAI_Client_Kali_Linux/blob/main/DOCKER_README.md)
- **CLI Commands**: [CLI Reference](https://github.com/Kelll31/VulneraAI_Client_Kali_Linux#cli-%D0%9A%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%8B)

---

## Технологический стек

| Компонент | Технологии |
|-----------|------------|
| **Server** | FastAPI, Python 3.11+, PostgreSQL, Redis, RabbitMQ, Kubernetes |
| **Client** | React 18, TypeScript, Vite, Python, FastAPI |
| **Admin Panel** | Appsmith |
| **DevOps** | Docker, Docker Compose, Kubernetes, Portainer, Prometheus, Grafana |
| **Website** | HTML5, CSS3, JavaScript, GitHub Pages |

---

## Требования

### Для Server
- Docker & Docker Compose или
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3.13+
- (Опционально) Kubernetes 1.20+

### Для Client
- **Обязательно Kali Linux 2024+**
- Python 3.11+
- Node.js 20+

---

## Поддержка

### GitHub Issues
- **Server Issues**: [VulneraAI_Server/issues](https://github.com/Kelll31/VulneraAI_Server/issues)
- **Client Issues**: [VulneraAI_Client_Kali_Linux/issues](https://github.com/Kelll31/VulneraAI_Client_Kali_Linux/issues)
- **Website Issues**: [VulneraAI/issues](https://github.com/Kelll31/VulneraAI/issues)

### Developer
📧 **GitHub Profile**: [github.com/kelll31](https://github.com/kelll31)

---

## Лицензия

MIT License - см. [LICENSE](LICENSE) для деталей

---

## Преимущества платформы

- ⚡ **Сокращение времени на пентест** в несколько раз
- 🎯 **Повышение точности** за счет ML-анализа и RAG
- 📈 **Гибкость и масштабируемость** для корпоративных сред
- 🔒 **Production-ready** архитектура
- 🚀 **Kubernetes-готовность** для облачных развёртываний
- 👨‍💻 **Полная документация** и примеры
- 🔌 **Webhook интеграции** для автоматизации
- 📊 **Мониторинг и аналитика** встроены в систему

---

*VulneraAI — опережая black hats. 🚀*

**Last Updated**: December 2025  
**Version**: 1.0.0 (Production Ready)  
**Status**: ✅ All components deployed and documented