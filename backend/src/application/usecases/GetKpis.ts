import { KpiRepository } from '../../domain/ports/KpiRepository';
import { FilterParams } from '../../domain/entities/Kpi';

export class GetKpis {
  constructor(private readonly kpiRepository: KpiRepository) {}

  async execute(filters: FilterParams) {
    return this.kpiRepository.getKpis(filters);
  }
}