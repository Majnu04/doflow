# 🚀 Razorpay Production Deployment Guide

## ✅ Current Implementation Status

Your Razorpay integration is **production-ready** with webhook support!

### Implemented Features:
- ✅ Order creation with Razorpay
- ✅ Payment signature verification (client-side)
- ✅ Webhook handler (server-side verification)
- ✅ Enrollment only after successful payment
- ✅ Cart cleanup after payment
- ✅ Duplicate enrollment prevention
- ✅ Course enrollment count tracking
- ✅ Error handling

---

## 📋 Steps to Move from Test to Live Mode

### **Step 1: Get Live Razorpay Keys**

1. **Login**: https://dashboard.razorpay.com/
2. **Disable Test Mode** (toggle at top-left to OFF)
3. **Complete KYC**: Go to Settings → Account & Settings → Business Details
   - Submit business documents
   - Wait for approval (usually 24-48 hours)
4. **Generate Live Keys**: Settings → API Keys
   - Click "Generate Live Keys"
   - Copy both:
     - Key ID (starts with `rzp_live_`)
     - Key Secret

### **Step 2: Setup Webhook**

1. **Go to**: Settings → Webhooks (https://dashboard.razorpay.com/app/webhooks)
2. **Click "Create New Webhook"**
3. **Webhook URL**: `https://yourdomain.com/api/payment/webhook`
4. **Select Events**:
   - ✅ `payment.authorized`
   - ✅ `payment.captured`
   - ✅ `payment.failed`
5. **Active**: Toggle ON
6. **Click "Create Webhook"**
7. **Copy the Webhook Secret** (shown only once)

### **Step 3: Update Environment Variables**

Update your production `.env` file:

```env
# Razorpay Live Configuration
RAZORPAY_KEY_ID=rzp_live_YourLiveKeyHere
RAZORPAY_KEY_SECRET=YourLiveSecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
```

⚠️ **IMPORTANT**: Never commit these to Git! Use environment variables in your hosting platform.

### **Step 4: Enable Payment Methods**

In Razorpay Dashboard → Settings → Payment Methods:
- ✅ Cards (Credit/Debit)
- ✅ UPI
- ✅ Net Banking
- ✅ Wallets
- ✅ EMI (optional)
- ✅ International Cards (if needed)

### **Step 5: Configure Settlement**

Settings → Settlement:
- Set up bank account for automatic settlements
- Default: T+3 (amount settled 3 business days after payment)

---

## 🔧 Hosting Platform Configuration

### **Vercel/Netlify (Frontend)**
No changes needed - frontend uses environment variables from backend API.

### **Railway/Render/Heroku (Backend)**

Add environment variables:
```
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

### **Webhook URL Format**
```
https://your-backend-domain.com/api/payment/webhook
```

---

## 🧪 Testing in Live Mode (Without Real Money)

Razorpay doesn't support test transactions in live mode. Options:

1. **Use small amounts**: Test with ₹1 or ₹10
2. **Refund immediately**: Refund test payments from dashboard
3. **Test with your own card**: Use your real card, then refund

---

## 📊 How It Works in Production

### **Normal Payment Flow (User Completes Payment)**
```
1. User clicks "Pay" → Frontend calls /api/payment/create-order
2. Backend creates Razorpay order + pending enrollment
3. Razorpay modal opens
4. User enters real card/UPI and pays
5. Razorpay verifies payment
6. Frontend calls /api/payment/verify
7. Backend verifies signature → enrollment completed ✅
8. Cart cleared, user enrolled
```

### **Webhook Flow (Backup/Async)**
```
1. User pays but closes browser before verification
2. Razorpay sends webhook to /api/payment/webhook
3. Backend verifies webhook signature
4. Enrollment completed automatically ✅
5. Next time user logs in, course is enrolled
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: International Cards Not Accepted**
**Cause**: International payments disabled in Razorpay settings  
**Solution**: Settings → Payment Methods → Enable International Cards  
**Note**: Requires additional KYC for international payments

### **Issue 2: Webhook Not Working**
**Cause**: Incorrect webhook URL or secret  
**Solution**: 
- Verify webhook URL is publicly accessible
- Check webhook secret matches `.env`
- Check Razorpay dashboard for webhook delivery logs

### **Issue 3: Payment Succeeds But Enrollment Doesn't Complete**
**Cause**: Webhook not configured or failed  
**Solution**: 
- User can retry from cart (won't charge again)
- Admin can manually mark enrollment as completed
- Check webhook logs in Razorpay dashboard

---

## 🔐 Security Checklist

- ✅ Razorpay Key Secret never exposed to frontend
- ✅ Payment signature verified on backend
- ✅ Webhook signature verified
- ✅ Enrollment status checked before creating order
- ✅ Amount verified against course price
- ✅ User authentication required for all payment endpoints

---

## 💰 Razorpay Fees (Live Mode)

- **Domestic Cards/UPI/Net Banking**: 2% per transaction
- **International Cards**: 3% + ₹2 per transaction
- **EMI**: Additional charges apply
- **Settlement**: Free (automatic to your bank account)

---

## 📝 Checklist Before Going Live

- [ ] KYC completed and approved
- [ ] Live API keys generated
- [ ] Webhook configured with correct URL
- [ ] Environment variables updated in production
- [ ] Bank account added for settlements
- [ ] Payment methods enabled
- [ ] Tested with small real transaction
- [ ] GST details added (if applicable)
- [ ] Terms & Conditions page live
- [ ] Refund policy page live

---

## 🎯 Post-Deployment Monitoring

### Monitor These:
1. **Razorpay Dashboard**: Check daily for failed/pending payments
2. **Webhook Logs**: Ensure webhooks are being delivered
3. **Database**: Check for stuck "pending" enrollments
4. **User Reports**: Handle payment issues within 24 hours

### Key Metrics:
- Payment success rate (should be >95%)
- Webhook delivery rate (should be 100%)
- Average payment time
- Refund rate

---

## 🔄 Handling Refunds

### Manual Refund (from Razorpay Dashboard):
1. Go to Transactions → Payments
2. Find payment → Click "Refund"
3. Enter amount → Confirm
4. Manually remove enrollment from database

### Programmatic Refund (Future Enhancement):
Add this endpoint to `paymentController.js`:
```javascript
export const refundPayment = async (req, res) => {
  const { paymentId, amount } = req.body;
  const razorpay = getRazorpayInstance();
  
  const refund = await razorpay.payments.refund(paymentId, {
    amount: amount * 100 // amount in paise
  });
  
  // Update enrollment status to refunded
  // Remove from user's enrolled courses
  
  res.json({ success: true, refund });
};
```

---

## 📞 Support

- **Razorpay Support**: https://razorpay.com/support/
- **Developer Docs**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/

---

## ✅ Summary

**Your implementation is production-ready!** 

To deploy:
1. Get live Razorpay keys (after KYC)
2. Setup webhook
3. Update `.env` with live keys
4. Deploy backend + frontend
5. Test with real small transaction

**The code handles:**
- ✅ Real card payments
- ✅ UPI payments
- ✅ Net Banking
- ✅ Wallet payments
- ✅ Automatic enrollment
- ✅ Webhook backup (if user closes browser)

**You're good to go! 🚀**
