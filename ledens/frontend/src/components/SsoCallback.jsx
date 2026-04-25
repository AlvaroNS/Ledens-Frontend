import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

/**
 * Handles the redirect back from an OAuth provider (Google, Microsoft, etc.).
 * Clerk resolves the session automatically and redirects to the root URL.
 * Rendered at /sso-callback — never visible to the user for more than a moment.
 */
export default function SsoCallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#FBFAF7',
      fontFamily: 'var(--font-sans)', color: 'var(--ledens-navy)',
    }}>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
