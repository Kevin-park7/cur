import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rrjedyjxcjvpzqhthujh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyamVkeWp4Y2p2cHpxaHRodWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MDk0OTcsImV4cCI6MjA2MTM4NTQ5N30.wTw1CKOvS1zuoDOBfKyYNigkeczZUfydQrQQpymCMCc';

export const supabase = createClient(supabaseUrl, supabaseKey); 