## Общая информация

**Базовый URL сервиса (пример):**

- **Локально**: `http://localhost:<SERVER_PORT>/api/v1`
- **В проде**: `https://<your-domain>/api/v1`

Где `<SERVER_PORT>` берётся из переменной окружения `SERVER_PORT` (см. `src/api/v1/index.js`, строка `app.use('/api/v1', routes);`).

Далее все пути указаны **относительно** `/api/v1`.

- **Блок аутентификации**: `/auth/...`
- **Блок пользователей**: `/users/...`

Формат ошибок единый: при бизнес‑ошибках и валидационных ошибках выбрасывается `ApiError`, который в `error-middleware` преобразуется в ответ:

```json
{
  "message": "Описание ошибки",
  "errors": [ /* может быть пустым массивом */ ]
}
```

Код статуса берётся из `status-codes-utils.js`:

- 400 — некорректный запрос (валидация, бизнес‑ошибка);
- 401 — неавторизовано;
- 403 — нет прав доступа;
- 500 — внутренняя ошибка сервера.

## Блок `/auth` (файл `routes/auth-route.js`)

Базовый путь блока: `/api/v1/auth`.

Используется общий middleware валидации `auth-validation.js` (Joi‑схемы), а также контроллер `auth-controller.js`, который вызывает бизнес‑логику в `auth-service.js`.

### 1. Регистрация пользователя — `POST /api/v1/auth/registration`

**Маршрут:**

- Метод: `POST`
- Путь: `/api/v1/auth/registration`
- Middleware: `authValidation`
- Контроллер: `authController.registration`

**Тело запроса (JSON):**

- `userName` — строка, обязательное поле, длина от 4 до 24 символов.
- `email` — строка, обязательное поле, корректный email, длина максимум 255 символов.
- `password` — строка, обязательное поле, **alphanum** (латинские буквы и цифры), длина от 8 до 24 символов.

Валидация задаётся в `auth-validation.js` через `Joi.object()` (кейc `registration`).

**Типовой успешный ответ (200 OK):**

Сервис возвращает объект, который формируется в `token-service.js` методом `generateAndSaveRefreshTokens`:

```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>"
}
```

Дополнительно контроллер устанавливает **HTTP‑cookie**:

- Имя: `refreshToken`
- Значение: тот же refresh‑токен, что и в ответе
- Атрибуты cookie (см. `cookieConfig` в `auth-controller.js`):
  - `maxAge`: 30 дней
  - `sameSite`: `strict`
  - `httpOnly`: `true`
  - `secure`: `true` в `NODE_ENV=production`

**Примеры `curl`:**

```bash
curl -X POST "http://localhost:3000/api/v1/auth/registration" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "TestUser",
    "email": "test@example.com",
    "password": "Password123"
  }' \
  -c cookies.txt
```

- **`-c cookies.txt`** — сохранить полученный `refreshToken` в файл cookies (для дальнейших запросов).

### 2. Логин пользователя — `POST /api/v1/auth/login`

**Маршрут:**

- Метод: `POST`
- Путь: `/api/v1/auth/login`
- Middleware: `authValidation`
- Контроллер: `authController.login`

**Тело запроса (JSON):**

- `login` — строка, обязательное поле, максимум 255 символов.
  - Может быть никнейм пользователя (`userName`), либо email.
- `password` — строка, обязательное поле, **alphanum**, длина от 8 до 24 символов.

Схема — кейс `login` в `auth-validation.js`.

**Успешный ответ (200 OK):**

Тот же формат, что и при регистрации:

```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>"
}
```

Также устанавливается cookie `refreshToken` с теми же атрибутами, что и при регистрации.

**Пример `curl`:**

```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test@example.com",
    "password": "Password123"
  }' \
  -c cookies.txt
```

### 3. Логаут — `POST /api/v1/auth/logout`

**Маршрут:**

- Метод: `POST`
- Путь: `/api/v1/auth/logout`
- Middleware: нет
- Контроллер: `authController.logout`

**Как работает:**

- Контроллер читает `refreshToken` из cookie (`req.cookies.refreshToken`).
- Передаёт его в `authService.userLogout`, который:
  - Проверяет, что `refreshToken` существует.
  - Удаляет refresh‑токен из хранилища (`tokenData.deleteRefreshToken`).
