import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pdadbhwdatqtypckyudy.supabase.co"; // Replace with your URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkYWRiaHdkYXRxdHlwY2t5dWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjE5ODMsImV4cCI6MjA3ODkzNzk4M30.NqLOwKWv2rEpg3K0PRh33V1k0SJQJfV0UTXG0rLgpy8"; // Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
