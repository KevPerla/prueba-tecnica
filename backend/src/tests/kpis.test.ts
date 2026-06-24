import request from 'supertest';
import app from '../../src/index';

describe('GET /health', () => {
  it('debe retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /kpis', () => {
  it('debe retornar error 400 si faltan fechas', async () => {
    const res = await request(app).get('/kpis');
    expect(res.status).toBe(400);
  });

  it('debe retornar KPIs con fechas válidas', async () => {
    const res = await request(app).get('/kpis?from=2017-01-01&to=2018-12-31');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('gmv');
    expect(res.body).toHaveProperty('revenue');
    expect(res.body).toHaveProperty('orders');
  }, 15000);
});