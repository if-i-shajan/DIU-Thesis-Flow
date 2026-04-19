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

const supervisors = [
    {
        email: 'supervisor@example.com',
        password: 'password123',
        firstName: 'Default',
        lastName: 'Supervisor',
        department: 'CS',
        designation: 'Assistant Professor',
        researchArea: 'AI and Machine Learning',
        yearsOfExperience: 5,
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

const patchFirestoreDoc = async (docPath, fields) => {
    const project = projectId()
    if (!project) throw new Error('Missing VITE_FIREBASE_PROJECT_ID in .env.local')

    const docUrl = new URL(
        `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${docPath}`,
    )

    Object.keys(fields).forEach((field) => {
        docUrl.searchParams.append('updateMask.fieldPaths', field)
    })

    const response = await fetch(docUrl.toString(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
    })

    const data = await response.json()
    if (!response.ok) {
        const message = data?.error?.message || 'Failed to patch Firestore document'
        throw new Error(message)
    }

    return data
}

const toStringField = (value) => ({ stringValue: String(value ?? '') })
const toIntField = (value) => ({ integerValue: String(value ?? 0) })

const upsertSupervisor = async (uid, profile) => {
    const nowIso = new Date().toISOString()
    const username = profile.email.split('@')[0].toLowerCase()

    const userProfileFields = {
        role: toStringField('supervisor'),
        email: toStringField(profile.email.toLowerCase()),
        username: toStringField(username),
        first_name: toStringField(profile.firstName),
        last_name: toStringField(profile.lastName),
        full_name: toStringField(`${profile.firstName} ${profile.lastName}`.trim()),
        phone: { nullValue: null },
        department: toStringField(profile.department),
        semester: { nullValue: null },
        student_id: { nullValue: null },
        created_at: { timestampValue: nowIso },
        updated_at: { timestampValue: nowIso },
    }

    const supervisorFields = {
        user_id: toStringField(uid),
        department: toStringField(profile.department),
        designation: toStringField(profile.designation),
        research_area: toStringField(profile.researchArea),
        years_of_experience: toIntField(profile.yearsOfExperience),
        max_capacity: toIntField(5),
        assigned_count: toIntField(0),
        created_at: { timestampValue: nowIso },
        updated_at: { timestampValue: nowIso },
    }

    await patchFirestoreDoc(`user_profiles/${uid}`, userProfileFields)
    await patchFirestoreDoc(`supervisors/${uid}`, supervisorFields)
}

const run = async () => {
    loadEnvFile()
    console.log('Seeding supervisor profiles...')

    for (const supervisor of supervisors) {
        try {
            const uid = await signUpOrSignIn(supervisor.email, supervisor.password)
            await upsertSupervisor(uid, supervisor)
            console.log(`Supervisor ready: ${supervisor.email} (${uid})`) 
        } catch (error) {
            console.error(`Failed to seed ${supervisor.email}: ${error.message}`)
        }
    }
}

run().catch((error) => {
    console.error(error)
    process.exit(1)
})
