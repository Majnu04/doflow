# Backend Deployment Guide - Render

## 🚀 Deploy to Render (Free Tier)

### Prerequisites
1. GitHub account with your code pushed
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account (for database)

---

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 Sandbox)
3. Create a database user
4. Whitelist all IPs: `0.0.0.0/0` (for Render access)
5. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/doflow?retryWrites=true&w=majority
   ```

---

## Step 2: Prepare Your Repository

### Push backend to GitHub

```bash
# Navigate to backend directory
cd backend

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare backend for Render deployment"

# Add remote (create a new repo on GitHub first)
git remote add origin https://github.com/Majnu04/doflow-backend.git

# Push
git push -u origin main
```

**Important:** Make sure `.env` is in `.gitignore`!

---

## Step 3: Deploy on Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Select your backend repository
   - Click "Connect"

3. **Configure Service**
   ```
   Name: doflow-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: (leave empty if backend is at root, or enter "backend")
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Plan**
   - Choose "Free" tier
   - Click "Create Web Service"

5. **Add Environment Variables**
   Click "Environment" tab and add these:

   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doflow
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   FRONTEND_URL=https://doflow-ebon.vercel.app
   AWS_ACCESS_KEY_ID=your_aws_key (optional)
   AWS_SECRET_ACCESS_KEY=your_aws_secret (optional)
   AWS_REGION=us-east-1 (optional)
   AWS_S3_BUCKET=your-bucket-name (optional)
   ```

6. **Deploy**
   - Render will automatically build and deploy
   - Wait 5-10 minutes for first deployment
   - You'll get a URL like: `https://doflow-backend.onrender.com`

---

### Option B: Using render.yaml (Blueprint)

1. **Create `render.yaml` in backend root** (already created)

2. **Deploy from Render Dashboard**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will detect `render.yaml` and configure automatically

3. **Add Secret Environment Variables**
   - These need to be added manually in the dashboard
   - Go to your service → "Environment"
   - Add the variables marked with `sync: false` in render.yaml

---

## Step 4: Update Frontend to Use Production Backend

Update your frontend `.env`:

```bash
VITE_API_URL=https://doflow-backend.onrender.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Then redeploy frontend on Vercel.

---

## Step 5: Test Your Deployment

### Check Health Endpoint
```bash
curl https://doflow-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Elite Digital Academy API is running"
}
```

### Test API Endpoints
```bash
# Test courses endpoint
curl https://doflow-backend.onrender.com/api/courses

# Test auth endpoint
curl -X POST https://doflow-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Application failed to respond"
**Solution:** 
- Check if PORT is set to `10000` or use `process.env.PORT`
- Verify server.js listens on correct port:
  ```javascript
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => { ... });
  ```

### Issue 2: "Cannot connect to MongoDB"
**Solution:**
- Verify MONGODB_URI is correct
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Check database user has correct permissions

### Issue 3: "Module not found"
**Solution:**
- Ensure `package.json` has all dependencies
- Check `"type": "module"` is set for ES6 imports
- Verify file extensions (.js) in imports

### Issue 4: Build fails
**Solution:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `dependencies` not `devDependencies`
- Remove `node_modules` from git (check .gitignore)

### Issue 5: CORS errors
**Solution:**
- Update CORS origin in server.js:
  ```javascript
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://doflow-ebon.vercel.app'
    ],
    credentials: true
  }));
  ```

### Issue 6: Free tier sleeps after 15 mins
**Solution:**
- Use a service like UptimeRobot to ping every 14 minutes
- Or upgrade to paid tier ($7/month)

---

## 📊 Monitor Your Deployment

### Render Dashboard
- View logs: Dashboard → Your Service → "Logs" tab
- View metrics: "Metrics" tab
- View events: "Events" tab

### Health Monitoring
Set up monitoring with:
- UptimeRobot (free): https://uptimerobot.com
- Better Stack (free tier): https://betterstack.com

---

## 🔐 Security Checklist

- ✅ `.env` is in `.gitignore`
- ✅ All secrets in Render environment variables
- ✅ MongoDB IP whitelist configured
- ✅ Strong JWT_SECRET (min 32 characters)
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Helmet.js security headers active

---

## 📝 Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | Yes | `10000` | Server port (Render uses 10000) |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | Yes | `your-secret-key` | JWT signing key (32+ chars) |
| `RAZORPAY_KEY_ID` | Yes | `rzp_test_...` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Yes | `secret123` | Razorpay secret key |
| `FRONTEND_URL` | Yes | `https://...vercel.app` | Frontend URL for CORS |
| `AWS_ACCESS_KEY_ID` | No | `AKIA...` | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | No | `secret` | AWS S3 secret key |
| `AWS_REGION` | No | `us-east-1` | AWS region |
| `AWS_S3_BUCKET` | No | `bucket-name` | S3 bucket name |

---

## 🎉 Deployment Complete!

Your backend is now live at:
```
https://doflow-backend.onrender.com
```

Update your frontend to use this URL and you're good to go! 🚀

---

## 💰 Pricing

**Free Tier:**
- 750 hours/month
- 512 MB RAM
- Sleeps after 15 min inactivity
- Public repositories only

**Starter Tier ($7/month):**
- Always on
- 512 MB RAM
- Private repositories
- Custom domains

---

## 📚 Resources

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Node.js Deployment: https://render.com/docs/deploy-node-express-app
