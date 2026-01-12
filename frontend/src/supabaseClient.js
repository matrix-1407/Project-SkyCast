/**
 * Supabase Client Configuration
 * 
 * This file initializes and exports the Supabase client for authentication
 * and database operations.
 * 
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * These are loaded from .env file in the frontend directory.
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
// Vite uses VITE_ prefix for environment variables exposed to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Create and export the Supabase client
// This client will be used throughout the app for authentication and database operations
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
