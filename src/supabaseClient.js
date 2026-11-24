import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uchzryqaimvnqempblyn.supabase.co'
const supabaseKey = 'sb_publishable_sVUDM4iXSlBHKAB5odJdig_yQMKJ-HB'

export const supabase = createClient(supabaseUrl, supabaseKey)