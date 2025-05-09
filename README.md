# Cover Letter Maker

A Next.js application that helps users create professional cover letters using AI.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## Environment Setup

1. Clone the repository:
```bash
git clone <your-repository-url>
cd cover_letter_maker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google AI (Gemini) Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project "resumemate-dn57u"
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider
4. Configure Authorized Domains:
   - Go to Authentication > Settings
   - Add the following domains:
     - `localhost:9002`
     - `127.0.0.1:9002`
     - Your production domain (if any)

## Google AI (Gemini) Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (ID: 337137256276)
3. Enable the Gemini API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gemini API" or "Generative Language API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - Add it to your `.env.local` file as `GOOGLE_AI_API_KEY`
5. Configure API Key Restrictions (Optional but recommended):
   - In Credentials, click on your API key
   - Under "Application restrictions", choose appropriate restrictions
   - Under "API restrictions", select "Restrict key"
   - Select "Gemini API" from the list

## Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:9002`

## Project Structure

```
cover_letter_maker/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   │   ├── firebase.ts  # Firebase configuration
│   │   └── auth.ts      # Authentication utilities
│   └── styles/          # Global styles
├── public/              # Static files
├── .env.local          # Environment variables (create this)
└── package.json        # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Troubleshooting

### Firebase Authentication Issues
- Ensure all environment variables are correctly set in `.env.local`
- Verify that the authorized domains are properly configured in Firebase Console
- Check that the authentication providers are enabled

### Google AI (Gemini) Issues
- Verify that the Gemini API is enabled in Google Cloud Console
- Ensure your API key is valid and has proper permissions
- Check that billing is enabled for your Google Cloud project
- Verify the API key is correctly set in `.env.local`

### Development Server Issues
- Clear the `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall dependencies:
  ```bash
  rm -rf node_modules
  npm install
  # or
  yarn install
  ```
- Restart the development server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
