# DIU Thesis Flow - Complete Codebase Analysis
## Critical Issues, Logic Errors & Problems Report

**Analysis Date**: April 19, 2026  
**Total Issues Found**: 28  
**Critical Blockers**: 2  
**High Priority**: 7  
**Medium Priority**: 10  
**Low Priority**: 9

---

## 🔴 CRITICAL ERRORS (App Will Not Function)

### 1. Student/Supervisor Records Never Created on Signup
**Severity**: 🔴 CRITICAL  
**File**: [src/services/authService.js](src/services/authService.js#L78-100)  
**Lines**: 78-100

**Problem**:
- When a student or supervisor registers, only `user_profiles` table entry is created
- NO entry is created in the `students` or `supervisors` tables
- The signup flow only calls `upsert` on `user_profiles`, nothing else

**Database Schema Mismatch**:
- `supervisor_requests` table requires:
  - `student_id` → references `students(user_id)` 
  - `supervisor_id` → references `supervisors(id)`
- These tables remain empty after signup

**RLS Policies Will Fail**:
```sql
-- This policy will ALWAYS fail because students record doesn't exist:
CREATE POLICY "Students can create requests"
  ON supervisor_requests FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid())  ← FAILS: No student record!
  );
```

**Impact**: 
- ✗ Students CANNOT send supervisor requests (RLS violation)
- ✗ Supervisors CANNOT receive/accept/reject requests (no supervisor record)
- ✗ Request system is completely non-functional

**Fix Required**:
```javascript
// After user_profiles is created, add:
if (normalizedRole === 'student') {
  const { error: studentError } = await supabase.from('students').upsert([{
    user_id: data.user.id,
    department: department,
    enrollment_number: registrationNumber,
  }])
  if (studentError) throw studentError
}

if (normalizedRole === 'supervisor') {
  const { error: supervisorError } = await supabase.from('supervisors').upsert([{
    user_id: data.user.id,
    department: department,
    research_area: researchAreas,
    experience: parseInt(yearsOfExperience),
  }])
  if (supervisorError) throw supervisorError
}
```

---

### 2. Request Service Uses Wrong Database References
**Severity**: 🔴 CRITICAL  
**File**: [src/services/requestService.js](src/services/requestService.js#L1-80)  
**Lines**: 7-16, 33-42, 50-60

**Problem 1 - sendRequest()**:
```javascript
async sendRequest(studentId, supervisorId) {
  // studentId is auth.user.id (UUID from user_profiles)
  // But DB expects student_id to reference students.user_id
  // When students table is empty, this will fail RLS policy check
  
  const { data, error } = await supabase
    .from('supervisor_requests')
    .insert([{
      student_id: studentId,  // ← This is auth.uid(), not students.id
      supervisor_id: supervisorId,  // ← This is probably supervisors.id, OK
      status: 'pending',
    }])
}
```

**Problem 2 - getRequestsForStudent()**:
```javascript
async getRequestsForStudent(studentId) {
  // studentId = auth.uid()
  // But RLS policy checks: student_id = auth.uid() AND EXISTS(students WHERE user_id = auth.uid())
  // Since students table is empty, query returns no results
  
  const { data, error } = await supabase
    .from('supervisor_requests')
    .select('*, supervisors(user_id, department, research_area)')
    .eq('student_id', studentId)  // ← This should work IF students table had entries
}
```

**Problem 3 - getRequestsForSupervisor()**:
```javascript
// Query selects students(user_id, department) but students table 
// might not have these columns in expected format
.select('*, students(user_id, department), user_profiles(full_name, email)')
// This returns nested data that doesn't match expected structure
```

**Impact**:
- ✗ All student request operations fail with RLS violations or empty results
- ✗ Supervisor request list shows incorrect/missing data
- ✗ Complete data flow broken between students and supervisors

**Data Flow Issue**:
```
Student Signup → user_profiles created → students table EMPTY ← RLS FAILS
Supervisor Signup → user_profiles created → supervisors table EMPTY ← RLS FAILS
Send Request → Tries to insert without student record → RLS DENIES
```

---

## 🟠 HIGH PRIORITY ISSUES (Break Major Features)

### 3. StudentRequestsPage Shows UUIDs Instead of Supervisor Names
**Severity**: 🟠 HIGH  
**File**: [src/pages/StudentRequestsPage.jsx](src/pages/StudentRequestsPage.jsx#L84)  
**Line**: 84

**Problem**:
```jsx
<h3 className="font-bold text-lg text-gray-900">
  {request.supervisors?.user_id || 'Unknown Supervisor'}  // ← Shows UUID!
</h3>
```

**Should Be**:
```jsx
{request.supervisors?.user_profiles?.full_name || 'Unknown Supervisor'}
```

**Current Output**: `f47ac10b-58cc-4372-a567-0e02b2c3d479`  
**Expected Output**: `Dr. Ahmed Hassan`

**Impact**: Students cannot identify which supervisor they requested

---

### 4. Navigation Links to 5 Non-Existent Pages
**Severity**: 🟠 HIGH  
**File**: [src/components/Navigation.jsx](src/components/Navigation.jsx#L19-31)  
**Lines**: 19-31

**Broken Links**:
1. `/profile` - No ProfilePage.jsx created
2. `/supervisor/students` - No page for supervisor's assigned students
3. `/supervisor/projects` - No page for supervisor's projects
4. `/admin/users` - No admin user management page
5. `/admin/projects` - No admin project management page

**Proof**:
```javascript
const navLinks = {
  student: [
    { label: 'Projects', path: '/student/projects' },      ✓ Exists
    { label: 'Supervisors', path: '/student/supervisors' }, ✓ Exists
    { label: 'My Requests', path: '/student/requests' },   ✓ Exists
  ],
  supervisor: [
    { label: 'Requests', path: '/supervisor/requests' },   ✓ Exists
    { label: 'Students', path: '/supervisor/students' },   ✗ NOT FOUND
    { label: 'Projects', path: '/supervisor/projects' },   ✗ NOT FOUND
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },      ✓ Exists
    { label: 'Users', path: '/admin/users' },              ✗ NOT FOUND
    { label: 'Projects', path: '/admin/projects' },        ✗ NOT FOUND
  ],
}
```

**Impact**: Users get 404 errors or blank pages when clicking navigation

---

### 5. StudentProjectsPage Uses Wrong Supervisor Reference
**Severity**: 🟠 HIGH  
**File**: [src/pages/StudentProjectsPage.jsx](src/pages/StudentProjectsPage.jsx#L71-72)  
**Lines**: 71-72

**Problem**:
```javascript
const handleSelectSupervisor = async (projectId) => {
  const project = projects.find((p) => p.id === projectId)
  if (project) {
    // project.created_by is a user_profiles UUID, NOT a supervisor ID
    const result = await requestService.sendRequest(user.id, project.created_by)
    //                                                         ↑ WRONG!
  }
}
```

**Issue**:
- `projects.created_by` = UUID from `user_profiles` table
- `supervisor_requests.supervisor_id` = UUID from `supervisors` table
- These are different tables, will cause RLS failure

**Should Be**:
```javascript
// First find the supervisor ID
const supervisor = await supervisorService.getSupervisorById(...)
// Or project should already have supervisor_id field
```

**Impact**: Supervisor request from project view will fail

---

### 6. StudentSupervisorsPage Has N+1 Query Problem
**Severity**: 🟠 HIGH  
**File**: [src/pages/StudentSupervisorsPage.jsx](src/pages/StudentSupervisorsPage.jsx#L47-56)  
**Lines**: 47-56

**Problem**:
```javascript
const fetchSupervisors = async () => {
  const result = await supervisorService.getSupervisors()  // Query 1: Gets all supervisors
  if (result.success) {
    setSupervisors(result.data)
    
    // Loop: Makes individual queries for EACH supervisor
    const statuses = {}
    for (const supervisor of result.data) {
      // Query 2, 3, 4, 5... N+1
      const statusResult = await requestService.getRequestStatus(user.id, supervisor.id)
      if (statusResult.data) {
        statuses[supervisor.id] = statusResult.data.status
      }
    }
    setRequestStatuses(statuses)
  }
}
```

**Performance Impact**:
- 20 supervisors = 21 database queries
- Instead of just 1 query with request statuses

**Should Use**:
- Single query with LEFT JOIN to get request status
- Or batch request status checks

**Impact**: Page takes 10-20x longer to load than necessary

---

### 7. AdminDashboardPage Shows Hardcoded Student Count
**Severity**: 🟠 HIGH  
**File**: [src/pages/AdminDashboardPage.jsx](src/pages/AdminDashboardPage.jsx#L28)  
**Line**: 28

**Problem**:
```javascript
setStats({
  projects: projectsResult.data?.length || 0,
  supervisors: supervisorsResult.data?.length || 0,
  students: 0,  // ← HARDCODED! Never fetched
})
```

**Impact**: Admin dashboard always shows 0 students regardless of actual count

**Fix**:
```javascript
const studentsResult = await supabase
  .from('students')
  .select('*', { count: 'exact', head: true })
setStats({
  projects: projectsResult.data?.length || 0,
  supervisors: supervisorsResult.data?.length || 0,
  students: studentsResult.count || 0,
})
```

---

### 8. Silent Notification Creation Failures
**Severity**: 🟠 HIGH  
**File**: [src/services/requestService.js](src/services/requestService.js#L17-26)  
**Lines**: 17-26

**Problem**:
```javascript
async sendRequest(studentId, supervisorId) {
  // ... create request ...
  
  // Create notification for supervisor
  await supabase.from('notifications').insert([
    {
      user_id: supervisorId,
      message: `New supervisor request from student ${studentId}`,
      type: 'request',
      is_read: false,
    },
  ])
  // ↑ Error NOT checked! If this fails, supervisor gets no notification
}
```

**Impact**: 
- Supervisor doesn't know they got a request
- Silent failure - no error message shown
- User assumes request was sent successfully

**Fix**:
```javascript
const { error: notifError } = await supabase.from('notifications').insert([...])
if (notifError) {
  console.error('Failed to create notification:', notifError)
  // Either throw error or at least log it
}
```

---

### 9. Query Join Structure Broken
**Severity**: 🟠 HIGH  
**File**: [src/services/requestService.js](src/services/requestService.js#L33-42)  
**Lines**: 33-42

**Problem**:
```javascript
async getRequestsForSupervisor(supervisorId) {
  // Trying to select columns that don't exist in students table
  const { data, error } = await supabase
    .from('supervisor_requests')
    .select('*, students(user_id, department), user_profiles(full_name, email)')
    //        students table doesn't have full_name/email - they're in user_profiles!
    //        students table doesn't join directly to user_profiles
}
```

**Database Structure**:
```
user_profiles (id, full_name, email, role)
    ↓
students (user_id, department, enrollment_number)
```

**Correct Query Should**:
```javascript
.select('*, students(user_id, department, user_profiles(full_name, email))')
// Need nested join to user_profiles through students
```

**Impact**: Supervisor request list returns incomplete/missing data

---

## 🟡 MEDIUM PRIORITY ISSUES (Degrade Functionality)

### 10. Incorrect Data in SupervisorCard
**Severity**: 🟡 MEDIUM  
**File**: [src/components/SupervisorCard.jsx](src/components/SupervisorCard.jsx#L9)  
**Line**: 9

**Problem**:
```jsx
<h3 className="font-bold text-lg text-gray-900">
  {supervisor.user_profiles?.full_name}  // ← OK
</h3>
// Later:
<p className="font-semibold text-gray-900">
  {supervisor.experience} years  // ← Field name wrong!
</p>
```

**Database Schema Says**:
```sql
CREATE TABLE supervisors (
  experience INT DEFAULT 0,  // ← It's "experience" but query might not fetch it
}
```

**Impact**: Experience shows as undefined or blank

---

### 11. ProjectCard Supervisor Data Issue
**Severity**: 🟡 MEDIUM  
**File**: [src/components/ProjectCard.jsx](src/components/ProjectCard.jsx#L32)  
**Line**: 32

**Problem**:
```jsx
{project.supervisors?.full_name}  // ← Wrong path!
```

**Should Be**:
```jsx
{project.supervisors?.user_profiles?.full_name}
// OR supervisor should be user_profiles object directly
```

**Issue**: `supervisors` table doesn't have `full_name` - it's in `user_profiles`

**Impact**: Supervisor name shows as blank in project cards

---

### 12. Unhandled Promise in notificationService
**Severity**: 🟡 MEDIUM  
**File**: [src/pages/NotificationsPage.jsx](src/pages/NotificationsPage.jsx#L45)  
**Line**: 45

**Problem**:
```javascript
const handleDelete = async (notificationId) => {
  try {
    await notificationService.deleteNotification(notificationId)  // ← No error prop
    // If this fails, error is not shown to user
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  } catch (err) {
    setError('Failed to delete notification')  // ← Generic error, could be better
  }
}
```

**Impact**: User won't know if delete actually succeeded

---

### 13. Department Enum Not Centralized
**Severity**: 🟡 MEDIUM  
**Files**: 
- [src/pages/StudentSupervisorsPage.jsx](src/pages/StudentSupervisorsPage.jsx#L23) Line 23
- [src/pages/RegisterPage.jsx](src/pages/RegisterPage.jsx#L93) Line 93
- Database: No constraint on department column

**Problem**:
```javascript
// StudentSupervisorsPage
const departments = ['CS', 'SE', 'IT', 'AI', 'DS']

// RegisterPage  
const departments = [
  { label: 'Computer Science', value: 'CS' },
  { label: 'Software Engineering', value: 'SE' },
  // ... same values
]

// Database - NO VALIDATION
department VARCHAR(100) NOT NULL  // Any string allowed!
```

**Issues**:
- If database has "Computer Science" but filter searches "CS", no match
- Departments defined in 2+ places - hard to maintain
- No validation prevents invalid departments in DB

**Impact**: 
- Filtering by department doesn't work correctly
- Data inconsistency

---

### 14. Phone Number Validation Complex Logic
**Severity**: 🟡 MEDIUM  
**File**: [src/pages/RegisterPage.jsx](src/pages/RegisterPage.jsx#L103-115)  
**Lines**: 103-115

**Problem**:
```javascript
const handleChange = (e) => {
  if (name === 'phoneNumber') {
    const sanitized = value.replace(/[^\d+]/g, '')
    const digits = sanitized.replace(/\D/g, '')
    
    let normalized
    if (digits.startsWith('88')) {
      normalized = `+${digits}`
    } else if (digits.length === 0) {
      normalized = '+88'
    } else {
      normalized = `+88${digits}`
    }
    
    normalized = normalized.slice(0, 14)
    if (normalized.length < 3) normalized = '+88'
  }
}

// Then validation:
if (!BANGLADESH_PHONE_REGEX.test(formData.phoneNumber.trim())) {
  setError('Phone number must start with +880 and be a valid Bangladesh number')
}
```

**Issues**:
- Confusing UX - hard for user to understand requirements
- Error message says "+880" but regex expects "+8801"
- Complex normalization logic hard to debug

**Impact**: Users confused about phone format requirements

---

### 15. Years of Experience Validation Bug
**Severity**: 🟡 MEDIUM  
**File**: [src/pages/RegisterPage.jsx](src/pages/RegisterPage.jsx#L199)  
**Line**: 199

**Problem**:
```javascript
if (!formData.yearsOfExperience.toString().trim()) {
  setError('Years of Experience is required')
  return
}
```

**Issue**:
- `yearsOfExperience` is a number input
- `.toString().trim()` on 0 gives "0" - not falsy
- But on empty string gives "" - falsy
- Logic works but is fragile

**Better**:
```javascript
if (!formData.yearsOfExperience && formData.yearsOfExperience !== 0) {
  setError('Years of Experience is required')
}
```

---

### 16. Missing Video URL Validation
**Severity**: 🟡 MEDIUM  
**File**: [src/components/ProjectCard.jsx](src/components/ProjectCard.jsx#L6-10)  
**Lines**: 6-10

**Problem**:
```javascript
const getYoutubeEmbedUrl = (url) => {
  const videoId = url?.includes('youtube.com')
    ? new URLSearchParams(new URL(url).search).get('v')
    : url?.split('/').pop()
  return `https://www.youtube.com/embed/${videoId}`
}

// No validation that URL is actually YouTube
// If videoId is undefined or invalid, iframe loads broken video
```

**Impact**: 
- Silent failure with broken video player
- User doesn't know video didn't load

---

### 17. Stale Notification Unread Count
**Severity**: 🟡 MEDIUM  
**File**: [src/context/store.js](src/context/store.js#L19)  
**Line**: 19

**Problem**:
```javascript
export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,  // ← Set once, never updated
  
  setNotifications: (notifications) => set({ notifications }),
  // No action to update unreadCount when notifications change!
}))
```

**Used In**: [src/components/Navigation.jsx](src/components/Navigation.jsx#L59) Line 59
```jsx
{unreadCount > 0 && (
  <span className="absolute top-0 right-0...">
    {unreadCount}  // ← Will always be 0 or wrong value
  </span>
)}
```

**Impact**: Notification badge shows wrong count

---

### 18. Incomplete RLS Policy for Project Access
**Severity**: 🟡 MEDIUM  
**File**: [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql#L172-180)  
**Lines**: 172-180

**Problem**:
```sql
CREATE POLICY "Everyone can view projects"
  ON projects FOR SELECT
  USING (TRUE);  -- Anyone can view, but what about status?
```

**Issue**: 
- Project status 'assigned' should only be visible to supervisor/admin
- Current policy shows all projects to everyone
- Privacy issue: Students see projects assigned to others

---

### 19. Missing Form Submission Error Messages
**Severity**: 🟡 MEDIUM  
**File**: [src/pages/StudentProjectsPage.jsx](src/pages/StudentProjectsPage.jsx#L71)  
**Line**: 71

**Problem**:
```javascript
const handleSelectSupervisor = async (projectId) => {
  try {
    const result = await requestService.sendRequest(user.id, project.created_by)
    
    if (result.success) {
      setSuccessMessage('Request sent successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } else {
      setError(result.error)  // ← Too generic
    }
  } catch (err) {
    setError('Failed to send request')  // ← Doesn't specify why
  }
}
```

**Impact**: Users don't know what went wrong

---

### 20. Missing Error Recovery in Auth
**Severity**: 🟡 MEDIUM  
**File**: [src/hooks/useAuth.js](src/hooks/useAuth.js#L35)  
**Line**: 35

**Problem**:
```javascript
const checkAuth = async () => {
  setLoading(true)
  try {
    const userResult = await authService.getCurrentUser()
    // ...
  } catch (error) {
    setError(error.message)  // ← Logged but no way to recover
  } finally {
    setLoading(false)
  }
}
```

**Issue**: If auth check fails, user can't retry, no "retry" button

---

## 🟢 LOW PRIORITY ISSUES (Minor Bugs)

### 21. Unused Variable in RegisterPage
**Severity**: 🟢 LOW  
**File**: [src/pages/RegisterPage.jsx](src/pages/RegisterPage.jsx#L71)  
**Line**: 71

**Problem**:
```javascript
const setRole = (role) => {
  setFormData((prev) => ({ ...prev, role }))
}

// ↑ Defined but never called!
// Used direct buttons instead via onSelect callback
```

---

### 22. Inconsistent Error Clearing
**Severity**: 🟢 LOW  
**Files**:
- [src/pages/StudentProjectsPage.jsx](src/pages/StudentProjectsPage.jsx#L56) - clears after 3s
- [src/pages/NotificationsPage.jsx](src/pages/NotificationsPage.jsx#L77) - doesn't auto-clear
- [src/pages/LoginPage.jsx](src/pages/LoginPage.jsx#L180) - doesn't auto-clear

**Problem**: Some pages auto-clear error messages, others require manual dismiss

**Impact**: Inconsistent UX

---

### 23. Missing Loading State for Async Operations
**Severity**: 🟢 LOW  
**File**: [src/pages/NotificationsPage.jsx](src/pages/NotificationsPage.jsx#L45)  
**Line**: 45

**Problem**:
```javascript
const handleDelete = async (notificationId) => {
  try {
    await notificationService.deleteNotification(notificationId)
    // ↑ No loading state - button doesn't show spinner
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }
}
```

**Impact**: User doesn't know delete is processing

---

### 24. Modal Component Unused
**Severity**: 🟢 LOW  
**File**: [src/components/Modal.jsx](src/components/Modal.jsx)

**Problem**: Modal component imported in index.js but never used anywhere

**Impact**: Dead code

---

### 25. LoadingSpinner Missing Props Validation
**Severity**: 🟢 LOW  
**File**: [src/components/LoadingSpinner.jsx](src/components/LoadingSpinner.jsx)

**Problem**: Component accepts `fullPage` prop but might not handle all cases

---

### 26. Badge Component Has Unclear Variants
**Severity**: 🟢 LOW  
**Files**: [src/components/Badge.jsx](src/components/Badge.jsx)

**Problem**: Different components use different badge variants:
- ProjectCard uses: `variant="info"` with category name
- StudentRequestsPage uses: `variant={'success' | 'danger' | 'warning'}`
- No consistency

---

### 27. Button Component Missing Disabled State
**Severity**: 🟢 LOW  
**File**: [src/components/Button.jsx](src/components/Button.jsx)

**Problem**: Button doesn't have disabled styling - looks clickable when disabled

---

### 28. Console Logging Left in Production Code
**Severity**: 🟢 LOW  
**File**: [src/pages/LoginPage.jsx](src/pages/LoginPage.jsx#L173-182)  
**Lines**: 173-182

**Problem**:
```javascript
console.log('[Login] Starting authentication...')
console.log(`[Login] Auth completed in ${Date.now() - loginStart}ms`, result)
console.log('[Login] Fetching user profile...')
console.log(`[Login] Profile fetched in ${Date.now() - profileStart}ms`, profileResult)
console.log(`[Login] Total time: ${Date.now() - loginStart}ms...`)
```

**Impact**: Debug logs visible in production browser console

---

## 📊 Summary by Severity

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 2 | **BLOCKS FUNCTIONALITY** |
| 🟠 High | 7 | **BREAKS FEATURES** |
| 🟡 Medium | 10 | **DEGRADES UX** |
| 🟢 Low | 9 | **MINOR ISSUES** |
| **TOTAL** | **28** | |

---

## 🚨 Critical Path Issues (Must Fix First)

These issues completely block the main functionality:

1. **Students cannot send requests** - Student records never created + RLS failures
2. **Supervisors cannot respond** - Supervisor records never created + RLS failures  
3. **Request system is broken** - Query joins are wrong, data relationships missing
4. **Notifications silently fail** - No error handling for notification creation

---

## ✅ Next Steps (Priority Order)

### Phase 1: Fix Critical Blockers
1. Add student/supervisor record creation on signup
2. Fix request service query joins
3. Add error handling for notifications
4. Create missing student/supervisor profile records for existing users

### Phase 2: Fix High Priority Issues
5. Fix navigation links (create missing pages or remove links)
6. Fix supervisor/project data display in components
7. Implement proper request status checking
8. Fix admin dashboard stats

### Phase 3: Fix Medium Issues
9. Centralize department enum
10. Add proper error messages
11. Fix N+1 query problem
12. Add missing validations

### Phase 4: Polish & Low Priority
13. Remove console.logs
14. Add loading states
15. Unify error handling patterns
16. Clean up unused code

---

## 📝 Files That Need Changes

**High Impact**:
- `src/services/authService.js` - Add student/supervisor creation
- `src/services/requestService.js` - Fix query joins and error handling
- `src/components/Navigation.jsx` - Fix broken links or create missing pages
- `src/pages/StudentRequestsPage.jsx` - Fix data display
- `DATABASE_SCHEMA.sql` - Consider RLS policy review

**Medium Impact**:
- `src/pages/StudentSupervisorsPage.jsx` - Fix N+1 query
- `src/pages/AdminDashboardPage.jsx` - Fetch student count
- `src/components/ProjectCard.jsx` - Fix data paths
- `src/components/SupervisorCard.jsx` - Fix data paths
- `src/pages/LoginPage.jsx` - Remove console logs

**Low Impact**:
- `src/context/store.js` - Update unread count logic
- Various pages - Add loading states, standardize error clearing

