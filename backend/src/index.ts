import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kpiRoutes from './adapters/http/routes/kpiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

app.use('/', kpiRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;