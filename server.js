import express, { json } from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { connect, Schema, model } from "mongoose";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

config();
const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3030;
// const MongoDB = process.env.MongoDB;

// console.log("MongoDB", MongoDB);
// connect(MongoDB)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')))
} else {
  const corsOptions = {
    origin: ['http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173'
    ],
    credentials: true
  }
  app.use(cors(corsOptions));
}

app.use(cookieParser());
app.use(json());

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { setupSocketAPI } from './services/socket.service.js '

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

setupSocketAPI(server)

app.get("/**", (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
