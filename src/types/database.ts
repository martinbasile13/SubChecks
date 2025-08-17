// Tipos para la base de datos de SubChecks

export interface Usuario {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pago {
  id: number;
  aplicacion: string;
  monto: number;
  fecha: string;
  usuario_id: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
  usuario?: Usuario; // Para joins
}

export interface Saldo {
  id: number;
  usuario_id: string;
  monto: number;
  remitente: string;
  aplicacion: string; // Nueva columna para trackear saldo por aplicación
  created_at?: string;
  updated_at?: string;
  usuario?: Usuario; // Para joins
}

export interface HistorialPago {
  id: number;
  remitente_id: string;
  aplicacion: string;
  monto: number;
  fecha_creacion: string;
  pago_id: number;
  created_at?: string;
  remitente_nombre: string;
  remitente?: Usuario; // Para joins
}

// Tipos para formularios
export interface FormularioPago {
  aplicacion: string;
  monto: number;
  descripcion?: string;
}

export interface FormularioAuth {
  email: string;
  password: string;
  name?: string; // Solo para registro
}

// Tipos para estadísticas
export interface EstadisticasApp {
  aplicacion: string;
  total_pagos: number;
  monto_total: number;
  ultimo_pago: string;
}

export interface EstadisticasMes {
  total_pagos: number;
  monto_total: number;
  aplicacion_mas_usada: string;
  promedio_por_pago: number;
}

// Aplicaciones disponibles
export const APLICACIONES_DISPONIBLES = [
  { value: 'spotify', label: 'Spotify', color: '#1DB954' },
  { value: 'youtube_premium', label: 'YouTube Premium', color: '#FF0000' },
  { value: 'netflix', label: 'Netflix', color: '#E50914' },
  { value: 'crunchyroll', label: 'Crunchyroll', color: '#F47521' },
  { value: 'disney_plus', label: 'Disney+', color: '#113CCF' },
  { value: 'amazon_prime', label: 'Amazon Prime', color: '#00A8E1' },
  { value: 'hbo_max', label: 'HBO Max', color: '#6B46C1' },
  { value: 'apple_music', label: 'Apple Music', color: '#FA243C' },
  { value: 'twitch_turbo', label: 'Twitch Turbo', color: '#9146FF' },
  { value: 'canva_pro', label: 'Canva Pro', color: '#00C4CC' },
  { value: 'adobe_creative', label: 'Adobe Creative', color: '#FF0000' },
  { value: 'github_pro', label: 'GitHub Pro', color: '#24292E' },
  { value: 'figma_pro', label: 'Figma Pro', color: '#F24E1E' },
  { value: 'chatgpt_plus', label: 'ChatGPT Plus', color: '#10A37F' },
  { value: 'otros', label: 'Otros', color: '#6B7280' },
] as const;

export type AplicacionTipo = typeof APLICACIONES_DISPONIBLES[number]['value'];
