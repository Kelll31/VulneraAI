# VulneraAI Light 🛡️

**Production-Ready Lightweight Security Testing Agent**

VulneraAI Light - полнофункциональная облегченная версия агента для тестирования безопасности с RESTful API управления.

## ✨ Возможности

- 🚀 **Одна команда для развертывания** на Windows и Linux
- 🔐 **JWT аутентификация** с access/refresh токенами
- 📊 **RESTful API** для управления сессиями и инстансами
- 🐳 **Docker контейнеризация** с полной изоляцией
- 💾 **PostgreSQL** для хранения сессий и пользователей
- ⚡ **Redis** для кеширования и очередей
- 📈 **Мониторинг** состояния инстанса и метрик
- 🔒 **Production-ready** с health checks и логированием
- 🌐 **CORS** настройка для фронтенд интеграции
- 📝 **Автоматическая документация API** (Swagger/OpenAPI)

## 🏗️ Архитектура

```
VulneraAI Light
├── PostgreSQL      # Хранение данных
├── Redis           # Кеш и очереди
└── Agent (FastAPI) # REST API
    ├── Authentication
    ├── Sessions
    ├── Instance Management
    └── Health Monitoring
```

## 🚀 Быстрый Старт

### Требования

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**

### Установка и Запуск

#### Linux / macOS

```bash
# Клонировать репозиторий
git clone https://github.com/Kelll31/VulneraAI_light.git
cd VulneraAI_light

# Запустить одной командой
chmod +x deploy.sh
./deploy.sh
```

#### Windows (PowerShell)

```powershell
# Клонировать репозиторий
git clone https://github.com/Kelll31/VulneraAI_light.git
cd VulneraAI_light

# Запустить одной командой
.\deploy.ps1
```

### После запуска

Сервисы будут доступны по адресам:

- **Agent API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

**Админ по умолчанию**:
- Username: `admin`
- Password: `Admin123!`

⚠️ **Обязательно смените пароли в production!**

## 📚 API Документация

### Аутентификация

#### Логин

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

**Ответ**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### Получить информацию о текущем пользователе

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Управление Сессиями

#### Выполнить команду

```bash
curl -X POST http://localhost:8000/api/v1/sessions/execute \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "nmap",
    "args": ["-sV", "localhost"],
    "timeout": 300
  }'
```

**Ответ**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "command": "nmap -sV localhost",
  "status": "completed",
  "output": "Starting Nmap 7.80...",
  "error": null,
  "exit_code": 0,
  "started_at": "2026-02-19T11:30:00Z",
  "completed_at": "2026-02-19T11:30:15Z",
  "duration_ms": 15000
}
```

#### Получить сессию по ID

```bash
curl -X GET http://localhost:8000/api/v1/sessions/{session_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Список сессий

```bash
curl -X GET "http://localhost:8000/api/v1/sessions?skip=0&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Управление Инстансом

#### Статус инстанса

```bash
curl -X GET http://localhost:8000/api/v1/instance/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Ответ**:
```json
{
  "instance_id": "hostname-8000",
  "status": "running",
  "uptime_seconds": 3600,
  "tasks_completed": 42,
  "active_sessions": 2
}
```

#### Детальная информация об инстансе

```bash
curl -X GET http://localhost:8000/api/v1/instance/info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Ответ**:
```json
{
  "instance_id": "hostname-8000",
  "version": "2.0.0",
  "uptime_seconds": 3600,
  "system": {
    "cpu_percent": 25.5,
    "memory_percent": 45.2,
    "memory_available_mb": 2048,
    "disk_percent": 60.0,
    "disk_free_gb": 50
  },
  "config": {
    "max_concurrent_tasks": 5,
    "default_timeout": 300,
    "debug": false
  }
}
```

### Health Check

```bash
curl http://localhost:8000/api/v1/health
```

**Ответ**:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "database": "ok",
  "redis": "ok"
}
```

## ⚙️ Конфигурация

Основные настройки находятся в файле `.env`:

```bash
# Database
POSTGRES_DB=vulneraai
POSTGRES_USER=vulneraai
POSTGRES_PASSWORD=changeme123

# Redis
REDIS_PASSWORD=changeme123

# Agent
AGENT_PORT=8000
DEBUG=false
SECRET_KEY=your-secret-key-min-32-chars

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
ADMIN_EMAIL=admin@vulneraai.local

# Limits
AGENT_MAX_CONCURRENT_TASKS=5
AGENT_TIMEOUT=300
```

### Изменение настроек

1. Остановите сервисы: `docker-compose down`
2. Отредактируйте `.env`
3. Перезапустите: `docker-compose up -d`

## 🔧 Управление

### Основные команды

```bash
# Просмотр логов
docker-compose logs -f agent

# Статус сервисов
docker-compose ps

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Полная очистка (с удалением данных)
docker-compose down -v
```

### Обновление

```bash
# Получить последние изменения
git pull

# Пересобрать и запустить
docker-compose up -d --build
```

## 🏢 Production Deployment

### Рекомендации для production

1. **Смените все пароли по умолчанию**
2. **Используйте сильный SECRET_KEY** (минимум 32 символа)
3. **Настройте HTTPS** через reverse proxy (nginx/traefik)
4. **Ограничьте CORS** для вашего домена
5. **Настройте бэкапы** PostgreSQL
6. **Мониторинг** через Prometheus/Grafana
7. **Логирование** в централизованную систему

### Пример nginx конфигурации

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Мониторинг

Mетрики доступны через API:

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Instance metrics
curl http://localhost:8000/api/v1/instance/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Проблемы с запуском

```bash
# Проверьте логи
docker-compose logs

# Проверьте статус контейнеров
docker-compose ps

# Проверьте порты
netstat -tulpn | grep -E ':(5432|6379|8000)'
```

### База данных не подключается

```bash
# Проверьте PostgreSQL
docker-compose logs db

# Попробуйте подключиться вручную
docker exec -it vulneraai_db psql -U vulneraai -d vulneraai
```

### Redis проблемы

```bash
# Проверьте Redis
docker-compose logs redis

# Тест подключения
docker exec -it vulneraai_redis redis-cli -a changeme123 ping
```

## 📝 Структура Проекта

```
VulneraAI_light/
├── agent/                    # Основное приложение
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   ├── core/            # Конфиг и безопасность
│   │   ├── db/              # База данных
│   │   ├── models/          # SQLAlchemy модели
│   │   ├── schemas/         # Pydantic схемы
│   │   └── main.py          # Точка входа
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml        # Orchestration
├── deploy.sh                 # Linux deploy script
├── deploy.ps1                # Windows deploy script
├── .env.example              # Пример конфигурации
└── README.md
```

## 🤝 Contributing

Приветствуются pull requests!

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📜 License

MIT License - см. файл [LICENSE](LICENSE)

## 🔗 Links

- **Основная версия**: [VulneraAI_Server](https://github.com/Kelll31/VulneraAI_Server)
- **Документация API**: `/docs` (после запуска)
- **Issues**: [GitHub Issues](https://github.com/Kelll31/VulneraAI_light/issues)

## ⚠️ Disclaimer

Этот инструмент предназначен только для легального тестирования безопасности с явного разрешения. Авторы не несут ответственности за неправомерное использование.

---

**Made with ❤️ for Security Professionals**
