import { Request, Response } from 'express';
import { GetKpis } from '../../../application/usecases/GetKpis';
import { GetRevenueTrend } from '../../../application/usecases/GetRevenueTrend';
import { GetTopProducts } from '../../../application/usecases/GetTopProducts';
import { FilterParams } from '../../../domain/entities/Kpi';

export class KpiController {
  constructor(
    private readonly getKpis: GetKpis,
    private readonly getRevenueTrend: GetRevenueTrend,
    private readonly getTopProducts: GetTopProducts
  ) {}

  async kpis(req: Request, res: Response) {
    try {
      const filters = this.parseFilters(req);
      const result = await this.getKpis.execute(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async trend(req: Request, res: Response) {
    try {
      const filters = this.parseFilters(req);
      const grain = req.query.grain === 'week' ? 'week' : 'day';
      const result = await this.getRevenueTrend.execute(filters, grain);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async rankings(req: Request, res: Response) {
    try {
      const filters = this.parseFilters(req);
      const metric = req.query.metric === 'gmv' ? 'gmv' : 'revenue';
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const result = await this.getTopProducts.execute(filters, metric, limit);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private parseFilters(req: Request): FilterParams {
    const { from, to, orderStatus, categoryName, customerState } = req.query;
    if (!from || !to) throw new Error('Los parámetros from y to son obligatorios');
    if (new Date(from as string) > new Date(to as string)) throw new Error('El rango de fechas no es válido');
    return {
      from: from as string,
      to: to as string,
      orderStatus: orderStatus as string,
      categoryName: categoryName as string,
      customerState: customerState as string
    };
  }
}