# Prueba Técnica – Full-Stack Engineer (L1)

Dashboard de monitoreo de ventas para una empresa de e-commerce usando el Brazilian E-Commerce Public Dataset de Olist (~100k órdenes).

---

## Setup

### Requisitos
- Docker Desktop
- Node.js 20+
- Git

### Pasos para correr el proyecto

1. Clonar el repositorio:
```bash
git clone 
cd prueba-tecnica
```

2. Crear el archivo `.env` en la raíz:
```env
DB_USER=kev-user12
DB_PASSWORD=L9m@ka12-@
DB_NAME=ecommerce
```

3. Levantar la base de datos:
```bash
docker-compose up -d db
```

4. Instalar dependencias e inicializar la base de datos:
```bash
cd backend
npm install
npx prisma db push
```

5. Cargar los datos raw:
```bash
npm run seed:raw
```

6. Correr el ETL (raw → clean → gold):
```bash
npm run etl
```

7. Levantar el backend:
```bash
npm run dev
```

8. En otra terminal, levantar el frontend:
```bash
cd ../frontend
npm install
npm run dev
```

### URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health

---

## Arquitectura
prueba-tecnica/

├── frontend/                  # Next.js 16 (TypeScript + Tailwind)

│   └── app/

│       ├── components/        # KpiCards, RevenueTrend, TopProducts, Filters

│       ├── lib/               # api.ts (llamadas al backend)

│       └── types/             # Interfaces TypeScript

├── backend/

│   └── src/

│       ├── domain/

│       │   ├── entities/      # Kpi.ts (interfaces de dominio)

│       │   └── ports/         # KpiRepository.ts (contratos)

│       ├── application/

│       │   └── usecases/      # GetKpis, GetRevenueTrend, GetTopProducts

│       ├── infrastructure/

│       │   └── repositories/  # KpiRepositoryImpl (Prisma + SQL)

│       └── adapters/

│           └── http/

│               ├── controllers/ # KpiController

│               └── routes/      # kpiRoutes

├── data/                      # CSVs del dataset Olist

└── docker-compose.yml

### Flujo de una petición
HTTP Request

→ KpiController (adapters/http)

→ GetKpis use case (application)

→ KpiRepository port (domain)

→ KpiRepositoryImpl (infrastructure/Prisma)

→ gold.fact_sales (PostgreSQL)

---

## Modelo estrella (gold)

### Grano de la fact
**1 fila por ítem de orden** (`order_id` + `order_item_id`)

### Tablas

| Tabla | Tipo | Atributos principales |
|-------|------|-----------------------|
| `gold.fact_sales` | Hecho | `item_price`, `freight_value`, `payment_value_allocated`, `is_delivered`, `is_canceled`, `is_on_time`, FKs a dimensiones |
| `gold.dim_date` | Dimensión | `full_date`, `year`, `month`, `day`, `week`, `quarter` |
| `gold.dim_customer` | Dimensión | `customer_id`, `state`, `city` |
| `gold.dim_product` | Dimensión | `product_id`, `category_name` |
| `gold.dim_order` | Dimensión | `order_id`, `status`, `purchase_date`, `delivered_date`, `estimated_date` |

---

## KPIs implementados

| # | KPI | Definición |
|---|-----|-----------|
| 1 | **GMV** | `Σ item_price` de `order_items` en el rango de fechas. El shipping se muestra aparte como `freight_value`. |
| 2 | **Revenue (Paid)** | `Σ payment_value_allocated` — pagos reales asignados proporcionalmente a cada ítem. |
| 3 | **Orders** | `COUNT(DISTINCT order_id)` en el rango. |
| 4 | **AOV** | `Revenue / Orders` (0 si Orders = 0). |
| 5 | **Items per Order** | `COUNT(order_item_id) / Orders`. |
| 6 | **Cancellation Rate** | `canceled_orders / total_orders`. No se incluyen órdenes `unavailable` en el numerador. |
| 7 | **On-Time Delivery** | Sobre órdenes entregadas: `delivered_customer_date <= estimated_delivery_date`. |
| 8 | **Top Products** | Ranking Top N por GMV y por Revenue (dos métricas seleccionables). |
| 9 | **Revenue Trend** | Serie temporal por día o semana de Revenue y Orders. |

