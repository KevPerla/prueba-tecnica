import { GetTopProducts } from '../../src/application/usecases/GetTopProducts';
import { KpiRepository } from '../../src/domain/ports/KpiRepository';
import { TopProduct, FilterParams } from '../../src/domain/entities/Kpi';

const mockProducts: TopProduct[] = [
  { productId: 'abc123', categoryName: 'electronics', gmv: 50000, revenue: 48000 },
  { productId: 'def456', categoryName: 'furniture', gmv: 30000, revenue: 28000 },
];

const mockRepository: KpiRepository = {
  getKpis: jest.fn(),
  getRevenueTrend: jest.fn(),
  getTopProducts: jest.fn().mockResolvedValue(mockProducts),
};

describe('GetTopProducts use case', () => {
  it('debe retornar la lista de productos correctamente', async () => {
    const useCase = new GetTopProducts(mockRepository);
    const filters: FilterParams = { from: '2017-01-01', to: '2018-12-31' };
    const result = await useCase.execute(filters, 'revenue', 10);
    expect(result).toHaveLength(2);
    expect(result[0].categoryName).toBe('electronics');
  });

  it('debe llamar al repositorio con métrica y límite correctos', async () => {
    const useCase = new GetTopProducts(mockRepository);
    const filters: FilterParams = { from: '2017-01-01', to: '2018-12-31' };
    await useCase.execute(filters, 'gmv', 5);
    expect(mockRepository.getTopProducts).toHaveBeenCalledWith(filters, 'gmv', 5);
  });
});