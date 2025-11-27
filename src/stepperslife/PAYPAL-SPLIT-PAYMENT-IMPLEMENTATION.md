# PayPal Split Payment Implementation Status

## 🎯 Goal
Enable organizers to choose **Stripe OR PayPal** for CREDIT_CARD split payment model

---

## ✅ COMPLETED (Phases 1-2)

### Phase 1: Database Schema Updates
**Status:** ✅ Complete

**Files Modified:**
- `convex/schema.ts`

**Changes Made:**

1. **Users Table** - Added PayPal onboarding tracking:
   ```typescript
   paypalMerchantId: v.optional(v.string()),
   paypalAccountSetupComplete: v.optional(v.boolean()),
   paypalPartnerReferralId: v.optional(v.string()),  // NEW
   paypalOnboardingStatus: v.optional(v.string()),   // NEW
   ```

2. **Event Payment Config Table** - Added processor selection:
   ```typescript
   // For CREDIT_CARD model: Which processor handles split payments
   merchantProcessor: v.optional(
     v.union(
       v.literal("STRIPE"),
       v.literal("PAYPAL")
     )
   ),
   ```

### Phase 2: Convex Mutations & Queries
**Status:** ✅ Complete

**Files Modified:**
- `convex/users/mutations.ts`
- `convex/users/queries.ts`

**New Mutations:**

1. **`connectPaypalAccount`** - Updated to track Partner Referrals:
   ```typescript
   // Saves merchant ID and referral ID
   // Marks setup as incomplete until verified
   // Sets onboarding status to PENDING
   ```

2. **`markPayPalAccountComplete`** - NEW:
   ```typescript
   // Called after successful PayPal onboarding verification
   // Marks paypalAccountSetupComplete: true
   // Enables acceptsPaypalPayments: true
   // Sets onboardingStatus: "COMPLETED"
   ```

3. **`updatePayPalAccountStatus`** - NEW:
   ```typescript
   // Called from webhooks or status checks
   // Updates onboarding status and setup completion
   ```

**New Queries:**

1. **`getPayPalAccount`** - NEW:
   ```typescript
   // Returns PayPal account info for current user:
   // - paypalMerchantId
   // - paypalAccountSetupComplete
   // - paypalPartnerReferralId
   // - paypalOnboardingStatus
   // - acceptsPaypalPayments
   ```

---

## 🚧 PENDING (Remaining Work)

### ⚠️ CRITICAL BLOCKER

**PayPal Partner Status Application**
- **Status:** Must apply for PayPal Partner/Marketplace program
- **Link:** https://www.paypal.com/webapps/mpp/partner-program
- **Timeline:** 1-2 weeks for approval
- **Requirement:** Cannot implement split payments without Partner API access

**Action Required:**
1. Submit PayPal Partner application
2. Provide business details
3. Wait for approval
4. Obtain Partner credentials:
   - Partner Merchant ID
   - Partner BN Code
   - Partner Attribution ID

---

### Phase 3: PayPal Onboarding API Routes
**Status:** ⏳ Pending Partner Approval

**Files to Create:**

1. `/app/api/paypal/create-partner-referral/route.ts`
   - Call PayPal Partner Referrals API v2
   - Create referral with PARTNER_FEE capability
   - Return signup URL for organizer
   - Save referral ID via `connectPaypalAccount` mutation

2. `/app/api/paypal/account-status/route.ts`
   - Verify PayPal merchant account status
   - Check for required capabilities (PAYMENT, PARTNER_FEE)
   - Return onboarding completion status

3. `/app/api/paypal/onboarding-webhook/route.ts`
   - Handle PayPal Partner onboarding events
   - Update user status via `updatePayPalAccountStatus`

**Partner Referrals API Structure:**
```typescript
POST https://api.paypal.com/v2/customer/partner-referrals
{
  "email": "organizer@example.com",
  "preferred_language_code": "en-US",
  "tracking_id": "user_xyz123",
  "operations": [{
    "operation": "API_INTEGRATION",
    "api_integration_preference": {
      "rest_api_integration": {
        "integration_method": "PAYPAL",
        "integration_type": "THIRD_PARTY",
        "third_party_details": {
          "features": ["PAYMENT", "PARTNER_FEE"]
        }
      }
    }
  }],
  "products": ["EXPRESS_CHECKOUT"],
  "legal_consents": [{
    "type": "SHARE_DATA_CONSENT",
    "granted": true
  }]
}
```

---

### Phase 4: PayPal Onboarding UI Pages
**Status:** ⏳ Pending

**Files to Create:**

1. `/app/organizer/paypal-onboarding/return/page.tsx`
   - Mirror Stripe Connect return page
   - Verify PayPal account status
   - Mark account complete via `markPayPalAccountComplete`
   - Redirect to settings with success message

