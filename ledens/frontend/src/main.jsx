import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/app.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // Surface a clear error early rather than letting Clerk throw a cryptic one.
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env.local and paste your Clerk publishable key (https://dashboard.clerk.com).'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
