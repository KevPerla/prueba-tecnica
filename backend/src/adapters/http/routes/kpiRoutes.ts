import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { KpiRepositoryImpl } from '../../../infrastructure/repositories/KpiRepositoryImpl';
import { GetKpis } from '../../../application/usecases/GetKpis';
import { GetRevenueTrend } from '../../../application/usecases/GetRevenueTrend';
import { GetTopProducts } from '../../../application/usecases/GetTopProducts';
import { KpiController } from '../controllers/KpiController';

const router = Router();
const prisma = new PrismaClient();

const kpiRepository = new KpiRepositoryImpl(prisma);
const getKpis = new GetKpis(kpiRepository);
const getRevenueTrend = new GetRevenueTrend(kpiRepository);
const getTopProducts = new GetTopProducts(kpiRepository);
const kpiController = new KpiController(getKpis, getRevenueTrend, getTopProducts);

router.get('/kpis', (req, res) => kpiController.kpis(req, res));
router.get('/trend/revenue', (req, res) => kpiController.trend(req, res));
router.get('/rankings/products', (req, res) => kpiController.rankings(req, res));

export default router;