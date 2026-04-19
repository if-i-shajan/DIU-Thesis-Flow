# Deployment Guide

This guide covers deploying the Thesis Management System to production.

## Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying React + Vite applications.

### Prerequisites
- GitHub account with repository
- Vercel account (free tier available)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### Step 3: Configure Environment Variables

1. In Vercel project settings, go to "Environment Variables"
2. Add the following:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`

3. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (3-5 minutes)
3. Your app is now live at the provided URL

### Post-Deployment

- Custom domain: Add in Vercel settings
- Analytics: Automatically enabled
- Performance monitoring: Available in Vercel dashboard

## Backend (Supabase)

Supabase PostgreSQL is fully managed and requires no additional deployment.

### Database Backups

Supabase automatically backs up your database. To download backups:

1. Go to Supabase dashboard
2. Project > Settings > Backups
3. Download latest backup

### Database Migration

To migrate to production database:

1. Create new Supabase project for production
2. Copy the schema from development:
   - Use SETUP.md: EXPORT DATABASE from dev
   - IMPORT DATABASE to production
3. Update environment variables in Vercel
4. Redeploy frontend

## Environment Variables Reference

### Development (.env.local)
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev_anon_key
VITE_API_URL=http://localhost:3000
```

### Production (Vercel)
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
VITE_API_URL=https://your-domain.com
```

## Domain Configuration

### Custom Domain on Vercel

1. Go to project settings > Domains
2. Add your custom domain
3. Update DNS records at your domain provider
4. Vercel provides DNS instructions

### HTTPS

- Automatically enabled for vercel.app domains
- Automatic SSL for custom domains

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting**: Routes are automatically code-split
2. **Image Optimization**: Use next/image or similar
3. **Minification**: Automatically done by Vite

### Database Optimization

1. Indexes are already created
2. Monitor slow queries in Supabase
3. Optimize RLS policies for performance

## Monitoring & Analytics

### Vercel Analytics
- Real-time metrics
- Core Web Vitals
- Error tracking

### Supabase Monitoring
- Query performance
- Storage usage
- API usage

## Troubleshooting Deployment

### Build Fails
- Check Node version (16+)
- Review build logs in Vercel
- Ensure all env vars are set

### API Errors
- Verify Supabase URL and keys
- Check RLS policies
- Review browser console

### Performance Issues
- Check Vercel Analytics
- Optimize database queries
- Consider caching strategies

## Scaling Considerations

### Vercel Scaling
- Automatic scaling on Pro plan
- No additional configuration needed
- Pay per resources used

### Supabase Scaling
- Free tier: Good for small projects
- Pro tier: For larger applications
- Enterprise: Custom solutions

## Security Checklist

- [ ] Environment variables are secure
- [ ] Supabase RLS policies are enabled
- [ ] Custom domain has HTTPS
- [ ] API keys rotated regularly
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Rollback Procedures

### Frontend Rollback
1. Go to Vercel Deployments
2. Select previous deployment
3. Click "Redeploy"

### Database Rollback
1. Go to Supabase Backups
2. Restore previous backup
3. Verify data integrity

## Continuous Integration/Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Deployment](https://react.dev/learn/deployment)

---

**Deployed successfully? Great! 🚀**
