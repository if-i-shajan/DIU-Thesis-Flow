#!/usr/bin/env node

/**
 * Script to create a default admin user in Supabase
 * Usage: node create-admin.js <SERVICE_ROLE_KEY>
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://svrkqmhyggwggcfrlcoi.supabase.co'
const adminEmail = 'admin@gmail.com'
const adminPassword = 'admin890'
const adminFullName = 'System Admin'

async function createAdminUser(serviceRoleKey) {
    if (!serviceRoleKey) {
        console.error(
            '❌ Service Role Key is required!\n' +
            'Usage: node scripts/create-admin.js <SERVICE_ROLE_KEY>\n\n' +
            'To get the Service Role Key:\n' +
            '1. Go to https://app.supabase.com\n' +
            '2. Select your project\n' +
            '3. Settings → API → Copy "Service Role Secret"'
        )
        process.exit(1)
    }

    try {
        console.log('🔐 Creating Supabase admin client...')
        const supabase = createClient(supabaseUrl, serviceRoleKey)

        console.log(`👤 Creating admin user: ${adminEmail}`)

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true, // Confirm email automatically
            user_metadata: {
                full_name: adminFullName,
                role: 'admin',
            },
        })

        if (authError) {
            if (authError.message.includes('already exists')) {
                console.log('⚠️  Admin user already exists! Updating profile...')
            } else {
                throw authError
            }
        } else {
            console.log('✅ Auth user created:', authData.user.id)
        }

        // Get the user ID (either newly created or existing)
        const { data: existingUser } = await supabase.auth.admin.getUserById(
            authData?.user?.id || (await getExistingUserId(supabase, adminEmail))
        )

        const userId = existingUser?.id

        if (!userId) {
            throw new Error('Could not find or create admin user')
        }

        console.log(`📝 Creating admin profile...`)

        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert([
                {
                    id: userId,
                    email: adminEmail,
                    full_name: adminFullName,
                    role: 'admin',
                },
            ], { onConflict: 'id' })

        if (profileError) {
            if (!profileError.message.includes('duplicate')) {
                throw profileError
            }
        }

        console.log('\n✨ Admin user created successfully!\n')
        console.log('📧 Email: ' + adminEmail)
        console.log('🔑 Password: ' + adminPassword)
        console.log('\n🎉 You can now login with these credentials!\n')

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

async function getExistingUserId(supabase, email) {
    const { data } = await supabase.auth.admin.listUsers()
    const user = data.users.find(u => u.email === email)
    return user?.id
}

// Get service role key from command line argument
const serviceRoleKey = process.argv[2]

createAdminUser(serviceRoleKey)
