# Switch2itech Backend

Node.js + Express backend for Switch2itech APIs.

## Prerequisites

- Node.js 20+ (recommended)
- npm
- MongoDB running locally or a remote MongoDB URI

## 1) Install Dependencies

```bash
npm install
```

## 2) Setup Environment Variables

Create a `.env` file in project root (you can copy from `.env.example`):

```bash
copy .env.example .env
```

Update required values in `.env`:

- `PORT` (default `5000`)
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 3) Run the Project (Local)

Development mode (with nodemon):

```bash
npm run dev
```

App will start at:

`http://localhost:5000`

Health check:

`GET http://localhost:5000/health`

## 4) Run with Docker

Build image:

```bash
docker build -t switch2itech-backend .
```

Run container:

```bash
docker run --env-file .env -p 5000:5000 switch2itech-backend
```

## Seed Scripts

Run these when needed:

```bash
npm run seed:admin
npm run seed:dummy
npm run seed:advanced
```

## API Base Path

Base URL:

`http://localhost:5000/api`

Main route groups:

- `/auth`
- `/users`
- `/projects`
- `/products`
- `/testimonials`
