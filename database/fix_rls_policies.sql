-- Script para verificar y configurar políticas de acceso público
-- Este script debe ejecutarse en el panel de Supabase SQL Editor

-- 1. Verificar si RLS está habilitado en las tablas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('saldo', 'historial_pagos', 'pagos');

-- 2. Habilitar RLS si no está habilitado (opcional, solo si necesitas seguridad)
-- ALTER TABLE public.saldo ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.historial_pagos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- 3. OPCIÓN A: Deshabilitar RLS para acceso público completo (más simple)
ALTER TABLE public.saldo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos DISABLE ROW LEVEL SECURITY;

-- 4. OPCIÓN B: Si prefieres mantener RLS, crear políticas de acceso público
-- Política para lectura pública de saldo
-- CREATE POLICY "saldo_select_policy" ON public.saldo FOR SELECT USING (true);

-- Política para lectura pública de historial_pagos
-- CREATE POLICY "historial_select_policy" ON public.historial_pagos FOR SELECT USING (true);

-- Política para lectura pública de pagos
-- CREATE POLICY "pagos_select_policy" ON public.pagos FOR SELECT USING (true);

-- Políticas para usuarios autenticados (INSERT, UPDATE, DELETE)
-- CREATE POLICY "saldo_auth_policy" ON public.saldo FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "historial_auth_policy" ON public.historial_pagos FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "pagos_auth_policy" ON public.pagos FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Verificar datos existentes
SELECT 'SALDOS' as tabla, count(*) as total, aplicacion 
FROM public.saldo 
GROUP BY aplicacion
UNION ALL
SELECT 'HISTORIAL' as tabla, count(*) as total, aplicacion 
FROM public.historial_pagos 
GROUP BY aplicacion
UNION ALL
SELECT 'PAGOS' as tabla, count(*) as total, aplicacion 
FROM public.pagos 
GROUP BY aplicacion;
