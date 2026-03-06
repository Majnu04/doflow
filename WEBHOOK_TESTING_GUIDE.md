# 🧪 Testing Razorpay Webhooks on Localhost

## Why You Need This

Razorpay webhooks need a **public URL** to send payment notifications. Your `localhost:5000` is not accessible from the internet, so we need to create a **tunnel**.

---

## 🚀 Method 1: Using ngrok (Recommended)

### **Step 1: Install ngrok**

1. **Download**: https://ngrok.com/download
2. **Extract** the ZIP file
3. **Move** `ngrok.exe` to a folder in your PATH (or use directly)
4. **Sign up** for free account: https://dashboard.ngrok.com/signup
5. **Get auth token**: https://dashboard.ngrok.com/get-started/your-authtoken
6. **Authenticate**: 
   ```powershell
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### **Step 2: Start Your Backend**

```powershell
cd e:\doflow-main\doflow-main\backend
npm start
```

Backend should be running on `http://localhost:5000`

### **Step 3: Start ngrok Tunnel**

Open a **new terminal** and run:

```powershell
ngrok http 5000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copy that URL!** (e.g., `https://abc123.ngrok-free.app`)

### **Step 4: Configure Razorpay Webhook**

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click **"Create New Webhook"**
3. **Webhook URL**: `https://abc123.ngrok-free.app/api/payment/webhook`
4. **Active Events**:
   - ✅ `payment.authorized`
   - ✅ `payment.captured`
   - ✅ `payment.failed`
5. **Active**: Toggle ON
6. Click **"Create Webhook"**
7. **Copy the Webhook Secret**

### **Step 5: Update Your .env**

```env
RAZORPAY_WEBHOOK_SECRET=whsec_YourWebhookSecretHere
```

Restart your backend after updating.

### **Step 6: Test Payment**

1. Add a course to cart
2. Go to checkout
3. Use test card: `4111 1111 1111 1111`
4. Complete payment
5. Check your terminal - you should see:
   ```
   Webhook received: payment.captured Payment ID: pay_xxxxx
   ✅ Payment completed via webhook: pay_xxxxx
   ```

---

## 🚀 Method 2: Using Cloudflare Tunnel (Alternative)

### **Step 1: Install Cloudflare Tunnel**

```powershell
winget install --id Cloudflare.cloudflared
```

### **Step 2: Start Tunnel**

```powershell
cloudflared tunnel --url http://localhost:5000
```

You'll get a URL like: `https://abc-def.trycloudflare.com`

### **Step 3: Configure Razorpay**

Use the Cloudflare URL in webhook setup:
```
https://abc-def.trycloudflare.com/api/payment/webhook
```

---

## 🚀 Method 3: Using localtunnel (Simplest, No Account Needed)

### **Step 1: Install localtunnel**

```powershell
npm install -g localtunnel
```

### **Step 2: Start Tunnel**

```powershell
lt --port 5000
```

You'll get a URL like: `https://random-name-12345.loca.lt`

### **Step 3: Configure Razorpay**

Use the localtunnel URL:
```
https://random-name-12345.loca.lt/api/payment/webhook
```

⚠️ **Note**: localtunnel URLs change every time you restart, so you'll need to update Razorpay webhook URL each time.

---

## 🧪 Testing Without Webhook (Alternative)

If you don't want to set up tunneling, you can test without webhooks:

### **Current Flow (Already Working)**:
```
1. User pays
2. Frontend calls /api/payment/verify
3. Backend verifies and enrolls user ✅
```

This works perfectly fine! Webhook is just a **backup** for cases where:
- User closes browser before verification
- Network issues
- Frontend error

### **To Test This Flow**:
1. Add course to cart
2. Checkout and pay
3. Don't close browser - let it complete
4. User gets enrolled immediately ✅

Webhook is **optional** for testing but **recommended** for production.

---

## 📊 Monitoring Webhook Calls

### **In Your Backend Terminal**:
You'll see logs like:
```
Webhook received: payment.captured Payment ID: pay_xxxxx
✅ Payment completed via webhook: pay_xxxxx
```

### **In Razorpay Dashboard**:
1. Go to: Settings → Webhooks
2. Click on your webhook
3. View "Recent Deliveries"
4. See success/failure status

### **Common Webhook Events**:
- `payment.authorized` - Payment authorized but not captured
- `payment.captured` - Payment successful ✅
- `payment.failed` - Payment failed ❌
- `refund.created` - Refund initiated

---

## 🐛 Troubleshooting

### **Webhook Returns 404**
- Check URL: Should be `/api/payment/webhook` not `/payment/webhook`
- Verify ngrok is running and forwarding to port 5000

### **Webhook Returns 500**
- Check `RAZORPAY_WEBHOOK_SECRET` is set in `.env`
- Check backend logs for errors
- Restart backend after updating `.env`

### **Webhook Not Triggered**
- Check Razorpay dashboard → Webhooks → Recent Deliveries
- Verify webhook is "Active" (toggle ON)
- Check events are selected (`payment.captured`, etc.)

### **Invalid Signature Error**
- Webhook secret doesn't match
- Copy secret exactly from Razorpay dashboard
- No extra spaces or quotes in `.env`

---

## ✅ Quick Start (Recommended for Testing)

**Easiest way to test webhooks:**

1. **Install ngrok**: https://ngrok.com/download
2. **Run backend**: `npm start` (in backend folder)
3. **Run ngrok**: `ngrok http 5000` (in new terminal)
4. **Copy URL**: e.g., `https://abc123.ngrok-free.app`
5. **Create webhook** in Razorpay with URL: `https://abc123.ngrok-free.app/api/payment/webhook`
6. **Copy webhook secret** and add to `.env`
7. **Restart backend**
8. **Test payment** with test card
9. **Check terminal** for webhook logs

---

## 🎯 Summary

| Method | Pros | Cons |
|--------|------|------|
| **ngrok** | Most reliable, persistent URL | Requires account |
| **Cloudflare Tunnel** | Fast, no rate limits | Requires installation |
| **localtunnel** | No account needed | URL changes on restart |
| **No tunnel** | Works immediately | No webhook backup |

**For testing**: Just use the normal payment flow (no webhook needed)  
**For production**: Webhook is **required** for reliability  

---

## 📝 Next Steps

1. ✅ Test payment flow without webhook (works now!)
2. ⏭️ When deploying: Set up webhook with production URL
3. ⏭️ For localhost testing: Optional - use ngrok if you want to test webhook

**Your current setup works perfectly without webhook! It's just an extra safety layer for production.** 🚀
