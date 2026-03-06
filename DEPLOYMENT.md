# 🚀 Deployment Guide - Elite Digital Academy

Complete deployment guide for the Elite Digital Academy MERN course platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ MongoDB Atlas account
- ✅ Razorpay account (with API keys)
- ✅ AWS account or DigitalOcean account (for file storage)
- ✅ Vercel/Netlify account (for frontend)
- ✅ Railway/Render account (for backend)

---

## MongoDB Atlas Setup

### 1. Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up or log in
3. Create new project: "Elite Digital Academy"
4. Click "Build a Database"
5. Choose FREE tier (M0)
6. Select region closest to your users
7. Create cluster

### 2. Configure Database Access

1. Database Access → Add New Database User
2. Choose "Password" authentication
3. Create username and strong password
4. Set privileges to "Read and write to any database"
5. Add User

### 3. Configure Network Access

1. Network Access → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm

### 4. Get Connection String

1. Database → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database password
5. Save this for environment variables

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/elite-digital-academy?retryWrites=true&w=majority
```

---

## Backend Deployment

### Option 1: Railway

#### Setup

1. Go to [Railway](https://railway.app/)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Select `backend` folder as root

#### Configuration

1. Add Environment Variables:
   - Click on your service
   - Go to "Variables" tab
   - Add all variables from `.env.example`

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=elite-digital-academy
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_BUCKET=elite-digital-academy
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

2. Set Start Command:
   - Settings → Start Command
   - Enter: `node server.js`

3. Deploy:
   - Click "Deploy"
   - Wait for build to complete
   - Copy your Railway app URL

#### Custom Domain (Optional)

1. Settings → Domains
2. Add custom domain
3. Follow DNS configuration instructions

### Option 2: Render

#### Setup

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - Name: `elite-academy-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

#### Environment Variables

1. Add all environment variables
2. Use the same format as Railway above

#### Deploy

1. Click "Create Web Service"
2. Wait for deployment
3. Copy your Render URL

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Setup

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Environment Variables

Add the following environment variables:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

#### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your site will be live!

#### Custom Domain

1. Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Option 2: Netlify

#### Setup

