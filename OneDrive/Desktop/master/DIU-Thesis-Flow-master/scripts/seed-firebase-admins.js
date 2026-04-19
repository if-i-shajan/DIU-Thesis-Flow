import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const ENV_PATH = path.join(ROOT, '.env.local')

const loadEnvFile = () => {
    if (!fs.existsSync(ENV_PATH)) {
        throw new Error('Missing .env.local. Please create it with Firebase config.')
    }

    const raw = fs.readFileSync(ENV_PATH, 'utf8')
    raw.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const [key, ...rest] = trimmed.split('=')
        const value = rest.join('=').trim()
        if (key) process.env[key] = value
    })
}

const apiKey = () => process.env.VITE_FIREBASE_API_KEY
const projectId = () => process.env.VITE_FIREBASE_PROJECT_ID

const admins = [
    {
        email: 'jmiishajan2020@gmail.com',
        password: 'adminshajan',
        firstName: 'Shajan',
        lastName: 'Admin',
    },
    {
        email: 'hshasan2004@gmail.com',
        password: 'adminhasan',
        firstName: 'Hasan',
        lastName: 'Admin',
    },
]

const requestJson = async (url, payload) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
        const message = data?.error?.message || 'Request failed'
        const err = new Error(message)
        err.code = data?.error?.message
        throw err
    }

    return data
}

const signUpOrSignIn = async (email, password) => {
    const key = apiKey()
    if (!key) throw new Error('Missing VITE_FIREBASE_API_KEY in .env.local')

    try {
        const data = await requestJson(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`,
            { email, password, returnSecureToken: true },
        )
        return data.localId
    } catch (error) {
        if (error.code !== 'EMAIL_EXISTS') throw error

        const login = await requestJson(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
            { email, password, returnSecureToken: true },
        )
        return login.localId
    }
}

const upsertProfile = async (uid, admin) => {
    const project = projectId()
    if (!project) throw new Error('Missing VITE_FIREBASE_PROJECT_ID in .env.local')

    const nowIso = new Date().toISOString()
    const username = admin.email.split('@')[0].toLowerCase()
    const docUrl = new URL(
        `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/user_profiles/${uid}`,
    )

    const fields = {
        role: { stringValue: 'admin' },
        email: { stringValue: admin.email.toLowerCase() },
        username: { stringValue: username },
        first_name: { stringValue: admin.firstName || '' },
        last_name: { stringValue: admin.lastName || '' },
        department: { nullValue: null },
        semester: { nullValue: null },
        student_id: { nullValue: null },
        phone: { nullValue: null },
        created_at: { timestampValue: nowIso },
        updated_at: { timestampValue: nowIso },
    }

    const fieldPaths = Object.keys(fields)
    fieldPaths.forEach((field) => docUrl.searchParams.append('updateMask.fieldPaths', field))

    const response = await fetch(docUrl.toString(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
    })

    const data = await response.json()
    if (!response.ok) {
        const message = data?.error?.message || 'Failed to update Firestore profile'
        throw new Error(message)
    }

    return data
}

const run = async () => {
    loadEnvFile()
    console.log('Seeding admin accounts...')

    for (const admin of admins) {
        try {
            const uid = await signUpOrSignIn(admin.email, admin.password)
            await upsertProfile(uid, admin)
            console.log(`Admin ready: ${admin.email} (${uid})`)
        } catch (error) {
            console.error(`Failed to seed ${admin.email}: ${error.message}`)
        }
    }
}

run().catch((error) => {
    console.error(error)
    process.exit(1)
})
