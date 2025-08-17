-- Migración para agregar columna remitente_nombre a historial_pagos
-- Esto nos permitirá saber exactamente quién hizo cada pago

-- 1. Agregar la columna remitente_nombre
ALTER TABLE historial_pagos 
ADD COLUMN IF NOT EXISTS remitente_nombre VARCHAR(100);

-- 2. Crear índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_historial_remitente_nombre ON historial_pagos(remitente_nombre);

-- 3. Actualizar registros existentes (si los hay) con un valor por defecto
UPDATE historial_pagos 
SET remitente_nombre = 'usuario_desconocido' 
WHERE remitente_nombre IS NULL;

-- 4. Hacer la columna NOT NULL después de actualizar
ALTER TABLE historial_pagos 
ALTER COLUMN remitente_nombre SET NOT NULL;

-- Comentario
COMMENT ON COLUMN historial_pagos.remitente_nombre IS 'Nombre de la persona que realmente hizo el pago';

SELECT 'Columna remitente_nombre agregada exitosamente a historial_pagos' as status;
