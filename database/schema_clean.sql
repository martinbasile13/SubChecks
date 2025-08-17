-- Schema limpio para SubChecks - Solo estructuras básicas
-- Sin triggers, funciones o lógica automática

-- 1. Tabla de pagos - Registro de todos los pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    aplicacion VARCHAR(100) NOT NULL, -- spotify, youtube, netflix, etc.
    monto DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de saldo - Saldos de usuarios por remitente
CREATE TABLE IF NOT EXISTS saldo (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) DEFAULT 0.00,
    remitente VARCHAR(100) NOT NULL, -- nombre del remitente que hizo el pago
    aplicacion VARCHAR(100), -- aplicación específica (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de historial_pagos - Historial simplificado
CREATE TABLE IF NOT EXISTS historial_pagos (
    id SERIAL PRIMARY KEY,
    remitente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remitente_nombre VARCHAR(100) NOT NULL, -- nombre de quien realmente hizo el pago
    aplicacion VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pago_id INTEGER REFERENCES pagos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos para rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_aplicacion ON pagos(aplicacion);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);

CREATE INDEX IF NOT EXISTS idx_saldo_usuario ON saldo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_saldo_remitente ON saldo(remitente);
CREATE INDEX IF NOT EXISTS idx_saldo_aplicacion ON saldo(aplicacion);

CREATE INDEX IF NOT EXISTS idx_historial_remitente_id ON historial_pagos(remitente_id);
CREATE INDEX IF NOT EXISTS idx_historial_remitente_nombre ON historial_pagos(remitente_nombre);
CREATE INDEX IF NOT EXISTS idx_historial_aplicacion ON historial_pagos(aplicacion);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_pagos(fecha_creacion);

-- Solo trigger básico para updated_at
CREATE OR REPLACE FUNCTION simple_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pagos_updated_at
    BEFORE UPDATE ON pagos
    FOR EACH ROW 
    EXECUTE FUNCTION simple_update_updated_at();

CREATE TRIGGER trigger_update_saldo_updated_at
    BEFORE UPDATE ON saldo
    FOR EACH ROW 
    EXECUTE FUNCTION simple_update_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE pagos IS 'Tabla para registrar todos los pagos realizados';
COMMENT ON TABLE saldo IS 'Tabla para mantener saldos por remitente y aplicación';
COMMENT ON TABLE historial_pagos IS 'Historial simplificado de pagos con información del remitente';

COMMENT ON COLUMN saldo.remitente IS 'Nombre de la persona que realmente hizo el pago';
COMMENT ON COLUMN saldo.aplicacion IS 'Aplicación específica, puede ser NULL para saldo general';
COMMENT ON COLUMN historial_pagos.remitente_nombre IS 'Nombre de quien hizo el pago real';

SELECT 'Schema limpio creado exitosamente' as status;
