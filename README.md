# Chat Application

Real-time messaging platform with secure user authentication and conversation management.

## Key Features
- 🔐 JWT Authentication
- 💬 Real-time messaging with Socket.IO
- 👥 1:1 & group conversations
- 📱 Responsive React frontend
- 🚀 Express.js backend API
- 📊 MongoDB database

## Quick Start
```bash
# Clone repo
git clone https://github.com/yourusername/chatapp.git

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install

# Start servers (in separate terminals)
npm run dev # frontend
npm run dev # backend
```

## Environment Variables
Create `.env` in backend:
```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

Create `.env` in backend:
```
VITE_SERVER_URL=http://localhost:3000/api
VITE_BASE_URL=http://localhost:3000
```

## Technologies
- Backend: Node.js, Express, MongoDB, Socket.IO
- Frontend: React, Redux, Tailwind CSS