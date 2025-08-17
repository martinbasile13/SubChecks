import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useGestionPagosSimple(aplicacion: string) {
  const [datos, setDatos] = useState<any>({ saldos: [], historial: [], pagos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        console.log('Cargando datos para:', aplicacion);
        
        // Obtener todos los datos
        const [saldos, historial, pagos] = await Promise.all([
          supabase.from('saldo').select('*'),
          supabase.from('historial_pagos').select('*'),
          supabase.from('pagos').select('*')
        ]);
        
        console.log('Respuestas:', { saldos, historial, pagos });
        
        if (saldos.error) throw saldos.error;
        if (historial.error) throw historial.error;
        if (pagos.error) throw pagos.error;
        
        // Mapear aplicación a los valores reales en la base de datos
        let valorBusqueda = aplicacion;
        if (aplicacion === 'youtube') {
          valorBusqueda = 'YouTube Premium'; // Valor real en tu DB
        } else if (aplicacion === 'crunchyroll') {
          valorBusqueda = 'Crunchyroll'; // Verificar si es exacto en tu DB
        }
        
        console.log(`Buscando aplicación: "${valorBusqueda}" (ruta: ${aplicacion})`);
        
        // Filtrar por aplicación exacta
        const saldosFiltrados = (saldos.data || []).filter((s: any) => 
          s.aplicacion === valorBusqueda
        );
        const historialFiltrado = (historial.data || []).filter((h: any) => 
          h.aplicacion === valorBusqueda
        );
        const pagosFiltrados = (pagos.data || []).filter((p: any) => 
          p.aplicacion === valorBusqueda
        );
        
        console.log('Datos filtrados:', {
          saldos: saldosFiltrados.length,
          historial: historialFiltrado.length,
          pagos: pagosFiltrados.length
        });
        
        setDatos({
          saldos: saldosFiltrados,
          historial: historialFiltrado,
          pagos: pagosFiltrados
        });
        
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (aplicacion) {
      cargar();
    }
  }, [aplicacion]);

  return { datos, loading, error };
}
