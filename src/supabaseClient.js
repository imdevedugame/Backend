import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;  // JWT Secret untuk verifikasi

if (!supabaseUrl || !supabaseKey || !supabaseJwtSecret) {
    throw new Error('SUPABASE_URL, SUPABASE_KEY, dan SUPABASE_JWT_SECRET harus diset di file .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase, supabaseJwtSecret };  // Ekspor supabase dan JWT Secret
