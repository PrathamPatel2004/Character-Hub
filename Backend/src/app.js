import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './Config/connectDB.js';
import cookieParser from 'cookie-parser';

import userRouter from './Routes/auth.js';
import categoryRouter from './Routes/categoryRoutes.js';
import characterRouter from './Routes/characterRoutes.js';
import seriesRouter from './Routes/seriesRoutes.js';
import uploadRouter from './Routes/uploadRoutes.js';
import searchRouter from './Routes/searchRoutes.js';
import commentRouter from './Routes/commentRoute.js';

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));

app.use(cookieParser());
app.use(express.json());

app.get('/api/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/auth', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/characters', characterRouter);
app.use('/api/series', seriesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/search', searchRouter);
app.use('/api/comments', commentRouter);

export default app;