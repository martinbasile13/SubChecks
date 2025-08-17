# Base de Datos SubChecks

## Estructura de la Base de Datos

### Tablas Principales

#### 1. `pagos`
Registra todos los pagos realizados a diferentes aplicaciones/servicios.
- **Acceso**: Solo usuarios autenticados pueden insertar, todos pueden leer
- **Función**: Almacenar pagos de Spotify, YouTube, Netflix, etc.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PK | Identificador único |
| aplicacion | VARCHAR(100) | Nombre del servicio (spotify, netflix, etc.) |
| monto | DECIMAL(10,2) | Cantidad pagada |
| fecha | TIMESTAMP | Fecha del pago |
| usuario_id | UUID | Usuario que realizó el pago |
| descripcion | TEXT | Descripción opcional |

#### 2. `saldo`
Mantiene el saldo actual de cada usuario.
- **Acceso**: Todos pueden leer, usuarios solo pueden modificar su propio saldo
- **Función**: Se actualiza automáticamente cuando hay pagos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PK | Identificador único |
| usuario_id | UUID | Usuario propietario del saldo |
| monto | DECIMAL(10,2) | Saldo actual (puede ser negativo) |
| remitente | VARCHAR(100) | Fuente del saldo |

#### 3. `historial_pagos`
Historial completo de todos los pagos realizados.
- **Acceso**: Lectura pública, inserción automática por triggers
- **Función**: Registro histórico de todas las transacciones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PK | Identificador único |
| remitente_id | UUID | Usuario que realizó el pago |
| aplicacion | VARCHAR(100) | Servicio pagado |
| monto | DECIMAL(10,2) | Monto del pago |
| fecha_creacion | TIMESTAMP | Fecha del registro |
| pago_id | INTEGER | Referencia al pago original |

## Funcionalidades Automáticas

### Distribución de Costos
Cuando se registra un pago:
1. Se calcula el costo por usuario (monto ÷ total de usuarios)
2. Se resta este monto del saldo de todos los usuarios
3. Se crea una entrada en `historial_pagos`

### Triggers Activos
- `trigger_distribuir_costo`: Distribuye automáticamente los costos
- `update_*_updated_at`: Actualiza timestamps automáticamente
- `trigger_limpiar_historial`: Limpia datos huérfanos

## Funciones Útiles

### Para el Frontend
```sql
-- Obtener gastos por aplicación
SELECT * FROM obtener_gastos_por_aplicacion('2024-01-01', '2024-12-31');

-- Ver balance de usuario
SELECT obtener_balance_usuario('uuid-del-usuario');

-- Estadísticas del mes
SELECT * FROM obtener_estadisticas_mes_actual();

-- Agregar saldo manual
SELECT agregar_saldo_usuario('uuid-del-usuario', 1000.00, 'deposito');

-- Historial de usuario
SELECT * FROM obtener_historial_usuario('uuid-del-usuario', 20);
```

### Vistas Disponibles
- `vista_pagos_completa`: Pagos con información de usuario
- `vista_ranking_usuarios`: Ranking por contribuciones

## Seguridad (RLS)

### Políticas Implementadas
- **Pagos**: Solo usuarios autenticados pueden crear/editar sus propios pagos
- **Lectura pública**: Todos pueden ver pagos, saldos e historial
- **Saldos**: Usuarios solo pueden modificar su propio saldo

### Autenticación
- Usa el sistema de autenticación integrado de Supabase (`auth.users`)
- Los `usuario_id` referencian automáticamente a usuarios autenticados

## Instalación

### 1. Ejecutar en Supabase SQL Editor
```sql
-- Primero ejecutar el schema principal
-- Copiar y pegar el contenido de schema.sql

-- Luego las funciones adicionales
-- Copiar y pegar el contenido de functions.sql
```

### 2. Verificar Instalación
```sql
-- Verificar que las tablas se crearon correctamente
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pagos', 'saldo', 'historial_pagos');

-- Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

## Uso desde el Frontend

### Aplicaciones Sugeridas
Para el dropdown de aplicaciones en el frontend:
- `spotify`, `youtube_premium`, `netflix`, `disney_plus`
- `amazon_prime`, `hbo_max`, `apple_music`, `crunchyroll`
- `canva_pro`, `adobe_creative`, `github_pro`, `figma_pro`
- `chatgpt_plus`, `midjourney`, `otros`

### Flujo de Trabajo
1. **Usuario se registra/inicia sesión** → Supabase Auth
2. **Usuario registra un pago** → INSERT en `pagos`
3. **Sistema distribuye costos** → Trigger actualiza `saldo` y `historial_pagos`
4. **Cualquiera ve el historial** → SELECT desde vistas públicas

## Consideraciones

### Escalabilidad
- Los índices están optimizados para consultas frecuentes
- Las funciones usan LANGUAGE plpgsql para mejor performance

### Mantenimiento
- Los triggers mantienen la consistencia automáticamente
- Las funciones de limpieza evitan datos huérfanos

### Monitoreo
- Usar las vistas y funciones para generar reportes
- Monitorear saldos negativos para identificar deudores
