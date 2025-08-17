import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Saldo, HistorialPago, Pago } from '@/types/database';

export function useGestionPagos(aplicacion: string) {
  const [saldos, setSaldos] = useState<Saldo[]>([]);
  const [historialPagos, setHistorialPagos] = useState<HistorialPago[]>([]);
  const [pagosWeb, setPagosWeb] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando datos para aplicación:', aplicacion);
      
      // Mapear nombres de aplicación para que coincidan con la base de datos
      const aplicacionDB = aplicacion === 'youtube' ? 'YouTube Premium' : 
                          aplicacion === 'crunchyroll' ? 'Crunchyroll' : aplicacion;
      
      console.log('� Consultando con aplicacionDB:', aplicacionDB);
      
      // Primero, obtener todos los datos para debug
      const { data: todosSaldos } = await supabase.from('saldo').select('*');
      const { data: todoHistorial } = await supabase.from('historial_pagos').select('*');
      const { data: todosPagos } = await supabase.from('pagos').select('*');
      
      console.log('🔍 TODOS los saldos en DB:', todosSaldos);
      console.log('� TODO el historial en DB:', todoHistorial);
      console.log('🔍 TODOS los pagos en DB:', todosPagos);
      
      // Ahora filtrar por aplicación exacta
      const saldosData = todosSaldos?.filter(s => 
        s.aplicacion === aplicacionDB) || [];
      const historialData = todoHistorial?.filter(h => 
        h.aplicacion === aplicacionDB) || [];
      const pagosData = todosPagos?.filter(p => 
        p.aplicacion === aplicacionDB) || [];

      console.log('✅ Datos filtrados:', {
        aplicacion: aplicacionDB,
        saldos: saldosData.length,
        historial: historialData.length,
        pagos: pagosData.length,
        saldosData,
        historialData,
        pagosData
      });

      setSaldos(saldosData);
      setHistorialPagos(historialData);
      setPagosWeb(pagosData);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('Error al cargar los datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarSaldo = async (id: number) => {
    const { error } = await supabase
      .from('saldo')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    await cargarDatos(); // Recargar datos
  };

  const eliminarHistorial = async (id: number) => {
    const { error } = await supabase
      .from('historial_pagos')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    await cargarDatos(); // Recargar datos
  };

  const eliminarPagoWeb = async (id: number) => {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    await cargarDatos(); // Recargar datos
  };

  useEffect(() => {
    if (aplicacion) {
      cargarDatos();
    }
  }, [aplicacion]);

  return {
    saldos,
    historialPagos,
    pagosWeb,
    loading,
    error,
    cargarDatos,
    eliminarSaldo,
    eliminarHistorial,
    eliminarPagoWeb
  };
}
