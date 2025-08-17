import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función helper para obtener el cliente de Supabase en componentes del servidor
export function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