2. `/app/organizer/paypal-onboarding/refresh/page.tsx`
   - Handle onboarding resume/retry
   - Generate new Partner Referral link
   - Redirect to PayPal for continued onboarding

---

### Phase 5: PayPal Split Payment Logic
**Status:** ⏳ Pending

**Files to Update:**

1. `/app/api/paypal/create-order/route.ts`
   - Add multiparty payment support
   - Include platform_fees in order payload
   - Structure:
   ```typescript
   {
     "purchase_units": [{
       "payee": {
         "merchant_id": "ORGANIZER_MERCHANT_ID"
       },
       "amount": {
         "currency_code": "USD",
         "value": "25.00"
       },
       "payment_instruction": {
         "platform_fees": [{
           "amount": {
             "currency_code": "USD",
             "value": "3.75"  // 3.7% + $1.79
           },
           "payee": {
             "merchant_id": "PLATFORM_MERCHANT_ID"
           }
         }]
       }
     }]
   }
   ```

2. `/app/api/paypal/capture-order/route.ts`
   - Handle platform fee capture
   - Verify correct amounts
   - Update order status in Convex

3. `/components/checkout/PayPalPayment.tsx`
   - Add `isSplitPayment` prop
   - Use multiparty order endpoint for CREDIT_CARD events
   - Show platform fee breakdown

---

### Phase 6: Payment Config Updates
**Status:** ⏳ Pending

**Files to Update:**

1. `/convex/paymentConfig/mutations.ts`
   - Update `selectCreditCardModel` mutation:
   ```typescript
   export const selectCreditCardModel = mutation({
     args: {
       eventId: v.id("events"),
       merchantProcessor: v.union(v.literal("STRIPE"), v.literal("PAYPAL")),
       charityDiscount: v.optional(v.boolean()),
     },
     handler: async (ctx, args) => {
       // Validate based on processor choice
       if (args.merchantProcessor === "STRIPE") {
         // Check Stripe Connect setup
       } else if (args.merchantProcessor === "PAYPAL") {
         // Check PayPal Partner setup
       }

       // Create config with selected processor
       await ctx.db.insert("eventPaymentConfig", {
         paymentModel: "CREDIT_CARD",
         merchantProcessor: args.merchantProcessor,
         customerPaymentMethods: [args.merchantProcessor],
         // ... processor-specific IDs
       });
     }
   });
   ```

---

### Phase 7: Checkout Page Updates
**Status:** ⏳ Pending

**Files to Update:**

1. `/app/events/[eventId]/checkout/page.tsx`
   - Detect `merchantProcessor` from payment config
   - Render appropriate checkout component:
   ```typescript
   const merchantProcessor = paymentConfig?.merchantProcessor;
   const useStripePayment = merchantProcessor === "STRIPE";
   const usePayPalPayment = merchantProcessor === "PAYPAL";

   {useStripePayment && <StripeCheckout />}
   {usePayPalPayment && <PayPalPayment isSplitPayment={true} />}
   ```

---

### Phase 8: Settings Page Updates
**Status:** ⏳ Pending

**Files to Update:**

1. `/app/organizer/settings/page.tsx`
   - Add "Connect PayPal Account" section
   - Mirror Stripe Connect UI pattern
   - Show three states:
     - Not Connected: "Connect PayPal Account" button
     - Connected but Incomplete: "Complete Setup" button
     - Setup Complete: "Update Account" and "Disconnect" buttons

---

### Phase 9: Payment Setup Page Updates
**Status:** ⏳ Pending

**Files to Update:**

1. `/app/organizer/events/[eventId]/payment-setup/page.tsx`
   - Add processor selection for CREDIT_CARD model
   - Show requirements for each processor:
     - Stripe: Requires Stripe Connect
     - PayPal: Requires PayPal Partner account
   - Disable options if not connected

---

### Phase 10: Testing
**Status:** ⏳ Pending

**Test Files to Create:**

1. `/tests/paypal-onboarding.spec.ts`
   - Test PayPal onboarding flow end-to-end
   - Verify account status updates
   - Test error handling

2. `/tests/paypal-split-payments.spec.ts`
   - Test multiparty payment creation
   - Verify platform fee deduction
   - Test payment capture

3. Update `/tests/payment-integration.spec.ts`
   - Add PayPal split payment scenarios
   - Test processor selection
   - Compare Stripe vs PayPal fees

**10 Test Scenarios:**
1. ✅ PayPal onboarding flow (connect → verify → complete)
2. ✅ Create CREDIT_CARD event with PayPal processor
3. ✅ Customer purchases ticket via PayPal split payment
4. ✅ Verify platform fee deducted correctly ($3.75 for $25 ticket)
5. ✅ Verify organizer receives correct amount ($21.25)
6. ✅ Test PayPal webhook events
7. ✅ Error handling (failed onboarding, capture failures)
8. ✅ Switch from Stripe to PayPal for new event
9. ✅ Fee calculation accuracy (Stripe vs PayPal identical net)
10. ✅ Edge cases (disconnected account, expired onboarding)

