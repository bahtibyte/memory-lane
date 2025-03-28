import dotenv from 'dotenv'; dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from "morgan";

import router from './routes.js';

const isDevelopment = process.env.NODE_ENV === 'development';
const APP_PORT = process.env.NODE_PORT || 3000;

const corsOptions = {
  origin: !isDevelopment ? process.env.NODE_CLIENT_ADDRESS : true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("short"));

app.use('/api', router);

async function startServer() {
  app.listen(APP_PORT, () => {
    console.log(`Memory Lane server running on port ${APP_PORT}`);
  });
}

startServer();