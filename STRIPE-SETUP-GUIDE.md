# Stripe Setup Guide - SteppersLife Events

**Goal:** Set up Stripe in development mode for split payments
**Time Required:** 10-15 minutes

---

## 📋 STEP-BY-STEP SETUP

### Step 1: Create/Login to Stripe Account

I've opened the Stripe Dashboard for you. Follow these steps:

1. **If you don't have a Stripe account:**
   - Click "Sign up"
   - Enter your email
   - Create password
   - Verify email

2. **If you have a Stripe account:**
   - Login with your credentials
   - You should see the Dashboard

---

### Step 2: Enable Test Mode

**IMPORTANT:** We'll start in Test Mode (development)

1. In the Stripe Dashboard, look for the toggle at the top
2. Make sure **"Test mode"** is ENABLED (toggle should be ON)
3. You should see "Viewing test data" indicator

**Test Mode means:**
- No real money is processed
- You can use test card numbers
- Perfect for development

---

### Step 3: Get Your API Keys

#### 3.1 Get Publishable Key (Frontend)

1. In Stripe Dashboard, click **"Developers"** in the left menu
2. Click **"API keys"**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

4. **Copy the Publishable key:**
   - Click the copy icon next to "Publishable key"
   - It should look like: `pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save this somewhere temporarily

#### 3.2 Get Secret Key (Backend)

1. On the same page, find **"Secret key"**
2. Click **"Reveal test key"**
3. Click the copy icon
4. It should look like: `sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Save this somewhere temporarily

**🔒 SECURITY NOTE:**
- NEVER commit the secret key to git
- NEVER share it publicly
- Only use in server-side code

---

### Step 4: Set Up Stripe Connect (For Split Payments)

Your app uses Stripe Connect to split payments between you (platform) and event organizers.

#### 4.1 Enable Stripe Connect

1. In Stripe Dashboard, click **"Connect"** in the left menu
2. Click **"Get Started"**
3. Choose **"Platform or marketplace"**
4. Click **"Continue"**

#### 4.2 Configure Connect Settings

1. **Platform name:** SteppersLife Events
2. **Platform URL:** https://events.stepperslife.com (or your domain)
3. **Support email:** Your email
4. Click **"Save"**

#### 4.3 Get Connect Settings

1. Go to **Connect → Settings**
2. Note your **Client ID** (starts with `ca_`)
3. Under **OAuth settings**, enable:
   - ✅ "Express accounts"
   - ✅ "Custom accounts" (optional)

---

### Step 5: Add Keys to Your Environment

Now I'll help you add these keys to your `.env.local` file.

**You'll need these 3 values:**
1. Secret Key (`sk_test_...`)
2. Publishable Key (`pk_test_...`)
3. Connect Client ID (`ca_...`) - optional for now

---

## 🔑 WHERE TO FIND EACH KEY

### Summary of Keys:

| Key | Where to Find | Starts With | Used For |
|-----|---------------|-------------|----------|
| **Secret Key** | Developers → API keys → Secret key | `sk_test_` | Backend payment processing |
| **Publishable Key** | Developers → API keys → Publishable key | `pk_test_` | Frontend payment forms |
| **Webhook Secret** | Developers → Webhooks → (after creating) | `whsec_` | Webhook verification |
| **Connect Client ID** | Connect → Settings | `ca_` | OAuth for organizers |

---

## 📝 NEXT STEPS (I'll Do This For You)

Once you have the keys, I will:

1. ✅ Add them to `.env.local`
2. ✅ Update docker-compose.yml with the keys
3. ✅ Restart the Docker container
4. ✅ Test the Stripe integration
5. ✅ Verify split payments work

---

## 🧪 TEST CARDS (For Development)

Once Stripe is set up, you can test with these cards:

### Successful Payment:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any ZIP code (e.g., 12345)

### Declined Payment:
- **Card:** `4000 0000 0000 0002`
- Tests error handling

### Requires Authentication (3D Secure):
- **Card:** `4000 0025 0000 3155`
- Tests 3D Secure flow

### More Test Cards:
https://stripe.com/docs/testing#cards

---

## 🔧 WHAT I'LL CONFIGURE

### 1. Environment Variables (.env.local)
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### 2. Stripe Connect (For Split Payments)
Your app already has the code for:
- Platform fee: 3.7% + $1.79
- Auto-split to organizer's account
- Organizer onboarding flow

### 3. Webhook Setup (Optional - Later)
- Receive payment notifications
- Handle disputes/refunds
- Update order status automatically

---

## 📊 HOW SPLIT PAYMENTS WORK

### Current Implementation (Already Coded):

```
Customer pays $100 for tickets
    ↓
Stripe processes payment
    ↓
Platform fee: $5.49 (3.7% + $1.79)
    ↓
Organizer gets: $94.51
    ↓
Money splits automatically
```

**This is already implemented in your code:**
- File: `app/api/stripe/create-payment-intent/route.ts`
- Uses: `application_fee_amount` + `transfer_data`

---

## ✅ VERIFICATION CHECKLIST

After setup, we'll verify:

- [ ] Stripe Dashboard accessible
- [ ] Test mode enabled
- [ ] API keys obtained
- [ ] Keys added to .env.local
- [ ] Docker container restarted
- [ ] Stripe payment form loads
- [ ] Test payment succeeds
- [ ] Split payment configured
- [ ] Webhook endpoint ready (optional)

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "Invalid API key"
- **Solution:** Make sure you're using the TEST key (starts with `sk_test_`)
- Check for extra spaces when copying

### Issue: "Stripe not initialized"
- **Solution:** Restart Docker container after adding keys
- Verify keys are in .env.local (not .env)

### Issue: "Payment fails"
- **Solution:** Confirm you're in Test Mode
- Use test card numbers (4242...)
- Check browser console for errors

### Issue: "Connect not working"
- **Solution:** Enable Stripe Connect in Dashboard
- Complete business profile in Settings

---

## 📱 READY TO PROCEED?

**Please provide me with:**

1. Your Stripe **Secret Key** (sk_test_...)
2. Your Stripe **Publishable Key** (pk_test_...)

**You can:**
- Paste them here (I'll add to .env.local securely)
- Or tell me you have them ready and I'll guide you through adding them

**Once I have the keys, I'll:**
1. Add them to your environment files
2. Restart the Docker container
3. Test a payment
4. Verify everything works
5. Show you the working Stripe checkout!

---

## 🔐 SECURITY REMINDERS

- ✅ Test keys are safe to use for development
- ✅ They don't process real money
- ✅ Switch to live keys when going to production
- ⚠️ Never commit secret keys to git (already in .gitignore)
- ⚠️ Never share secret keys publicly

---

**Ready! Paste your Stripe keys when you have them, or let me know if you need help getting them!** 🚀
