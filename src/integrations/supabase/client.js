import { createClient } from '@supabase/supabase-js';

// Use environment variables - matching project pattern (see firebaseConfig.js)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
	// Create a mock client to prevent errors during development
	supabase = {
		storage: {
			from: () => ({
				upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
				getPublicUrl: () => ({ data: { publicUrl: '' } })
			})
		},
		from: () => ({
			insert: async () => ({ error: { message: 'Supabase not configured' } })
		})
	};
} else {
	supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
