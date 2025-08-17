-- Script SQL para crear las tablas de SubChecks en Supabase

-- 1. Tabla de pagos - Registro de pagos a diferentes aplicaciones/servicios
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    aplicacion VARCHAR(100) NOT NULL, -- spotify, youtube, netflix, etc.
    monto DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de saldo - Saldos de todos los usuarios
CREATE TABLE saldo (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) DEFAULT 0.00,
    remitente VARCHAR(100), -- nombre o identificador del remitente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id)
);

-- 3. Tabla de historial_pagos - Historial de pagos compartidos entre usuarios
CREATE TABLE historial_pagos (
    id SERIAL PRIMARY KEY,
    remitente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aplicacion VARCHAR(100) NOT NULL, -- spotify, youtube, netflix, etc.
    monto DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pago_id INTEGER REFERENCES pagos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_aplicacion ON pagos(aplicacion);
CREATE INDEX idx_pagos_fecha ON pagos(fecha);

CREATE INDEX idx_saldo_usuario ON saldo(usuario_id);

CREATE INDEX idx_historial_remitente ON historial_pagos(remitente_id);
CREATE INDEX idx_historial_aplicacion ON historial_pagos(aplicacion);
CREATE INDEX idx_historial_fecha ON historial_pagos(fecha_creacion);

-- Función para actualizar el timestamp updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saldo_updated_at BEFORE UPDATE ON saldo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para distribuir el costo entre usuarios cuando se agrega un pago
CREATE OR REPLACE FUNCTION distribuir_costo_pago()
RETURNS TRIGGER AS $$
DECLARE
    total_usuarios INTEGER;
    costo_por_usuario DECIMAL(10,2);
BEGIN
    -- Contar total de usuarios con saldo
    SELECT COUNT(*) INTO total_usuarios FROM saldo;
    
    -- Si no hay usuarios con saldo, crear entrada para el usuario que paga
    IF total_usuarios = 0 THEN
        INSERT INTO saldo (usuario_id, monto, remitente) 
        VALUES (NEW.usuario_id, -NEW.monto, 'sistema');
    ELSE
        -- Calcular costo por usuario
        costo_por_usuario := NEW.monto / total_usuarios;
        
        -- Restar el costo prorrateado a todos los usuarios
        UPDATE saldo 
        SET monto = monto - costo_por_usuario,
            updated_at = NOW();
        
        -- Crear entrada en historial_pagos
        INSERT INTO historial_pagos (remitente_id, aplicacion, monto, pago_id)
        VALUES (NEW.usuario_id, NEW.aplicacion, NEW.monto, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la distribución de costos automáticamente
CREATE TRIGGER trigger_distribuir_costo 
    AFTER INSERT ON pagos
    FOR EACH ROW 
    EXECUTE FUNCTION distribuir_costo_pago();

-- RLS (Row Level Security) - Solo usuarios autenticados pueden insertar pagos
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_pagos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad

-- Pagos: Solo el usuario autenticado puede insertar sus propios pagos
-- Pero todos pueden ver todos los pagos (acceso público para lectura)
CREATE POLICY "Los usuarios pueden insertar sus propios pagos" ON pagos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Todos pueden ver los pagos" ON pagos
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden actualizar sus propios pagos" ON pagos
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios pagos" ON pagos
    FOR DELETE USING (auth.uid() = usuario_id);

-- Saldo: Los usuarios pueden ver todos los saldos, pero solo actualizar el propio
CREATE POLICY "Todos pueden ver los saldos" ON saldo
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden insertar su propio saldo" ON saldo
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar su propio saldo" ON saldo
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Historial: Todos pueden ver el historial (acceso público)
CREATE POLICY "Todos pueden ver el historial de pagos" ON historial_pagos
    FOR SELECT USING (true);

-- Solo el sistema puede insertar en historial (a través del trigger)
CREATE POLICY "Solo inserción automática en historial" ON historial_pagos
    FOR INSERT WITH CHECK (true);

-- Insertar algunos datos de ejemplo (opcional)
-- Nota: Estos INSERTs solo funcionarán después de tener usuarios registrados

-- Comentarios para documentar la estructura
COMMENT ON TABLE pagos IS 'Tabla para registrar pagos a diferentes aplicaciones como Spotify, YouTube, Netflix, etc.';
COMMENT ON TABLE saldo IS 'Tabla para mantener el saldo de cada usuario, se actualiza automáticamente cuando se registran pagos';
COMMENT ON TABLE historial_pagos IS 'Historial de todos los pagos realizados, visible para todos los usuarios';

COMMENT ON COLUMN pagos.aplicacion IS 'Nombre de la aplicación o servicio pagado (spotify, youtube, netflix, etc.)';
COMMENT ON COLUMN pagos.monto IS 'Monto del pago realizado';
COMMENT ON COLUMN pagos.usuario_id IS 'ID del usuario que realizó el pago (debe estar autenticado)';

COMMENT ON COLUMN saldo.monto IS 'Saldo actual del usuario (puede ser negativo)';
COMMENT ON COLUMN saldo.remitente IS 'Identificador del remitente o fuente del saldo';

COMMENT ON COLUMN historial_pagos.aplicacion IS 'Aplicación o servicio al que se realizó el pago';
COMMENT ON COLUMN historial_pagos.monto IS 'Monto del pago registrado en el historial';
COMMENT ON COLUMN historial_pagos.pago_id IS 'Referencia al pago original que generó esta entrada de historial';
