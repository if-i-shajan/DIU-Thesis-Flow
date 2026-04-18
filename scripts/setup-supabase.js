import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Read environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://svrkqmhyggwggcfrlcoi.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY // For admin operations

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Missing Supabase credentials in .env.local')
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    process.exit(1)
}

console.log('🚀 Thesis Management System - Supabase Setup')
console.log('='.repeat(50))
console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
console.log('='.repeat(50))

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function setupDatabase() {
    try {
        console.log('\n📋 Setting up database schema...')

        // Read the database schema SQL file
        const schemaPath = path.join(process.cwd(), 'DATABASE_SCHEMA.sql')
        if (!fs.existsSync(schemaPath)) {
            console.error('❌ DATABASE_SCHEMA.sql not found!')
            process.exit(1)
        }

        const schema = fs.readFileSync(schemaPath, 'utf-8')

        // Note: The Supabase JavaScript client doesn't support raw SQL execution
        // This script provides the setup instructions instead
        console.log('\n⚠️  MANUAL SETUP REQUIRED')
        console.log('='.repeat(50))
        console.log('\nTo complete Supabase setup:')
        console.log('\n1. Open Supabase Dashboard: https://app.supabase.com')
        console.log('2. Select your project')
        console.log('3. Go to SQL Editor → New Query')
        console.log('4. Copy contents of DATABASE_SCHEMA.sql')
        console.log('5. Paste into SQL Editor and click Run')
        console.log('\nOR use this command to load the schema:')
        console.log('   supabase db push')
        console.log('='.repeat(50))

        // Test connection
        console.log('\n🧪 Testing Supabase connection...')
        const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true })

        if (error) {
            console.log('⚠️  Tables not yet created (this is normal before schema setup)')
            console.log(`   Error: ${error.message}`)
        } else {
            console.log('✅ Supabase connection successful!')
            console.log('✅ Database tables exist!')
        }

        // Load sample data
        console.log('\n📝 To load sample data:')
        console.log('1. Go to Supabase SQL Editor → New Query')
        console.log('2. Copy contents of SAMPLE_DATA.sql')
        console.log('3. Paste into SQL Editor and click Run')
        console.log('4. Test with demo credentials:')
        console.log('   - Email: student@test.com')
        console.log('   - Password: password123')

        console.log('\n' + '='.repeat(50))
        console.log('✅ Setup Instructions Complete!')
        console.log('='.repeat(50))
        console.log('\n📖 For detailed instructions, see: SUPABASE_SETUP.md')

    } catch (error) {
        console.error('❌ Setup error:', error.message)
        process.exit(1)
    }
}

// Run setup
setupDatabase()
