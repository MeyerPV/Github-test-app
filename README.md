# GitHub Repositories Explorer

Приложение для поиска и просмотра репозиториев GitHub с использованием GitHub GraphQL API.

## Технологии

-   React
-   TypeScript
-   Vite
-   Effector (State Management)
-   Apollo Client (GraphQL)
-   Tailwind CSS (стилизация)
-   React Router (маршрутизация)

## Архитектура

Проект построен с использованием Feature-Sliced Design (FSD), что обеспечивает масштабируемость и поддерживаемость кодовой базы.

## Функциональность

-   Поиск репозиториев по названию
-   Просмотр репозиториев пользователя
-   Отображение детальной информации о репозитории
-   Пагинация результатов
-   Сохранение состояния поиска между сеансами

## Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/your-username/github-test-app.git
cd github-test-app
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл .env.local в корне проекта и добавьте свой токен GitHub:

```
VITE_GITHUB_TOKEN=your_github_token
```

4. Запустите приложение в режиме разработки:

```bash
npm run dev
```

5. Откройте http://localhost:5173 в браузере.

## Сборка проекта

Для сборки проекта выполните:

```bash
npm run build
```

## Примечания

-   Для корректной работы с GitHub API необходим личный токен доступа с разрешениями на чтение репозиториев
-   Для создания токена перейдите в настройки GitHub: Settings -> Developer Settings -> Personal Access Tokens
