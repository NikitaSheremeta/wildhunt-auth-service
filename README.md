### WildHunt Auth Service

Small authentication/authorization service for the Minecraft WildHunt project.  
Stack: **Node.js 18+**, **Express**, **MySQL**, **JWT**, **Nodemailer**.

---

### Run

- **Install dependencies**

```bash
npm install
```

- **Environment variables (`.env`)**

Minimal required set:

```bash
SERVER_PORT=8443

DB_HOST=localhost
DB_USER=wildhunt_user
DB_PASS=secret
DB_NAME=wildhunt_auth

JWT_ACCESS_SECRET=access_secret
JWT_REFRESH_SECRET=refresh_secret

SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@example.com
SMTP_PASS=smtp_password
```

#### SMTP note (Mail.ru)

If you use **Mail.ru** as SMTP provider and get `EAUTH` / `535 5.7.0 ... Application password is REQUIRED`, it means you must use an **application password**, not your regular account password.

Recommended settings for Mail.ru:

```bash
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-mailbox@mail.ru
SMTP_PASS=<mail.ru app password>
```

Alternative (STARTTLS):

```bash
SMTP_HOST=smtp.mail.ru
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailbox@mail.ru
SMTP_PASS=<mail.ru app password>
```

- **Development mode**

```bash
npm run serve
```

The service is available at `http://localhost:${SERVER_PORT}` and exposes API under `http://localhost:${SERVER_PORT}/api/v1`.

- **Build and production run**

```bash
npm run build
npm start
```

---


### Base URL

All routes are available under the prefix:

```text
/api/v1
```

All paths below are specified **relative to this prefix**.

---

### `/auth` routes

Base prefix: `/api/v1/auth`

#### 1. Registration

- **Method**: `POST`
- **Path**: `/api/v1/auth/registration`
- **Request body** (`application/json`):

```json
{
  "userName": "SomeNick",
  "email": "user@example.com",
  "password": "Password123"
}
```

- **200 Response**:
  - Body with `accessToken`, `refreshToken`.
  - `refreshToken` is also set into `refreshToken` cookie.

- **curl example**:

```bash
curl -X POST "http://localhost:8443/api/v1/auth/registration" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "SomeNick",
    "email": "user@example.com",
    "password": "Password123"
  }' \
  -c cookies.txt
```

#### 2. Login

- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Request body**:

```json
{
  "login": "SomeNick or user@example.com",
  "password": "Password123"
}
```

- **200 Response**:
  - Body: `accessToken`, `refreshToken`.
  - `refreshToken` cookie is updated.

- **curl example**:

```bash
curl -X POST "http://localhost:8443/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "SomeNick",
    "password": "Password123"
  }' \
  -c cookies.txt
```

#### 3. Logout

- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Request body**: none
- **Requirements**:
  - `refreshToken` must be present in cookies.

- **200 Response**:
  - Numeric `200` in body, `refreshToken` cookie is cleared.

- **curl example**:

```bash
curl -X POST "http://localhost:8443/api/v1/auth/logout" \
  -b cookies.txt
```

#### 4. Forgot password (request reset)

- **Method**: `POST`
- **Path**: `/api/v1/auth/forgot-password`
- **Request body**:

```json
{
  "email": "user@example.com"
}
```

- **200 Response**:
  - `{ "message": "<text from PASSWORD_RECOVERY_INSTRUCTIONS>" }`

- **curl example**:

```bash
curl -X POST "http://localhost:8443/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### 5. Set new password by code

- **Method**: `POST`
- **Path**: `/api/v1/auth/new-password`
- **Request body**:

```json
{
  "password": "NewPassword123",
  "code": "1234"
}
```

- **200 Response**:
  - Numeric `200` in body.

- **curl example**:

```bash
curl -X POST "http://localhost:8443/api/v1/auth/new-password" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewPassword123",
    "code": "1234"
  }'
```

#### 6. Account activation

- **Method**: `GET`
- **Path**: `/api/v1/auth/activate/:code`
- **Path params**:
  - `code` — four-digit activation code.

- **200 Response**:
  - Numeric `200` in body.

- **curl example**:

```bash
curl "http://localhost:8443/api/v1/auth/activate/1234"
```

#### 7. Follow reset link

- **Method**: `GET`
- **Path**: `/api/v1/auth/reset/:code`
- **Path params**:
  - `code` — reset code.

- **200 Response**:
  - Numeric `200` in body (after code validation).

- **curl example**:

```bash
curl "http://localhost:8443/api/v1/auth/reset/1234"
```

#### 8. Refresh token

- **Method**: `GET`
- **Path**: `/api/v1/auth/refresh`
- **Requirements**:
  - Valid `refreshToken` must be present in cookies.

- **200 Response**:
  - Body: `accessToken`, `refreshToken`.
  - `refreshToken` cookie is updated.

- **curl example**:

```bash
curl "http://localhost:8443/api/v1/auth/refresh" \
  -b cookies.txt \
  -c cookies.txt
```

---

### `/users` routes

Base prefix: `/api/v1/users`

#### 1. Get all users

- **Method**: `GET`
- **Path**: `/api/v1/users/all`
- **Authorization**:
  - Header `Authorization: Bearer <accessToken>`.
  - Requires `ADMIN` role (see `guard-utils.siteRoles.ADMIN`).

- **200 Response**:
  - Array of users from `users` table.

- **curl example**:

```bash
curl "http://localhost:8443/api/v1/users/all" \
  -H "Authorization: Bearer <accessToken>"
```

---

### Error format

All errors pass through the global `error-middleware` and usually look like:

```json
{
  "message": "Error message",
  "errors": []
}
```

For validation errors (`Joi`) the `errors` field contains context of the field that violated a rule. HTTP status codes come from `status-codes-utils` (e.g. `400`, `401`, `403`, `500`).