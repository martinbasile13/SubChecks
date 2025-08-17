-- SCRIPT PARA ARREGLAR ACCESO PÚBLICO A LAS TABLAS
-- Ejecuta esto en el SQL Editor de Supabase Dashboard

-- 1. OPCIÓN RÁPIDA: Deshabilitar RLS completamente (más simple)
ALTER TABLE public.saldo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_pagos DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.pagos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que se deshabilitó correctamente
SELECT 
    schemaname,
    tablename, 
    rowsecurity as "RLS_Habilitado",
    CASE 
        WHEN rowsecurity = true THEN '❌ Habilitado (bloquea acceso público)'
        ELSE '✅ Deshabilitado (permite acceso público)'
    END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('saldo', 'historial_pagos', 'pagos')
ORDER BY tablename;

-- 3. Verificar que hay datos en las tablas
SELECT 'saldo' as tabla, count(*) as total_registros, 
       string_agg(DISTINCT aplicacion, ', ') as aplicaciones_encontradas
FROM public.saldo
UNION ALL
SELECT 'historial_pagos' as tabla, count(*) as total_registros,
       string_agg(DISTINCT aplicacion, ', ') as aplicaciones_encontradas  
FROM public.historial_pagos
UNION ALL
SELECT 'pagos' as tabla, count(*) as total_registros,
       string_agg(DISTINCT aplicacion, ', ') as aplicaciones_encontradas
FROM public.pagos;

-- 4. Si prefieres mantener RLS pero permitir acceso público (ALTERNATIVA):
-- ALTER TABLE public.saldo ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.historial_pagos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "allow_read_saldo" ON public.saldo FOR SELECT USING (true);
-- CREATE POLICY "allow_read_historial" ON public.historial_pagos FOR SELECT USING (true);
-- CREATE POLICY "allow_read_pagos" ON public.pagos FOR SELECT USING (true);

-- Para usuarios autenticados (operaciones de modificación):
-- CREATE POLICY "allow_auth_saldo" ON public.saldo FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "allow_auth_historial" ON public.historial_pagos FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "allow_auth_pagos" ON public.pagos FOR ALL USING (auth.uid() IS NOT NULL);
