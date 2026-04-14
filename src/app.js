import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import env from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(
    cors({
        origin: env.clientUrl,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        message: "Backend is running",
    });
});

app.get('/hello-check-123', (req, res) => {
  res.json({ message: 'THIS IS MY REAL APP' });
});


app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;