1. Go to [Netlify](https://netlify.com/)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose your repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Environment Variables

1. Site settings → Environment variables
2. Add:
```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

#### Deploy

1. Click "Deploy site"
2. Wait for build
3. Site is live!

---

## AWS S3 / DigitalOcean Spaces Setup

### AWS S3

1. **Create Bucket**
   - AWS Console → S3
   - Create bucket: `elite-digital-academy`
   - Region: Choose closest to users
   - Block all public access: OFF (for signed URLs)

2. **Create IAM User**
   - IAM → Users → Add user
   - User name: `elite-academy-uploader`
   - Access type: Programmatic access
   - Attach policies: `AmazonS3FullAccess`
   - Save Access Key ID and Secret Access Key

3. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### DigitalOcean Spaces

1. **Create Space**
   - Manage → Spaces
   - Create new Space
   - Choose region
   - Set permissions: Private
   - Name: `elite-digital-academy`

2. **Generate API Keys**
   - API → Spaces access keys
   - Generate New Key
   - Save Key and Secret

3. **Configure CDN** (Optional)
   - Enable CDN for faster delivery
   - Note the CDN endpoint

---

## Razorpay Setup

### 1. Create Account

1. Go to [Razorpay](https://razorpay.com/)
2. Sign up for account
3. Complete KYC verification

### 2. Generate API Keys

1. Dashboard → Settings → API Keys
2. Generate Test Keys (for development)
3. Generate Live Keys (for production)
4. Save Key ID and Secret

### 3. Configure Webhooks

1. Settings → Webhooks
2. Add webhook URL: `https://your-backend-url/api/payment/webhook`
3. Select events:
   - payment.authorized
   - payment.captured
   - payment.failed
4. Save webhook secret

---

## Environment Configuration

### Backend Environment Variables

Create/update `.env` in backend:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elite-digital-academy

# JWT
JWT_SECRET=your_super_long_random_secret_key_min_32_characters_use_crypto
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# AWS S3 / DigitalOcean Spaces
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=elite-digital-academy

# For DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_BUCKET=elite-digital-academy

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

### Frontend Environment Variables

Create/update `.env`:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

---

## Post-Deployment

### 1. Create Admin Account

Option A: Using MongoDB Compass/Atlas
1. Connect to your database
2. Insert admin user directly:
```json
{
  "name": "Admin User",
  "email": "admin@elitedigital.com",
  "password": "$2a$10$hashed_password", // Use bcrypt to hash
  "role": "admin",
  "isEmailVerified": true,
  "createdAt": new Date()
}
```

Option B: Using API
1. Register normally via `/api/auth/register`
2. Update user role in database to `admin`

### 2. Test Payment Flow

1. Use Razorpay test mode
2. Test card: 4111 1111 1111 1111
3. Any future expiry date
4. Any CVV

### 3. Add Sample Courses

1. Login as admin
2. Navigate to admin dashboard
3. Create sample courses with:
   - Titles, descriptions
   - Pricing
   - Upload thumbnail images
   - Add course sections and lessons
   - Upload video content

### 4. Configure SEO

Update in each page component:
```tsx
<Helmet>
  <title>Elite Digital Academy - Learn Tech Skills</title>
  <meta name="description" content="Your description" />
  <meta property="og:title" content="Elite Digital Academy" />
  <meta property="og:image" content="your-og-image-url" />
</Helmet>
```

### 5. Setup Monitoring

- **Backend**: Set up error tracking (Sentry)
- **Frontend**: Google Analytics
- **Uptime**: UptimeRobot or similar

### 6. Backup Strategy

1. MongoDB Atlas automatic backups (enabled by default)
2. S3 versioning for file backups
3. Database exports weekly

---

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure `FRONTEND_URL` is correct in backend
- Check Vercel/Netlify environment variables

**Database Connection**
- Verify MongoDB connection string
- Check IP whitelist in Atlas
- Ensure database user has correct permissions

**Payment Failures**
- Verify Razorpay keys (live vs test)
- Check webhook URL is accessible
- Review Razorpay dashboard logs

**File Upload Issues**
- Verify S3/Spaces credentials
- Check bucket permissions
- Ensure CORS is configured

### Logs

**Railway**: View logs in dashboard
**Render**: Build & Deploy logs available
**Vercel**: Function logs in dashboard
**Netlify**: Deploy logs and function logs

---

## Security Checklist

- ✅ Strong JWT_SECRET (min 32 characters)
- ✅ HTTPS enabled on all endpoints
- ✅ Environment variables secured
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Database access restricted
- ✅ API keys not exposed in frontend
- ✅ File upload size limits set
- ✅ Input validation enabled
- ✅ Helmet security headers active

---

## Maintenance

### Regular Tasks

**Weekly**
- Review error logs
- Check disk space usage
- Monitor API response times

**Monthly**
- Update dependencies
- Review security advisories
- Backup database exports
- Audit user access logs

**Quarterly**
- Security audit
- Performance optimization
- Cost analysis
- Feature planning

---

## Scaling Considerations

When your platform grows:

1. **Database**: Upgrade MongoDB Atlas tier
2. **CDN**: Use Cloudflare or similar
3. **Caching**: Implement Redis
4. **Load Balancing**: Multiple backend instances
5. **Video**: Consider Vimeo/Wistia for video hosting
6. **Search**: Implement Elasticsearch

---

## Support

For deployment issues:
- Backend: Check Railway/Render logs
- Frontend: Check Vercel/Netlify build logs
- Database: MongoDB Atlas monitoring
- Payment: Razorpay support dashboard

---

## Conclusion

Your Elite Digital Academy platform is now live! 🎉

Monitor your deployments, keep dependencies updated, and scale as your user base grows.

**Next Steps:**
1. Market your platform
2. Create quality course content
3. Engage with students
4. Gather feedback
5. Iterate and improve

Good luck with your course platform! 🚀
