import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const envPath = path.join(ROOT, '.env.local')

const parseEnvFile = (filePath) => {
    if (!fs.existsSync(filePath)) return {}

    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = {}

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue

        const separatorIndex = line.indexOf('=')
        if (separatorIndex === -1) continue

        const key = line.slice(0, separatorIndex).trim()
        const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, '')
        parsed[key] = value
    }

    return parsed
}

const fromFile = parseEnvFile(envPath)
const supabaseUrl = process.env.VITE_SUPABASE_URL || fromFile.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || fromFile.VITE_SUPABASE_ANON_KEY || ''

const isPlaceholderValue = (value) => {
    if (!value) return true
    const normalized = value.trim().toLowerCase()
    return normalized.includes('your_') || normalized.includes('_here')
}

const hasValidUrl = (value) => {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
        return false
    }
}

const printHeader = () => {
    console.log('==================================================')
    console.log('Supabase setup and connectivity check')
    console.log('==================================================')
}

const printManualSetup = () => {
    console.log('\nManual setup steps:')
    console.log('1. Open Supabase Dashboard: https://app.supabase.com')
    console.log('2. Open your project SQL Editor and run DATABASE_SCHEMA.sql')
    console.log('3. Optionally run SAMPLE_DATA.sql for demo data')
    console.log('4. Keep .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

const main = async () => {
    printHeader()

    if (!fs.existsSync(envPath)) {
        console.error('Missing .env.local file in project root.')
        console.log('Create it from .env.example and add Supabase credentials.')
        process.exitCode = 1
        return
    }

    if (isPlaceholderValue(supabaseUrl) || isPlaceholderValue(supabaseAnonKey)) {
        console.error('Supabase credentials look like placeholders.')
        console.log('Update .env.local with real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values.')
        process.exitCode = 1
        return
    }

    if (!hasValidUrl(supabaseUrl)) {
        console.error('VITE_SUPABASE_URL is not a valid URL.')
        process.exitCode = 1
        return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('Supabase URL detected:', supabaseUrl)
    console.log('Testing auth endpoint...')

    const { error: authError } = await supabase.auth.getSession()
    if (authError) {
        console.error('Failed to reach Supabase auth endpoint:', authError.message)
        process.exitCode = 1
        return
    }

    console.log('Auth endpoint reachable.')
    console.log('Checking if table user_profiles exists...')

    const { error: tableError } = await supabase.from('user_profiles').select('id').limit(1)

    if (tableError) {
        console.warn('Table check returned:', tableError.message)
        if (tableError.message.toLowerCase().includes('infinite recursion')) {
            console.warn('RLS policy recursion detected. Update policies using the fixed DATABASE_SCHEMA.sql and re-run SQL.')
        } else {
            console.warn('Schema appears to be missing in this project.')
        }
        printManualSetup()
        process.exitCode = 1
        return
    }

    console.log('Supabase connection looks healthy and user_profiles is reachable.')
    console.log('Setup check complete.')
}

main().catch((error) => {
    console.error('Unexpected setup error:', error.message)
    process.exitCode = 1
})