- После успешного логаута:
  - очищается cookie `refreshToken` (`res.clearCookie('refreshToken')`);
  - возвращается код `200 OK` (числовое значение из `statusCodesUtils.httpStatus.OK.code`).

**Пример `curl`:**

Если вы до этого сохранили cookie в `cookies.txt`:

```bash
curl -X POST "http://localhost:3000/api/v1/auth/logout" \
  -b cookies.txt
```

### 4. Восстановление пароля (отправка ссылки) — `POST /api/v1/auth/forgot-password`

**Маршрут:**

- Метод: `POST`
- Путь: `/api/v1/auth/forgot-password`
- Middleware: `authValidation`
- Контроллер: `authController.forgotPassword`

**Тело запроса (JSON):**

- `email` — строка, обязательное поле, корректный email, длина максимум 255 символов.

Схема — кейс `forgot-password` в `auth-validation.js`.

**Как работает:**

- `authService.userForgotPassword(email)`:
  - Ищет пользователя по email.
  - Если пользователя нет — ошибка 400 с соответствующим сообщением.
  - Генерирует reset‑токен (`tokenService.generateAndSaveResetToken`).
  - Логирует в консоль ссылку вида:
    - `http://<API_URL>:<SERVER_PORT>/api/v1/auth/reset/<resetToken>`
  - Возвращает:

```json
{
  "message": "<текст о том, что инструкции по восстановлению отправлены>"
}
```

**Пример `curl`:**

```bash
curl -X POST "http://localhost:3000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 5. Активация учётной записи — `GET /api/v1/auth/activate/:link`

**Маршрут:**

- Метод: `GET`
- Путь: `/api/v1/auth/activate/:link`
- Middleware: `authValidation` (схема по `link`)
- Контроллер: `authController.activate`

**Параметры пути:**

- `:link` — строка, **UUID v4**, обязательный параметр.

Схема (`auth-validation.js`, кейс `'/activate/:link'`):

- `link`: `Joi.string().guid({ version: ['uuidv4'] }).required()`

**Как работает:**

- `authService.userActivation(link)`:
  - Ищет пользователя по activation‑link.
  - Если не найден — ошибка 400 (некорректная / устаревшая ссылка).
  - Если пользователь уже активирован (`is_activation_status !== 0`) — возвращает `false` (повторная активация не производится).
  - Если всё ок — обновляет статус активации пользователя.
- Контроллер в конце делает:
  - `res.redirect(process.env.API_URL || process.env.API_URL_LOCAL);`

То есть пользователь будет **редиректнут** на фронтовый URL, указанный в переменных окружения.

**Пример `curl`:**

```bash
curl -X GET "http://localhost:3000/api/v1/auth/activate/<UUID_LINK>" -v
```

Флаг `-v` нужен, чтобы увидеть 3xx‑редирект в консоли.

### 6. Сброс пароля по токену — `GET /api/v1/auth/reset/:token`

**Маршрут:**

- Метод: `GET`
- Путь: `/api/v1/auth/reset/:token`
- Middleware: `authValidation`
- Контроллер: `authController.resetPassword`

**Параметры пути:**

- `:token` — строка, JWT‑подобный токен (формат: три блока Base64URL, разделённые точками).

Схема (`auth-validation.js`, кейс `'/reset/:token'`):

- `token`: `Joi.string().pattern(magicNumbers.jwt.regex).required()`, где
  - `magicNumbers.jwt.regex = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/`

**Как работает:**

- `authService.userResetPassword(resetToken)`:
  - Валидирует reset‑токен (`tokenService.validateResetToken`).
  - Если токен невалиден / истёк — ошибка 400 (с сообщением о просроченной ссылке).
  - Достаёт пользователя из базы.
  - Генерирует новый пароль (`utils.generatePassword()`).
  - Хэширует его и сохраняет в БД.
  - Удаляет reset‑токен из хранилища.
  - (Рассылка нового пароля по email закомментирована, но логика сохранения и генерации пароля работает.)
- Контроллер после успешной операции редиректит:
  - `res.redirect(process.env.API_URL || process.env.API_URL_LOCAL);`

**Пример `curl`:**

```bash
curl -X GET "http://localhost:3000/api/v1/auth/reset/<RESET_TOKEN>" -v
```

### 7. Обновление пары токенов — `GET /api/v1/auth/refresh`

**Маршрут:**

- Метод: `GET`
- Путь: `/api/v1/auth/refresh`
- Middleware: нет
- Контроллер: `authController.refresh`

**Как работает:**

- Контроллер:
  - Берёт `refreshToken` из cookie.
  - Вызывает `authService.userRefreshToken(refreshToken)`.
- `authService.userRefreshToken`:
  - Если `refreshToken` отсутствует — `ApiError.unauthorizedError()` (401).
  - Валидирует токен (`tokenService.validateRefreshToken`).
  - Находит соответствующую запись в БД (`tokenData.getRefreshTokenByUserId`).
  - Проверяет наличие пользователя и его ролей.
  - Генерирует новую пару токенов (`accessToken`, `refreshToken`) и сохраняет новый refresh‑токен в БД.
- Контроллер:
  - Обновляет cookie `refreshToken` с теми же атрибутами, что и при логине/регистрации.
  - Возвращает JSON с новой парой токенов.

**Пример `curl`:**

```bash
curl -X GET "http://localhost:3000/api/v1/auth/refresh" \
  -b cookies.txt \
  -c cookies.txt
