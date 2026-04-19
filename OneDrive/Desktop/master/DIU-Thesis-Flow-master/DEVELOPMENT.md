# Development Guidelines

This document provides guidelines for developing the Thesis Management System.

## Code Style

### JavaScript/React

- Use ES6+ syntax
- Use functional components with hooks
- Use arrow functions
- Destructuring for props and state
- Use meaningful variable names

```javascript
// ✅ Good
const handleSubmit = async (formData) => {
  const { email, password } = formData
  const result = await authService.login(email, password)
  if (result.success) {
    // Handle success
  }
}

// ❌ Avoid
function handleSubmit(data) {
  var e = data.email
  var p = data.password
  authService.login(e, p).then(res => {
    // Handle
  })
}
```

### File Organization

```
feature/
├── index.js          // Exports
├── Component.jsx     // Main component
├── Component.module.css  // Styles (if needed)
└── Component.test.js // Tests (if added)
```

### Component Structure

```javascript
import React, { useState, useEffect } from 'react'
import { useStore } from '../context/store'
import { service } from '../services'
import { Component } from '../components'

// Component
export const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState()
  const store = useStore()

  useEffect(() => {
    // Initialize
  }, [])

  const handleEvent = () => {
    // Handle event
  }

  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default MyComponent
```

## Naming Conventions

### Files
- Components: PascalCase (Button.jsx)
- Services: camelCase (projectService.js)
- Utils: camelCase (helpers.js)
- Styles: snake_case (form_styles.css)

### Variables/Functions
- Functions: camelCase (handleClick, fetchData)
- Constants: UPPER_SNAKE_CASE (MAX_ITEMS)
- React components: PascalCase (MyComponent)
- Classes: PascalCase (UserService)

### CSS Classes
- kebab-case (my-component-class)
- BEM methodology (block__element--modifier)

```css
.button {
  /* Block */
}

.button__text {
  /* Element */
}

.button--primary {
  /* Modifier */
}
```

## Git Workflow

### Branch Naming
```
feature/description-of-feature
bugfix/description-of-bug
hotfix/critical-issue
refactor/description-of-refactor
```

### Commit Messages

```
[TYPE] Brief description

Detailed explanation if needed.
```

Types:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Code style (no logic change)
- **refactor**: Refactor code
- **perf**: Performance improvement
- **test**: Add tests
- **chore**: Build/dependency updates

Examples:
```
feat: Add project search functionality
fix: Resolve notification loading issue
docs: Update README with setup instructions
```

## Testing

### What to Test
- Service functions
- Component behavior
- User interactions
- Error handling

### Testing Tools (When Added)
- Jest (unit tests)
- React Testing Library (component tests)
- Cypress (E2E tests)

### Test File Naming
```
ComponentName.test.js
projectService.test.js
helpers.test.js
```

## State Management with Zustand

### Creating a Store
```javascript
import { create } from 'zustand'

export const useMyStore = create((set) => ({
  state: initialValue,
  
  setState: (value) => set({ state: value }),
  
  incrementState: () => set((state) => ({
    state: state.state + 1
  }))
}))
```

### Using in Components
```javascript
const { state, setState } = useMyStore()
```

## Service Functions

### Pattern
```javascript
export const myService = {
  async getItems() {
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*')
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
```

## Component Reusability

### Make Components Reusable
- Pass data as props
- Use callback functions for events
- Avoid hardcoded strings
- Support multiple variants/sizes

```javascript
// ✅ Good - Reusable
export const Button = ({ children, onClick, variant = 'primary' }) => (
  <button onClick={onClick} className={`btn btn-${variant}`}>
    {children}
  </button>
)

// ❌ Bad - Not reusable
export const SubmitButton = () => (
  <button className="btn btn-blue" onClick={submitForm}>
    Submit
  </button>
)
```

## Error Handling

### Frontend
```javascript
try {
  const result = await service.action()
  if (!result.success) {
    setError(result.error)
  }
} catch (error) {
  setError('An unexpected error occurred')
}
```

### User Feedback
```javascript
if (error) {
  return <Alert type="error" message={error} />
}

if (loading) {
  return <LoadingSpinner />
}

if (!data) {
  return <p>No data found</p>
}
```

## Performance Tips

1. **Avoid Unnecessary Re-renders**
   - Use useCallback for event handlers
   - Use useMemo for expensive computations
   - Memoize components when appropriate

2. **Optimize Data Fetching**
   - Cache results in Zustand
   - Avoid fetching same data multiple times
   - Implement pagination for large datasets

3. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for heavy components

4. **Bundle Size**
   - Use tree-shaking friendly libraries
   - Import only needed utilities
   - Monitor bundle size

## Debugging

### Browser DevTools
- React DevTools for component inspection
- Redux DevTools for state inspection (if used)
- Network tab for API calls
- Console for errors

### Logging
```javascript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

### Supabase Debugging
- Check database in Supabase dashboard
- View RLS policies
- Check auth settings
- Monitor real-time subscriptions

## Documentation

### Comments
```javascript
// Use meaningful comments
// ✅ Good: Explains why, not what
// Fetch projects after component mounts to ensure data freshness

// ❌ Avoid: States obvious
// Set projects state
```

### JSDoc for Complex Functions
```javascript
/**
 * Fetches projects from the database
 * @param {string} category - Project category to filter
 * @returns {Promise<Object>} - Success/error response
 */
export const getProjects = async (category) => {
  // Implementation
}
```

## Security Checklist

- [ ] No secrets in code (use env vars)
- [ ] Input validation on client
- [ ] RLS policies enabled
- [ ] HTTPS in production
- [ ] XSS prevention (React sanitization)
- [ ] CSRF tokens (if applicable)
- [ ] Rate limiting (if needed)
- [ ] Error messages don't leak info

## Common Issues & Solutions

### Issue: State not updating
**Solution**: Check if you're mutating state directly
```javascript
// ❌ Wrong
state.items.push(newItem)

// ✅ Correct
[...state.items, newItem]
```

### Issue: Infinite loops
**Solution**: Check useEffect dependencies
```javascript
// ❌ Wrong
useEffect(() => {
  setData(fetchedData)
})

// ✅ Correct
useEffect(() => {
  setData(fetchedData)
}, [])
```

### Issue: Authentication issues
**Solution**: Check Supabase session
```javascript
const { data } = await supabase.auth.getSession()
console.log(data.session) // Check token
```

## Useful Resources

- [React Best Practices](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [JavaScript Standards](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

## Code Review Checklist

- [ ] Code follows style guide
- [ ] Components are reusable
- [ ] No console errors/warnings
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] RLS policies appropriate
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Responsive design tested

---

Happy coding! 🚀
