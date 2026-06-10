import express from 'express';
import connectDB from './config/connectDB.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import dotenv from 'dotenv';
import cors from 'cors';
import cookiesParser from 'cookie-parser';
import interviewRouter from './routes/interview.js';
import paymentRouter from './routes/payment.js';
dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://ai-interview-agent-by-saikat-pradhan.onrender.com',
  credentials: true
}));

app.use(express.json());
app.use(cookiesParser());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/payment', paymentRouter)

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});