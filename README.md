# Saree Shop (Wholesale)

A lightweight backend and frontend for a saree wholesale shop.

## Overview
- Backend: Node.js + Express + MongoDB (Mongoose)
- Frontend: React + Vite
- Image hosting: Cloudinary
- Auth: JWT with role-based access (admin, employee, customer)

## Required environment variables
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRE (optional)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- NODE_ENV
- PORT
- CLIENT_URL / FRONTEND_URL (optional, for strict CORS)

## Deployment (Render)
- Backend service root: `saree-shop/server`
  - Build / Start command: `npm install && npm start`
- Frontend service root: `saree-shop/client`
  - Build / Start command: `npm install && npm run build` (static hosting)
- Ensure environment variables above are configured in Render dashboard for each service.

## Cloudinary
1. Create an account at https://cloudinary.com
2. In dashboard copy Cloud name, API Key, API Secret
3. Set them in backend environment variables (do NOT commit `.env`)

## Admin auth
- JWT issued on login. Token required in `Authorization: Bearer <token>` header.
- Protected admin endpoints use `authMiddleware` + `authorizeRoles('admin')`.

## Public APIs
- GET /api/sarees - list products
- GET /api/sarees/:id - product details
- POST /api/inquiries (or /api/interests) - submit interest (public)

## Folder structure
- saree-shop/
  - client/  ← frontend (Vite + React)
  - server/  ← backend (Node + Express)

## Local development
- Backend:

```bash
cd saree-shop/server
npm install
npm run dev
```

- Frontend:

```bash
cd saree-shop/client
npm install
npm run dev
```

## Notes
- `.env` files must NOT be committed. Use `.env.example` as a template.
- Legacy `realestate-app/` removed — use `saree-shop/` path.