```

- **`-b cookies.txt`** — отправить сохранённый `refreshToken` в запросе.
- **`-c cookies.txt`** — обновить файл cookies новыми значениями.

## Блок `/users` (файл `routes/users-route.js`)

Базовый путь блока: `/api/v1/users`.

На текущий момент здесь один маршрут.

### 1. Получить список всех пользователей — `GET /api/v1/users/all`

**Маршрут:**

- Метод: `GET`
- Путь: `/api/v1/users/all`
- Middleware:
  - `authMiddleware(guardUtils.routeAccess.users)`
- Контроллер: `userController.getUsers`

**Требования по авторизации и ролям:**

- `authMiddleware` ожидает заголовок:
  - `Authorization: Bearer <ACCESS_TOKEN>`
- Внутри:
  - Заголовок разбирается на `bearer` и `accessToken`.
  - `bearer` должен быть строкой `"Bearer"`.
  - Токен валидируется (`tokenService.validateAccessToken`).
  - Если токен некорректен или не передан — `401 Unauthorized`.
  - Из токена читаются роли: `userData.roles`.
  - Для маршрута `/users/all` используется правило:
    - `guardUtils.routeAccess.users = [guardUtils.siteRoles.ADMIN]`
    - Где `guardUtils.siteRoles.ADMIN = 741`.
  - То есть доступ имеют только пользователи, у которых среди `roles` есть значение `741`.
  - Если роль не найдена — `403 Forbidden`.

**Параметры запроса:**

- Маршрут не ожидает тела (`body`) или query‑параметров — только заголовок `Authorization`.

**Успешный ответ (200 OK):**

- Контроллер `userController.getUsers` вызывает `userData.getAllUsers()` и возвращает список пользователей в формате JSON.
- Точная структура объекта пользователя зависит от реализации слоя `user-data`, но в общем случае это массив объектов с данными пользователей.

**Пример `curl` (нужен действующий access‑токен администратора):**

```bash
curl -X GET "http://localhost:3000/api/v1/users/all" \
  -H "Authorization: Bearer <ACCESS_TOKEN_ADMIN>"
```

## Краткое резюме по валидации

**`auth-validation.js`**:

- Определяет `Joi`‑схемы для разных роутов `/auth`:
  - `registration` — тело запроса `userName`, `email`, `password`.
  - `login` — тело запроса `login`, `password`.
  - `forgot-password` — тело запроса `email`.
  - `activate/:link` — параметр пути `link` (UUID v4).
  - `reset/:token` — параметр пути `token` (JWT‑подобная строка).
- При несоответствии схемам:
  - генерируется `ApiError.badRequest(...)`;
  - на выходе клиент получает HTTP 400 и JSON:

```json
{
  "message": "<сообщение из Joi>",
  "errors": [
    {
      /* контекст поля, на котором произошла ошибка */
    }
  ]
}
```

**`auth-middleware.js`**:

- Проверяет наличие и корректность `Authorization: Bearer <ACCESS_TOKEN>`.
- Достаёт роли пользователя из access‑токена.
- Сравнивает их с разрешёнными ролями маршрута (например, `[741]` для `/users/all`).
- При ошибке авторизации — 401, при недостатке прав — 403.

Таким образом, все эндпоинты `/auth` валидируют данные с помощью `Joi`, а эндпоинт `/users/all` дополнительно защищён по ролям через `auth-middleware` и `guard-utils`.


