# SL Eats Connect 🍛

**AI-Powered Restaurant Discovery and Reservation Platform for Sri Lanka**

SL Eats Connect is a full-stack web application that helps people in Sri Lanka discover restaurants, make table reservations, and earn loyalty points — all through a modern web interface or by chatting with Nila, an AI-powered food guide.

Live site: **https://sri-lanka-eats-connect.vercel.app**

---

## Features

### For Customers
- Browse and search 50+ restaurants across Sri Lanka by city, cuisine, and price range
- View restaurant details including menu, opening hours, reviews, and Google Maps location
- Make table reservations manually from the restaurant page
- Chat with **Nila** 🍛 — an AI chatbot that finds restaurants and completes bookings through natural conversation in English, Sinhala, or Tamil
- Earn **Eats Points** on every reservation (points expire after 12 months of inactivity)
- Save favourite restaurants and view them on a dedicated page
- Receive email confirmation after every booking

### For Vendors
- Register as a vendor and automatically get a restaurant listing created
- Manage restaurant details, photos, opening hours, and contact information
- View and manage all incoming reservations
- Update real-time table availability with custom notes
- Reply to customer reviews

### For Admins
- View and manage all users, restaurants, and reservations from a central dashboard
- Suspend or activate restaurant listings
- Promote users to admin role

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| AI Chatbot | OpenAI GPT-4o-mini (function calling) |
| Authentication | JSON Web Tokens (JWT) |
| Email | Nodemailer (Gmail SMTP) |
| Maps | Google Maps JavaScript API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

### 1. Clone the repository
```bash
git clone https://github.com/DewniV/Sri-Lanka-Eats-Connect.git
cd Sri-Lanka-Eats-Connect
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

Start the backend:
```bash
node server.js
```
The API will run on `http://localhost:5000`

### 3. Set up the frontend
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` folder:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Project Structure

```
Sri-Lanka-Eats-Connect/
├── backend/
│   ├── models/          # Mongoose schemas (User, Restaurant, Reservation, Review, EatsPoints)
│   ├── routes/          # Express API routes (auth, restaurants, reservations, chatbot, admin...)
│   ├── middleware/       # JWT authentication middleware
│   └── server.js        # Express app entry point
└── frontend/
    ├── app/             # Next.js pages (home, restaurants, profile, vendor, admin...)
    ├── components/      # Reusable UI components (navigation, ChatWidget...)
    └── public/          # Static assets
```

---

## How the AI Chatbot Works

Nila uses OpenAI's **function calling** feature to interact with the live database:

1. User sends a message (e.g. "Find a seafood restaurant in Colombo")
2. The AI calls the `search_restaurants` tool → queries MongoDB in real time
3. Results are presented conversationally
4. User picks a restaurant; AI collects date, time, party size, and name
5. AI calls `check_availability` → verifies tables are available
6. User confirms → AI calls `make_reservation` → booking saved to database
7. Confirmation emails sent to customer and vendor automatically

The chatbot only uses restaurants that exist in the database — it never invents restaurant names or IDs.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `OPENAI_API_KEY` | Yes | OpenAI API key for the chatbot |
| `SMTP_USER` | Optional | Gmail address for sending emails |
| `SMTP_PASS` | Optional | Gmail App Password |

---

## Making Yourself an Admin

After registering on the platform, go to MongoDB Atlas → your `users` collection → find your account → change `role` from `"customer"` to `"admin"`. Log out and back in, then visit `/admin`.

---

## Academic Context

This project was developed as a final year project at (Plymouth University) NSBM Sri Lanka, academic year 2026

This project was created for academic purposes.
