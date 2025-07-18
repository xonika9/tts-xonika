# Детальный пошаговый план реализации

Этот документ служит дорожной картой для разработки приложения Text-to-Speech.

---

### **Этап 1: Настройка фундамента (Monorepo)**

*Цель: Создать структуру проекта и настроить рабочее окружение.*

1.  **Инициализация проекта:**
    *   Создать корневую папку проекта: `tts-xonika`.
    *   Внутри нее инициализировать `Yarn Workspaces`.
    *   Создать структуру папок: `apps/frontend`, `packages/api`, `packages/job-store`, `packages/shared-types`.

2.  **Настройка пакета `shared-types`:**
    *   Создать `packages/shared-types/index.ts`.
    *   Определить в нем все общие типы и интерфейсы: `JobStatus`, `Job`, `ApiTtsRequest`, `ApiTtsResponse`.

3.  **Настройка пакета `job-store`:**
    *   Создать `packages/job-store/index.ts`.
    *   Реализовать класс или объект `JobStore` с методами `createJob`, `getJob`, `updateJob`, используя `Map` для хранения данных. Этот пакет будет зависеть от `shared-types`.

4.  **Настройка пакета `api` (Бэкенд):**
    *   Создать `packages/api/src`.
    *   Внутри создать файлы для эндпоинтов. **Важно:** для динамических роутов Vercel имя файла должно содержать скобки.
        *   `packages/api/src/tts.ts` (для `POST /api/tts`)
        *   `packages/api/src/status/[jobId].ts` (для `GET /api/tts/status/[jobId]`)
    *   Настроить зависимости от `job-store` и `shared-types`.

5.  **Настройка пакета `frontend`:**
    *   Инициализировать Vite-приложение с шаблоном `react-ts` в папке `apps/frontend`.
    *   Установить зависимости: `react`, `react-dom`, `axios` (для API-запросов).
    *   Установить MUI: `@mui/material @emotion/react @emotion/styled`.
    *   Настроить зависимость от `shared-types`, чтобы использовать общие типы на фронтенде.

6.  **Настройка `vercel.json`:**
    *   Создать в корне проекта файл `vercel.json`.
    *   Прописать в нем конфигурацию для сборки и указать, где находятся бессерверные функции.

---

### **Этап 2: Реализация Бэкенда (API)**

*Цель: Заставить API работать, пока без реальной логики Gemini.*

1.  **Эндпоинт `POST /api/tts`:**
    *   Реализовать обработчик запроса.
    *   Он должен:
        *   Создавать новую задачу в `job-store` со статусом `pending`.
        *   **Немедленно** возвращать клиенту ответ `202 Accepted` с `jobId`.
        *   **Асинхронно** (без `await` в основном потоке) запускать "фоновую" задачу, которая пока будет просто имитировать работу:
            *   `setTimeout` на 2 секунды -> обновить статус на `generating`.
            *   `setTimeout` еще на 3 секунды -> обновить статус на `uploading`.
            *   `setTimeout` еще на 2 секунды -> обновить статус на `completed` и добавить фейковый `audioUrl`.

2.  **Эндпоинт `GET /api/tts/status/[jobId]`:**
    *   Реализовать обработчик запроса.
    *   Он должен:
        *   Извлекать `jobId` из параметров URL.
        *   Находить задачу в `job-store` по `jobId`.
        *   Возвращать полный объект задачи в JSON-формате или ошибку `404 Not Found`, если задача не найдена.

---

### **Этап 3: Реализация Фронтенда (UI)**

*Цель: Собрать интерфейс и оживить его с помощью API.*

1.  **Создание компонентов:**
    *   Разработать все UI-компоненты, описанные в плане, используя MUI: `ModelSelection`, `SpeechMode`, `VoiceConfiguration` и т.д.

2.  **Управление состоянием:**
    *   В главном компоненте `App.tsx` использовать `useState` для хранения всех данных: настроек, вводимого текста, `jobId` и текущего статуса задачи (`jobStatus`).

3.  **Реализация логики генерации:**
    *   При клике на кнопку "Generate Speech":
        *   Отправить `POST` запрос на `/api/tts`.
        *   Сохранить полученный `jobId` в состояние.
        *   Запустить периодический опрос (polling) с помощью `setInterval`.

4.  **Реализация логики опроса (Polling):**
    *   Использовать `useEffect` для управления `setInterval`.
    *   Каждые 2 секунды отправлять `GET` запрос на `/api/tts/status/[jobId]`.
    *   Обновлять `jobStatus` в состоянии на основе ответа.
    *   Когда статус становится `completed` или `failed`, остановить опрос с помощью `clearInterval`.

5.  **Динамический интерфейс:**
    *   Связать состояние `jobStatus` с UI:
        *   Блокировать кнопку и поля ввода во время генерации.
        *   Показывать текстовые подсказки (`Generating...`, `Uploading...`).
        *   Отображать блок `Generated Audio` только когда статус `completed`.

---

### **Этап 4: Интеграция и Завершение**

*Цель: Соединить все части вместе и подготовить к развертыванию.*

1.  **Интеграция с реальными API:**
    *   Заменить имитацию в эндпоинте `/api/tts` на реальные вызовы:
        *   Google Gemini API для генерации речи.
        *   Библиотеки `wav` для упаковки аудио.
        *   UploadThing API для загрузки файла.
    *   Настроить обработку секретных ключей (API keys) через переменные окружения (`.env`).

2.  **Тестирование и отладка:**
    *   Провести полное сквозное тестирование всего процесса.
    *   Проверить обработку ошибок (например, если Gemini API вернет ошибку).

3.  **Развертывание:**
    *   Загрузить код в репозиторий на GitHub.
    *   Подключить репозиторий к Vercel.
    *   Настроить переменные окружения в Vercel.
    *   Запустить первое развертывание.