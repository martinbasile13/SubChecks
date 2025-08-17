'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function GestionDebug() {
  const params = useParams();
  const router = useRouter();
  const aplicacion = params.aplicacion as string;
  
  const [todosDatos, setTodosDatos] = useState<any>({
    saldos: [],
    historial: [],
    pagos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Configuración según la aplicación
  const config = {
    youtube: {
      nombre: 'YouTube Premium',
      shadowColor: 'shadow-red-500'
    },
    crunchyroll: {
      nombre: 'Crunchyroll',
      shadowColor: 'shadow-orange-500'
    }
  };
  
  const appConfig = config[aplicacion as keyof typeof config];
  
  useEffect(() => {
    const cargarTodos = async () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando TODOS los datos para debug...');
        
        const [saldos, historial, pagos] = await Promise.all([
          supabase.from('saldo').select('*'),
          supabase.from('historial_pagos').select('*'),
          supabase.from('pagos').select('*')
        ]);
        
        console.log('Respuestas completas:', { saldos, historial, pagos });
        
        if (saldos.error) throw saldos.error;
        if (historial.error) throw historial.error;
        if (pagos.error) throw pagos.error;
        
        const datos = {
          saldos: saldos.data || [],
          historial: historial.data || [],
          pagos: pagos.data || []
        };
        
        console.log('Datos procesados:', datos);
        console.log('Aplicaciones encontradas:');
        console.log('- Saldos:', [...new Set(datos.saldos.map(s => s.aplicacion))]);
        console.log('- Historial:', [...new Set(datos.historial.map(h => h.aplicacion))]);
        console.log('- Pagos:', [...new Set(datos.pagos.map(p => p.aplicacion))]);
        
        setTodosDatos(datos);
        
      } catch (err: any) {
        console.error('❌ Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    cargarTodos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">🔄 Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalRegistros = todosDatos.saldos.length + todosDatos.historial.length + todosDatos.pagos.length;

  return (
    <div className="min-h-screen bg-black" data-theme="dark">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            🧪 Debug - {appConfig?.nombre || aplicacion}
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="mb-6 text-center">
          <div className="text-xl text-white">
            📊 Total de registros en DB: <span className="text-green-400 font-bold">{totalRegistros}</span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Saldos: {todosDatos.saldos.length} | Historial: {todosDatos.historial.length} | Pagos: {todosDatos.pagos.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Todos los Saldos */}
          <div className={`bg-black border border-gray-800 rounded-lg p-6 shadow-2xl ${appConfig?.shadowColor || 'shadow-gray-500'}`}>
            <h2 className="text-2xl font-bold text-white mb-4">💰 Todos los Saldos ({todosDatos.saldos.length})</h2>
            <div className="max-h-60 overflow-auto">
              {todosDatos.saldos.length > 0 ? (
                todosDatos.saldos.map((saldo: any, i: number) => (
                  <div key={i} className="mb-3 p-2 bg-gray-800 rounded text-sm">
                    <div><strong>App:</strong> {saldo.aplicacion || 'N/A'}</div>
                    <div><strong>Monto:</strong> ${saldo.monto}</div>
                    <div><strong>Remitente:</strong> {saldo.remitente}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No hay saldos</p>
              )}
            </div>
          </div>

          {/* Todo el Historial */}
          <div className={`bg-black border border-gray-800 rounded-lg p-6 shadow-2xl ${appConfig?.shadowColor || 'shadow-gray-500'}`}>
            <h2 className="text-2xl font-bold text-white mb-4">📋 Todo el Historial ({todosDatos.historial.length})</h2>
            <div className="max-h-60 overflow-auto">
              {todosDatos.historial.length > 0 ? (
                todosDatos.historial.map((hist: any, i: number) => (
                  <div key={i} className="mb-3 p-2 bg-gray-800 rounded text-sm">
                    <div><strong>App:</strong> {hist.aplicacion || 'N/A'}</div>
                    <div><strong>Monto:</strong> ${hist.monto}</div>
                    <div><strong>Remitente:</strong> {hist.remitente_nombre || hist.remitente_id}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No hay historial</p>
              )}
            </div>
          </div>

          {/* Todos los Pagos */}
          <div className={`bg-black border border-gray-800 rounded-lg p-6 shadow-2xl ${appConfig?.shadowColor || 'shadow-gray-500'}`}>
            <h2 className="text-2xl font-bold text-white mb-4">💳 Todos los Pagos ({todosDatos.pagos.length})</h2>
            <div className="max-h-60 overflow-auto">
              {todosDatos.pagos.length > 0 ? (
                todosDatos.pagos.map((pago: any, i: number) => (
                  <div key={i} className="mb-3 p-2 bg-gray-800 rounded text-sm">
                    <div><strong>App:</strong> {pago.aplicacion || 'N/A'}</div>
                    <div><strong>Monto:</strong> ${pago.monto}</div>
                    <div><strong>Desc:</strong> {pago.descripcion || 'N/A'}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No hay pagos</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          💡 Revisa la consola del navegador (F12) para logs detallados
        </div>
      </div>
    </div>
  );
}
