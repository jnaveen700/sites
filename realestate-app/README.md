# Wholesale Saree Shop - MERN Stack

## Project Overview

This is a production-ready wholesale saree e-commerce platform built with:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary

## Folder Structure

```
realestate-app/
├── client/                  ← React frontend
│   ├── src/
│   │   ├── api/            ← API call functions
│   │   ├── components/     ← Reusable React components
│   │   ├── context/        ← Global state management
│   │   ├── hooks/          ← Custom hooks
│   │   ├── pages/          ← Full page components
│   │   └── utils/          ← Helper functions
│   └── package.json
│
└── server/                 ← Express backend
    ├── config/             ← Database configuration
    ├── controllers/        ← Route handler logic
    ├── middleware/         ← Custom Express middleware
    ├── models/             ← Mongoose schemas
    ├── routes/             ← Route definitions
    ├── uploads/            ← Static file storage
    ├── .env                ← Environment variables
    ├── server.js           ← App entry point
    └── package.json

```

## Features

### Public Features
- Browse saree catalog with advanced filtering
- Filter by material (silk, cotton, linen, etc.), pattern, color
- View detailed saree information with high-quality images
- Check wholesale pricing and stock availability

### Wholesale Customer Features
- Register/login as wholesale buyer
- Add business information (GST number, company name)
- Place bulk orders with minimum order quantities
- View order history and status
- Track payment status
- View invoice and order details

### Employee Features
- Secure login
- View all customer orders
- Update order status (pending → confirmed → processing → shipped → delivered)
- Update payment status (pending → partial → paid → overdue)
- Manage inventory
- Assign orders to team members
- Dashboard with order statistics

### Admin Features
- Add/edit/delete properties
- Manage bookings
- Manage employees
- Analytics and Dashboard

## Getting Started

### Backend Setup
1. Navigate to server folder: `cd server`
2. Install dependencies: `npm install`
3. Update `.env` with MongoDB credentials
4. Start development: `npm run dev`

### Frontend Setup
1. Navigate to client folder: `cd client`
2. Install dependencies: `npm install`
3. Update `.env` with API endpoint
4. Start development: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/logout` - Logout user

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (admin)
- `PUT /api/properties/:id` - Update property (admin)
- `DELETE /api/properties/:id` - Delete property (admin)

### Bookings
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update status
- `DELETE /api/bookings/:id` - Cancel booking

### Employees
- `GET /api/employees` - Get all employees (admin)
- `POST /api/employees` - Create employee (admin)
- `GET /api/employees/dashboard/stats` - Dashboard stats

## Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/realestate
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

## Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS, Axios
- **Backend**: Express.js, Mongoose, JWT, bcryptjs, multer
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens
- **File Upload**: Multer

## License

ISC
