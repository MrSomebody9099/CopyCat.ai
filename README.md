# CopyCat AI 🐾

All-in-one AI copywriter that helps you create amazing content with the power of AI.

## Features

- AI-powered copy generation
- Whop integration for subscription management
- Dynamic experience rendering
- Chat-based interface
- Personalized AI responses

## Subscription Tiers

### Free Tier
- 5 chats per conversation
- 3 conversations
- 15 chats per user per day
- 1 day memory retention

### Paid Tier ($9/week)
- 10 chats per conversation
- 5 conversations
- 50 chats per user per day
- 30 days memory retention
- Priority support

### Agency/Business (Coming Soon)
- Unlimited chats per conversation
- Unlimited conversations
- Unlimited chats per user per day
- 1 year memory retention
- Custom solutions
- Dedicated support

## Whop Integration

This app is designed to work within the Whop ecosystem. To set up subscriptions:

1. Create an access pass in your Whop dashboard
2. Create a pricing plan for the access pass
3. Update the product ID and plan ID in your environment variables:
   - `NEXT_PUBLIC_PREMIUM_PRODUCT_ID` - Your access pass ID
   - `NEXT_PUBLIC_PREMIUM_PLAN_ID` - Your pricing plan ID

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Whop Integration
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id

# Subscription Product Information
NEXT_PUBLIC_PREMIUM_PRODUCT_ID=prod_AJiW8eRocqzjg
NEXT_PUBLIC_PREMIUM_PLAN_ID=plan_uGs96XPxv08dR

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables (see above)

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Whop Integration Details

The app uses the Whop iframe SDK for authentication and in-app purchases:

1. **Authentication**: The app automatically handles user authentication through Whop's iframe SDK
2. **Subscription Management**: Users can upgrade their plans using the capsule-shaped button with multi-color stars
3. **In-App Purchases**: The subscription button uses Whop's `inAppPurchase` function to process payments
4. **User Information**: User profile information is retrieved through the Whop API

## Deployment

Deploy to Vercel or any Next.js compatible hosting platform.

Make sure to set all environment variables in your hosting platform's dashboard.

## Learn More

- [Whop Developer Documentation](https://docs.whop.com)
- [Next.js Documentation](https://nextjs.org/docs)