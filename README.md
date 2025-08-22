# CopyCat.ai - Whop App

A modern, beginner-friendly Whop application built with Next.js and the official Whop SDK.

## ✨ Features

- **Dark Theme UI** - Beautiful black background with orange accents
- **Whop Authentication** - Built-in user authentication and management
- **Modern Design** - Clean, minimalist interface using Tailwind CSS
- **Easy to Expand** - Well-structured codebase for future development
- **TypeScript Support** - Full type safety and IntelliSense

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the `env.example` file to `.env` and fill in your Whop credentials:

```bash
cp env.example .env
```

Then edit `.env` with your actual values from the [Whop Dashboard](https://whop.com/dashboard):

```env
# Required: Your Whop App API Key
WHOP_API_KEY=your_actual_api_key_here

# Required: Your Whop App ID  
NEXT_PUBLIC_WHOP_APP_ID=your_actual_app_id_here

# Required: Your Whop Company ID
NEXT_PUBLIC_WHOP_COMPANY_ID=your_actual_company_id_here

# Required: Agent User ID for API requests
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_actual_agent_user_id_here
```

### 3. Run the Development Server

```bash
pnpm dev
```

**Important**: Always use `pnpm dev` (not `next dev`) to run the Whop proxy server.

### 4. Access Your App

- Open the Whop dashboard
- Navigate to your app
- The app will run in the Whop iframe with proper authentication

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── discover/          # Discover page
│   ├── experiences/       # Experiences page
│   ├── layout.tsx         # Root layout with WhopApp wrapper
│   ├── page.tsx           # Main landing page
│   └── globals.css        # Global styles
├── lib/                   # Utility functions
│   └── whop-sdk.ts       # Whop SDK configuration
├── env.example            # Environment variables template
└── package.json           # Dependencies and scripts
```

## 🔧 Key Components

### WhopApp Wrapper
The `WhopApp` component in `app/layout.tsx` provides authentication context throughout your app.

### Whop SDK
The `lib/whop-sdk.ts` file configures the Whop server SDK for API calls.

### Authentication
User authentication is handled automatically by the Whop SDK. Users are authenticated when they access your app through the Whop dashboard.

## 🎨 Customization

### Theme Colors
The app uses a dark theme with orange accents:
- Background: `bg-black`
- Cards: `bg-gray-900` with `border-gray-800`
- Accents: `bg-orange-500`, `text-orange-400`
- Text: `text-white`, `text-gray-300`

### Adding New Pages
1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. The page will automatically inherit the WhopApp wrapper and authentication

### API Routes
Add new API endpoints in `app/api/` directory. They'll have access to the Whop SDK for authenticated requests.

## 📚 Resources

- [Whop Developer Documentation](https://dev.whop.com)
- [Whop Dashboard](https://whop.com/dashboard)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Support

Need help? Check out the [Whop Documentation](https://dev.whop.com) or reach out to the Whop developer community.

## 📝 License

This project is based on the official Whop Next.js template.
