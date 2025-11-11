# React Messenger Full-stack

Это полноценное full-stack приложение мессенджера, состоящее из:
- **Клиент (Frontend)**: React-приложение, созданное с помощью Vite (в папке `/client`).
- **Сервер (Backend)**: API на Node.js и Express (в папке `/server`) с аутентификацией и файловой базой данных.

## Структура проекта

```
/
├── client/         # React Frontend
├── server/         # Node.js Backend
│   ├── db.json     # Файловая база данных
│   ├── server.js
│   └── package.json
├── .gitignore
├── package.json    # Корневой package.json для управления всем
└── README.md
```

## Локальный запуск

1.  **Установка зависимостей:**
    В корневой папке проекта выполните команду. Она установит зависимости и для клиента, и для сервера.
    ```bash
    npm install
    ```

2.  **Запуск для разработки:**
    Эта команда одновременно запустит сервер и клиент в режиме разработки.
    ```bash
    npm run dev
    ```
    - Клиент будет доступен по адресу: `http://localhost:5173`
    - Сервер будет работать по адресу: `http://localhost:3001`

**Важно:** При первом запуске сервера будет создан файл `server/db.json` с начальными данными. Вы можете зарегистрировать нового пользователя или использовать существующих (например, `Alice` с паролем `password`).

---

## Инструкции по развертыванию (Deployment)

### Шаг 1: Создание репозитория на GitHub

1.  Создайте новый репозиторий на [GitHub](https://github.com/new).
2.  Загрузите весь код этого проекта в созданный репозиторий. **Убедитесь, что `server/db.json` добавлен в `.gitignore`, чтобы не публиковать данные пользователей.**

### Шаг 2: Развертывание Backend на Render

1.  Зарегистрируйтесь на [Render](https://render.com/).
2.  На панели управления (Dashboard) нажмите **New +** -> **Web Service**.
3.  Подключите ваш GitHub-репозиторий.
4.  Настройки сервиса:
    - **Name**: `messenger-backend` (или любое другое имя)
    - **Root Directory**: `server`
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
5.  Перейдите в раздел **Environment** и добавьте **Secret File**:
    - **Filename**: `db.json`
    - **Contents**: Cкопируйте и вставьте содержимое вашего локального файла `server/db.json`. Это нужно, чтобы на сервере были начальные данные.
6.  Добавьте **Environment Variable**:
    - **Key**: `JWT_SECRET`
    - **Value**: `your_super_secret_key_for_jwt` (замените на любую случайную строку)
7.  Нажмите **Create Web Service**.
8.  После завершения развертывания скопируйте URL вашего сервера (например, `https://messenger-backend-xyz.onrender.com`). **Он понадобится на следующем шаге.**

### Шаг 3: Развертывание Frontend на Vercel

1.  Зарегистрируйтесь на [Vercel](https://vercel.com/).
2.  На панели управления (Dashboard) нажмите **Add New...** -> **Project**.
3.  Импортируйте ваш GitHub-репозиторий.
4.  Настройки проекта:
    - **Framework Preset**: `Vite`
    - **Root Directory**: `client`
5.  Раскройте секцию **Environment Variables** и добавьте новую переменную:
    - **Name**: `VITE_API_URL`
    - **Value**: Вставьте URL вашего **сервера с Render** из предыдущего шага и добавьте в конце `/api` (например, `https://messenger-backend-xyz.onrender.com/api`).
6.  Нажмите **Deploy**. Vercel соберет и развернет ваше React-приложение.

**Готово!** Ваше приложение полностью развернуто и работает в сети.