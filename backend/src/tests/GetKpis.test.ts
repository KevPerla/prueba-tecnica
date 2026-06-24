import { GetKpis } from '../../src/application/usecases/GetKpis';
import { KpiRepository } from '../../src/domain/ports/KpiRepository';
import { KpiResult, FilterParams } from '../../src/domain/entities/Kpi';

const mockKpiResult: KpiResult = {
  gmv: 100000,
  revenue: 95000,
  orders: 500,
  aov: 190,
  itemsPerOrder: 1.2,
  cancellationRate: 0.02,
  onTimeDelivery: 0.95,
};

const mockRepository: KpiRepository = {
  getKpis: jest.fn().mockResolvedValue(mockKpiResult),
  getRevenueTrend: jest.fn(),
  getTopProducts: jest.fn(),
};

describe('GetKpis use case', () => {
  it('debe retornar los KPIs correctamente', async () => {
    const useCase = new GetKpis(mockRepository);
    const filters: FilterParams = { from: '2017-01-01', to: '2018-12-31' };
    const result = await useCase.execute(filters);
    expect(result.gmv).toBe(100000);
    expect(result.orders).toBe(500);
    expect(result.aov).toBe(190);
  });

  it('debe llamar al repositorio con los filtros correctos', async () => {
    const useCase = new GetKpis(mockRepository);
    const filters: FilterParams = { from: '2017-01-01', to: '2018-12-31' };
    await useCase.execute(filters);
    expect(mockRepository.getKpis).toHaveBeenCalledWith(filters);
  });
});