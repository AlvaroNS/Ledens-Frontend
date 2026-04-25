import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/app.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Guard: if the key is missing (e.g. CI build without the env var set) render
// the app without ClerkProvider so the site stays up. Header falls back to
// plain Link buttons to /auth in this mode.
if (PUBLISHABLE_KEY) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[Ledens] VITE_CLERK_PUBLISHABLE_KEY is not set. ' +
    'Auth buttons will link to /auth. Set the key and rebuild to enable Clerk.'
  );
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
