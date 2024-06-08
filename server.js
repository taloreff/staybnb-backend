import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { config } from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";

config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;

// if (process.env.NODE_ENV === 'production') {
//   console.log('production');
//   app.use(express.static(path.resolve('public')));
// } else {
console.log('development');
const corsOptions = {
  origin: [
    'http://127.0.0.1:5000',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ],
  credentials: true
}
app.use(cors(corsOptions));
// }

app.use(cookieParser());
app.use(express.json());

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { stayRoutes } from "./api/stay/stay.routes.js"
import { setupSocketAPI } from './services/socket.service.js '

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/stay', stayRoutes)

setupSocketAPI(server)

app.get("/**", (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
