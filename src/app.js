import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import env from './config/env'
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

app.get('api/health', (req, res) => {
    res.status(200).json({
        message: "Backend is running",
    });
});

app.use('api/auth', authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;