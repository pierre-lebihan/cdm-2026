import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL ou Anon Key manquant. Vérifiez votre fichier .env (voir .env.example)',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
