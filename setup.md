# 🚀 Quick Setup Guide

## Step 1: Get Your Whop Credentials

1. Go to [Whop Dashboard](https://whop.com/dashboard)
2. Navigate to Developer → Apps
3. Create a new app or select an existing one
4. Copy these values:
   - **App ID**
   - **API Key**
   - **Company ID**
   - **Agent User ID** (create one if you don't have it)

## Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and paste your actual values:
   ```env
   WHOP_API_KEY=your_actual_api_key
   NEXT_PUBLIC_WHOP_APP_ID=your_actual_app_id
   NEXT_PUBLIC_WHOP_COMPANY_ID=your_actual_company_id
   NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_actual_agent_user_id
   ```

## Step 3: Run the App

1. Install dependencies (already done):
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. **Important**: Don't open `http://localhost:3000` directly!
   - Go to your Whop dashboard
   - Navigate to your app
   - The app will run in the Whop iframe with proper authentication

## Step 4: Test Your App

- The app should show a dark theme with orange accents
- You should see your environment variables displayed (in development mode)
- The installation link should work if your environment variables are correct

## 🎯 Next Steps

- Customize the UI in `app/page.tsx`
- Add new pages in the `app/` directory
- Create API routes in `app/api/`
- Use the Whop SDK in `lib/whop-sdk.ts` for authenticated requests

## ❓ Need Help?

- Check the [Whop Documentation](https://dev.whop.com)
- Review the main [README.md](README.md) for detailed information
- Ensure you're using `pnpm dev` (not `next dev`) to run the Whop proxy