---

### Phase 11: Documentation
**Status:** ⏳ Pending

**Files to Create/Update:**

1. `PAYPAL-SETUP-GUIDE.md`
   - How to apply for PayPal Partner status
   - How to connect PayPal account
   - Onboarding step-by-step guide

2. `PAYPAL-SPLIT-PAYMENT-API.md`
   - Technical documentation for developers
   - API endpoint reference
   - Multiparty payment examples

3. Update `PAYMENT-SYSTEM.md`
   - Add PayPal split payment section
   - Document processor selection
   - Include fee comparison table

---

## 🔑 Key Technical Details

### Stripe vs PayPal Fee Difference

**Important:** PayPal and Stripe handle processing fees differently

**Stripe:**
- Platform pays processing fees (2.9% + $0.30)
- Platform receives payment first
- Transfers to organizer minus platform fee

**PayPal:**
- Organizer pays processing fees (2.9% + $0.30)
- Organizer receives payment first
- Platform fee deducted via platform_fees

**Example ($25 ticket):**
```
Customer pays: $25.00

STRIPE:
├─ Payment to platform: $25.00
├─ Stripe fee (from platform): -$0.73
├─ Platform keeps: $3.75
└─ Organizer receives: $20.52

PAYPAL:
├─ Payment to organizer: $25.00
├─ PayPal fee (from organizer): -$0.73
├─ Platform fee deducted: -$3.75
└─ Organizer net: $20.52

Result: Organizer nets $20.52 in both cases ✅
```

---

## 📦 Dependencies

**Required:**
```bash
npm install @paypal/checkout-server-sdk
```

**Environment Variables (After Partner Approval):**
```env
# Existing
PAYPAL_CLIENT_ID=AWcmEjsKDeNUzvVQJyvc...
PAYPAL_SECRET_KEY=EOKT1tTTaBV8EOx...
PAYPAL_WEBHOOK_ID=5NK114525U789563D
PAYPAL_ENVIRONMENT=sandbox

# NEW - From Partner Approval
PAYPAL_PARTNER_MERCHANT_ID=<platform_merchant_id>
PAYPAL_PARTNER_BN_CODE=<partner_bn_code>
PAYPAL_PARTNER_ATTRIBUTION_ID=<partner_attribution>
```

---

## 📊 Progress Summary

**Completed:**
- ✅ Database schema updates (Phase 1)
- ✅ Convex mutations and queries (Phase 2)

**Pending (requires Partner approval):**
- ⏳ PayPal onboarding API routes (Phase 3)
- ⏳ PayPal onboarding UI pages (Phase 4)
- ⏳ PayPal split payment logic (Phase 5)
- ⏳ Payment config updates (Phase 6)
- ⏳ Checkout page updates (Phase 7)
- ⏳ Settings page updates (Phase 8)
- ⏳ Payment setup page updates (Phase 9)
- ⏳ Testing (Phase 10)
- ⏳ Documentation (Phase 11)

**Blocker:**
- ❌ PayPal Partner status not yet approved

---

## 🚀 Next Steps

### Immediate Actions:

1. **Apply for PayPal Partner Program**
   - Go to: https://www.paypal.com/webapps/mpp/partner-program
   - Submit application with business details
   - Wait 1-2 weeks for approval

2. **While Waiting for Approval:**
   - Install PayPal SDK: `npm install @paypal/checkout-server-sdk`
   - Set up PayPal sandbox Partner account for testing
   - Review PayPal Partner documentation

3. **After Approval:**
   - Complete Phase 3-11 implementation
   - Run comprehensive tests
   - Deploy to production

---

## ⚠️ Important Notes

1. **Cannot proceed with split payments without Partner status**
   - Current PayPal integration only supports basic merchant payments
   - Partner Referrals API requires Partner approval
   - Multiparty payments require Partner permissions

2. **Testing**
   - Sandbox testing requires Partner sandbox account
   - Production requires Partner production account
   - Must test all 10 scenarios before launch

3. **Migration**
   - Existing CREDIT_CARD events will default to STRIPE
   - Organizers can choose PayPal for new events after setup
   - No automatic migration of processor choice

---

## 📈 Success Criteria

- [ ] PayPal Partner status approved
- [ ] All API routes created and tested
- [ ] UI pages functional
- [ ] Organizer can connect PayPal account
- [ ] Organizer can select PayPal for CREDIT_CARD events
- [ ] Customer can purchase with PayPal split payment
- [ ] Platform fee correctly deducted
- [ ] All 10 test scenarios pass
- [ ] Documentation complete
- [ ] Production deployment successful

---

**Last Updated:** Current session
**Status:** Foundation complete, awaiting Partner approval
