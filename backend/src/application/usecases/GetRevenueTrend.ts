import { KpiRepository } from '../../domain/ports/KpiRepository';
import { FilterParams } from '../../domain/entities/Kpi';

export class GetRevenueTrend {
  constructor(private readonly kpiRepository: KpiRepository) {}

  async execute(filters: FilterParams, grain: 'day' | 'week') {
    return this.kpiRepository.getRevenueTrend(filters, grain);
  }
}