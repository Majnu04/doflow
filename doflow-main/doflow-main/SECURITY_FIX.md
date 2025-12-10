# Security Alert Resolution - Google API Key Exposure

## ⚠️ Critical Action Required

A Google Gemini API key was detected in the repository at commit `eb579be1` in `services/geminiService.ts`. This key has been removed from the codebase, but you must take immediate action to secure your application.

## Immediate Steps Required

### 1. Rotate the Exposed API Key (CRITICAL)

The exposed API key was: `AIzaSyBICwkEtkRHtY4F-L0yiBp5NP0Z6mPlB4g`

**You must immediately:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find the exposed API key
4. **Delete or regenerate** this key to prevent unauthorized usage
5. Create a new API key for your application
6. Set appropriate restrictions on the new key:
   - API restrictions: Limit to Gemini API only
   - Application restrictions: Set HTTP referrer or IP restrictions as appropriate

### 2. Set Up Environment Variables

The hardcoded API key has been removed. You now need to configure environment variables.

#### For Local Development (Frontend):

1. Create a `.env` file in `doflow-main/doflow-main/`:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GEMINI_API_KEY=your_new_google_gemini_api_key
```

2. Replace `your_new_google_gemini_api_key` with your new API key

#### For Local Development (Backend):

1. Create a `.env` file in `doflow-main/doflow-main/backend/`:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/elite-digital-academy
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
GEMINI_API_KEY=your_new_google_gemini_api_key
# ... other variables from .env.example
```

2. Replace `your_new_google_gemini_api_key` with your new API key

### 3. Configure Production Environment (Vercel)

Since you're using Vercel, add the environment variable:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your new Google Gemini API key
   - Environment: Select Production, Preview, and Development as needed
4. Redeploy your application

### 4. Verify the Fix

1. Ensure `.env` files are in `.gitignore` (already configured)
2. Never commit `.env` files to the repository
3. Test that the application works with environment variables:
   ```bash
   # Frontend
   cd doflow-main/doflow-main
   npm run dev
   
   # Backend
   cd doflow-main/doflow-main/backend
   npm run dev
   ```

### 5. Monitor API Usage

After rotating the key:
1. Monitor your Google Cloud Console for any unexpected API usage
2. Set up billing alerts if not already configured
3. Review API access logs for suspicious activity

## What Was Changed

### Files Modified:
- ✅ `services/geminiService.ts` - Removed hardcoded API key
- ✅ `.env.example` - Added `VITE_GEMINI_API_KEY` template
- ✅ `backend/.env.example` - Added `GEMINI_API_KEY` template

### How It Works Now:
The `geminiService.ts` now resolves the API key in this order:
1. Server-side environment variables (`GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`)
2. Vite runtime config (for client-side)
3. Window-injected config (for hosted deployments)

## Prevention

To prevent similar issues:
1. Always use environment variables for sensitive data
2. Use `.env.example` as a template (never commit `.env`)
3. Enable GitHub secret scanning alerts
4. Review code before committing sensitive information
5. Use tools like `git-secrets` or pre-commit hooks to detect secrets

## Need Help?

If you need assistance:
- [Google Cloud Console Help](https://cloud.google.com/support)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables)

## Checklist

- [ ] Rotated/deleted the exposed Google API key in Google Cloud Console
- [ ] Created a new Google Gemini API key with proper restrictions
- [ ] Added `VITE_GEMINI_API_KEY` to local `.env` file
- [ ] Added `GEMINI_API_KEY` to backend `.env` file (if needed)
- [ ] Added environment variable to Vercel project settings
- [ ] Tested application locally with new environment variables
- [ ] Redeployed application to production
- [ ] Monitored API usage for suspicious activity
- [ ] Removed this file after completing all steps
