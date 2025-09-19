import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './Config/connectDB.js';

import userRouter from './Routes/auth.js';
import categoryRouter from './Routes/categoryRoutes.js';
import characterRouter from './Routes/characterRoutes.js';
import seriesRouter from './Routes/seriesRoutes.js';
import uploadRouter from './Routes/uploadRoutes.js';
import searchRouter from './Routes/searchRoutes.js';
import commentRouter from './Routes/commentRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  next();
});

const allowedOrigins = [
  'process.env.FRONTEND_URL',
  'http://localhost:3000' // ✅ For local development (remove in production)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: `Server is running on PORT ${PORT}` });
});

app.use('/api/auth', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/characters', characterRouter);
app.use('/api/series', seriesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/search', searchRouter);
app.use('/api/comments', commentRouter);

app.get('/api/check-cookie', (req, res) => {
  const token = req.cookies.accesstoken;
  res.json({ tokenExists: !!token, token });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("✅ Server is running on PORT", PORT);
  });
});

})
