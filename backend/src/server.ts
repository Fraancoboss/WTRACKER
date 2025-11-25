import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import pedidosRouter from './routes/pedidos.js';

const app = express();

const allowedOrigins = process.env.FRONTEND_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : undefined,
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/pedidos', pedidosRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Error inesperado' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}`);
});
