import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://celvpodqqxqjfucpputa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHZwb2RxcXhxamZ1Y3BwdXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTQxNzYsImV4cCI6MjA3OTgzMDE3Nn0.rLfw31rs3mOSyDN_qBXO5J5Tq8nSHmiBxJszUdRaeoI'

export const supabase = createClient(supabaseUrl, supabaseKey)
