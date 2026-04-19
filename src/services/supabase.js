import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholderValue = (value) => {
	if (!value) return true
	const normalized = value.trim().toLowerCase()
	return normalized.includes('your_') || normalized.includes('_here')
}

const hasValidSupabaseUrl = (value) => {
	try {
		const parsed = new URL(value)
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
	} catch {
		return false
	}
}

export const isSupabaseConfigured =
	!isPlaceholderValue(supabaseUrl) &&
	!isPlaceholderValue(supabaseAnonKey) &&
	hasValidSupabaseUrl(supabaseUrl)

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey)
	: null

export const getSupabaseClient = () => {
	if (!isSupabaseConfigured || !supabase) {
		throw new Error(
			'Supabase is not configured. Set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values in .env.local.',
		)
	}

	return supabase
}