---

## Regla de asignación de payment_value a nivel ítem

Una orden puede tener múltiples pagos (distintos `payment_sequential`) y múltiples ítems. Para llevar el pago al grano del ítem se aplica distribución proporcional al precio:
payment_value_allocated =

total_payment_orden * (item_price / total_price_orden)

**Ejemplo:**
- Orden con 2 ítems: $80 y $20 (total $100)
- Pago total: $105 (incluye shipping)
- Ítem 1 recibe: $105 * (80/100) = $84
- Ítem 2 recibe: $105 * (20/100) = $21

Esto garantiza que la suma de `payment_value_allocated` de todos los ítems de una orden sea igual al total pagado.

---

## Tablas cargadas en raw

| Tabla | Filas | Archivo CSV |
|-------|-------|-------------|
| `raw.raw_orders` | 99,441 | olist_orders_dataset.csv |
| `raw.raw_order_items` | 112,650 | olist_order_items_dataset.csv |
| `raw.raw_order_payments` | 103,886 | olist_order_payments_dataset.csv |
| `raw.raw_products` | 32,951 | olist_products_dataset.csv |
| `raw.raw_customers` | 99,441 | olist_customers_dataset.csv |

---

## Reglas de limpieza (clean)

| Regla | Detalle |
|-------|---------|
| Timestamps | Convertidos de `VARCHAR` a `TIMESTAMP` usando `NULLIF(..., '')::timestamp` |
| Nulos críticos | Se eliminan filas donde `order_id`, `customer_id` o `order_purchase_timestamp` son nulos |
| Precios inválidos | Se filtran ítems con `price <= 0` o nulo |
| Pagos inválidos | Se filtran pagos con `payment_value <= 0` o nulo |
| Categorías nulas | Reemplazadas por `'unknown'` usando `COALESCE` |
| Deduplicación | Manejada con `ON CONFLICT DO NOTHING` en la carga |

---

## Decisiones técnicas y tradeoffs

| Decisión | Razonamiento |
|----------|-------------|
| **Arquitectura hexagonal** | Separa el dominio del negocio de la infraestructura. Los use cases no conocen Prisma ni Express, solo trabajan con interfaces (ports). Facilita testing y cambios de tecnología. |
| **Grano a nivel ítem** | Permite analizar GMV y revenue por producto individual, calcular rankings y métricas por categoría. Un grano a nivel orden no permitiría esto. |
| **Prisma como ORM** | Tipado fuerte con TypeScript, migraciones declarativas, client auto-generado. El tradeoff es que las queries analíticas complejas se hacen con `$queryRawUnsafe` porque Prisma no soporta bien agregaciones avanzadas. |
| **ETL en Node.js** | Permite orquestar la carga raw → clean → gold en un solo comando. El tradeoff es que para datasets más grandes sería mejor usar un orquestador como Airflow. |
| **clean como vistas materializadas** | Se optó por tablas físicas en clean para simplificar el ETL. En producción serían vistas materializadas para mantener sincronía automática con raw. |
| **Backend solo consulta gold** | Las queries del API usan exclusivamente `gold.fact_sales` como driving table, con JOINs a dimensiones. Esto garantiza performance y separa la analítica de los datos operacionales. |

---

## Tests

```bash
cd backend
npm test
```

| Test | Tipo | Descripción |
|------|------|-------------|
| `GetKpis.test.ts` | Unitario | Valida que el use case retorna KPIs correctos y llama al repositorio con los filtros |
| `GetTopProducts.test.ts` | Unitario | Valida que el use case retorna productos y pasa métrica y límite correctamente |
| `kpis.test.ts` | Integración | Valida `/health` (200 ok), `/kpis` sin fechas (400), `/kpis` con fechas válidas (200 con datos) |