# Migración: Agregar columna 'aplicacion' a tabla saldo

Esta migración agrega la columna `aplicacion` a la tabla `saldo` para permitir el tracking de saldos específicos por aplicación para cada usuario.

## ¿Por qué es necesario?

Anteriormente, cada usuario tenía un solo saldo global. Ahora necesitamos que cada usuario pueda tener diferentes saldos según la aplicación:

- **Antes:** Un usuario tiene un saldo de $10 (general)
- **Después:** Un usuario puede tener $5 en YouTube Premium y $3 en Crunchyroll

## Cambios incluidos

### 1. Estructura de base de datos
- ✅ Agrega columna `aplicacion VARCHAR(100)` a tabla `saldo`
- ✅ Elimina constraint UNIQUE solo en `usuario_id` 
- ✅ Agrega constraint UNIQUE en combinación `(usuario_id, aplicacion)`
- ✅ Agrega índices para mejorar performance

### 2. Función de distribución de costos
- ✅ Actualizada para manejar saldos por aplicación específica
- ✅ Usa `ON CONFLICT` para manejar upserts correctamente
- ✅ Calcula costos prorrateados solo entre usuarios de la misma aplicación

### 3. Frontend (Header.tsx)
- ✅ Nuevo estado para manejo de historial y saldos
- ✅ Funciones para cargar historial filtrado por aplicación
- ✅ Funciones para cargar saldos filtrados por aplicación
- ✅ Nueva vista "Historial y Saldos" con interfaz DaisyUI
- ✅ Tabla responsive para mostrar historial de pagos
- ✅ Cards para mostrar saldos actuales por aplicación
- ✅ Filtro por aplicación

## Cómo aplicar la migración

### Paso 1: Ejecutar migración en Supabase
```sql
-- Copiar y ejecutar el contenido de migration_add_aplicacion_to_saldo.sql
-- en el SQL Editor de Supabase
```

### Paso 2: Verificar la migración
```sql
-- Verificar que la columna fue agregada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'saldo';

-- Verificar constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'saldo';
```

### Paso 3: Probar funcionalidad
1. Registrar un pago desde la interfaz
2. Verificar que se crea entrada en `saldo` con columna `aplicacion`
3. Verificar que aparece en historial filtrado por aplicación

## Estructura resultante

### Tabla `saldo` después de migración:
```sql
                                    Table "public.saldo"
    Column     |           Type           | Collation | Nullable |      Default      
---------------+--------------------------+-----------+----------+-------------------
 id            | integer                  |           | not null | nextval('saldo_id_seq'::regclass)
 usuario_id    | uuid                     |           |          | 
 monto         | numeric(10,2)            |           |          | 0.00
 remitente     | character varying(100)   |           |          | 
 aplicacion    | character varying(100)   |           |          | 
 created_at    | timestamp with time zone |           |          | now()
 updated_at    | timestamp with time zone |           |          | now()

Indexes:
    "saldo_pkey" PRIMARY KEY, btree (id)
    "saldo_usuario_aplicacion_unique" UNIQUE CONSTRAINT, btree (usuario_id, aplicacion)
    "idx_saldo_aplicacion" btree (aplicacion)
    "idx_saldo_usuario" btree (usuario_id)
    "idx_saldo_usuario_aplicacion" btree (usuario_id, aplicacion)
```

## Ejemplos de uso

### Registrar pago YouTube Premium
```sql
INSERT INTO pagos (aplicacion, monto, usuario_id) 
VALUES ('YouTube Premium', 11.99, 'user-uuid-1');
```

### Ver saldos por aplicación
```sql
SELECT u.email, s.aplicacion, s.monto 
FROM saldo s 
JOIN auth.users u ON s.usuario_id = u.id 
WHERE s.aplicacion = 'YouTube Premium'
ORDER BY s.monto DESC;
```

### Ver historial de una aplicación específica
```sql
SELECT hp.*, u.email as pagado_por 
FROM historial_pagos hp
JOIN auth.users u ON hp.remitente_id = u.id
WHERE hp.aplicacion = 'YouTube Premium'
ORDER BY hp.fecha_creacion DESC;
```
