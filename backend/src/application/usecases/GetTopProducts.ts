import { KpiRepository } from '../../domain/ports/KpiRepository';
import { FilterParams } from '../../domain/entities/Kpi';

export class GetTopProducts {
  constructor(private readonly kpiRepository: KpiRepository) {}

  async execute(filters: FilterParams, metric: 'gmv' | 'revenue', limit: number) {
    return this.kpiRepository.getTopProducts(filters, metric, limit);
  }
}