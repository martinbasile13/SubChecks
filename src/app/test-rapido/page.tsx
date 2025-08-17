'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestRapido() {
  useEffect(() => {
    const test = async () => {
      console.log('=== INICIO TEST SUPABASE ===');
      
      // 1. Verificar configuración
      console.log('Variables de entorno:');
      console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENTE' : 'FALTA');
      
      // 2. Test de conexión simple
      console.log('\n--- Test de conexión ---');
      try {
        const { data, error } = await supabase.from('saldo').select('count');
        console.log('Resultado conexión saldo:', { data, error });
        
        if (error) {
          console.error('❌ ERROR CONEXIÓN:', error);
          if (error.message.includes('permission')) {
            console.log('💡 SOLUCIÓN: Problema de permisos RLS');
            console.log('Ejecuta en Supabase SQL Editor:');
            console.log('ALTER TABLE public.saldo DISABLE ROW LEVEL SECURITY;');
          }
        } else {
          console.log('✅ Conexión OK, probando obtener datos...');
          
          // 3. Obtener datos reales
          const { data: saldos } = await supabase.from('saldo').select('*').limit(5);
          const { data: historial } = await supabase.from('historial_pagos').select('*').limit(5);
          const { data: pagos } = await supabase.from('pagos').select('*').limit(5);
          
          console.log('\n--- DATOS ENCONTRADOS ---');
          console.log('Saldos:', saldos);
          console.log('Historial:', historial);
          console.log('Pagos:', pagos);
          
          if (saldos?.length) {
            console.log('Aplicaciones en saldos:', [...new Set(saldos.map(s => s.aplicacion))]);
          }
          if (historial?.length) {
            console.log('Aplicaciones en historial:', [...new Set(historial.map(h => h.aplicacion))]);
          }
          if (pagos?.length) {
            console.log('Aplicaciones en pagos:', [...new Set(pagos.map(p => p.aplicacion))]);
          }
        }
      } catch (error) {
        console.error('❌ ERROR GENERAL:', error);
      }
      
      console.log('=== FIN TEST ===');
    };
    
    test();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">🔧 Test Rápido Supabase</h1>
      <div className="bg-gray-800 p-4 rounded">
        <p className="mb-2">✅ Página cargada - Revisa la consola del navegador (F12)</p>
        <p className="text-sm text-gray-400">Los resultados del test aparecen en la consola</p>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">🔍 Pasos para resolver:</h3>
          <ol className="list-decimal pl-6 space-y-1 text-sm">
            <li>Abre las herramientas de desarrollador (F12)</li>
            <li>Ve a la pestaña "Console"</li>
            <li>Busca los logs que empiezan con "=== INICIO TEST SUPABASE ==="</li>
            <li>Si hay error de permisos, ejecuta el SQL en Supabase Dashboard</li>
          </ol>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded">
          <p className="text-yellow-200 font-semibold">⚠️ Si ves error de RLS/permisos:</p>
          <p className="text-sm mt-1">Ve a Supabase Dashboard → SQL Editor y ejecuta:</p>
          <code className="block mt-2 p-2 bg-black rounded text-xs">
            ALTER TABLE public.saldo DISABLE ROW LEVEL SECURITY;<br/>
            ALTER TABLE public.historial_pagos DISABLE ROW LEVEL SECURITY;<br/>
            ALTER TABLE public.pagos DISABLE ROW LEVEL SECURITY;
          </code>
        </div>
      </div>
    </div>
  );
}
