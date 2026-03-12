# Stripe Setup Guide for ArtistOS

Follow these steps to enable subscription payments in ArtistOS.

## Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the business verification (you can use test mode first)
3. Navigate to **Developers > API Keys**
4. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
5. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Create Products & Prices

In your Stripe Dashboard:

1. Go to **Products** (or **Product Catalog**)
2. Create **Product 1: ArtistOS Pro**
   - Name: `ArtistOS Pro`
   - Price: `$19.00 / month` (recurring)
   - Copy the **Price ID** (starts with `price_`)
3. Create **Product 2: ArtistOS Studio**
   - Name: `ArtistOS Studio`
   - Price: `$49.00 / month` (recurring)
   - Copy the **Price ID** (starts with `price_`)

## Step 3: Add Environment Variables

### Frontend (Vercel)

In your Vercel project settings, add:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Supabase Edge Functions

In your Supabase Dashboard > Edge Functions > Secrets, add:

```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_STUDIO_PRICE_ID=price_your_studio_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 4: Deploy Edge Functions

### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref vdrqiugwnztzqvfieeip

# Deploy functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session
```

### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard > Edge Functions
2. Create new function `create-checkout`
3. Paste the code from `supabase/functions/create-checkout/index.ts`
4. Repeat for `stripe-webhook` and `create-portal-session`

## Step 5: Set Up Webhook

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. URL: `https://vdrqiugwnztzqvfieeip.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it as `STRIPE_WEBHOOK_SECRET` in your Supabase Edge Function secrets

## Step 6: Configure Customer Portal

1. In Stripe Dashboard, go to **Settings > Billing > Customer Portal**
2. Enable the customer portal
3. Configure allowed actions:
   - Allow customers to update subscriptions
   - Allow customers to cancel subscriptions
4. Save changes

## Step 7: Update Plan Price IDs (Optional)

After creating your Stripe products, update the price IDs in `src/lib/plans.js`:

```javascript
pro: {
  ...
  stripePriceId: "price_your_pro_id_here",
},
studio: {
  ...
  stripePriceId: "price_your_studio_id_here",
},
```

## Step 8: Run SQL Migration

Run `phase12-features.sql` in Supabase SQL Editor to add the required columns to the profiles table.

## Testing

1. Use Stripe test mode (test API keys)
2. Test card number: `4242 4242 4242 4242`
3. Any future expiry date and any CVC
4. Complete a test checkout and verify:
   - Profile `plan` field updates to `pro` or `studio`
   - `subscription_id` is populated
   - `subscription_status` is `active`
   - Settings > Billing shows correct plan info

## Going Live

1. Switch to live API keys in both Vercel and Supabase
2. Create live products/prices in Stripe (or copy from test mode)
3. Update the webhook endpoint to use live signing secret
4. Test with a real card
