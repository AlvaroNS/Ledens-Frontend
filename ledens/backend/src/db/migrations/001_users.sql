-- Users for email/password and social (Google, Microsoft, Apple) login.
-- password_hash is NULL for accounts created through an OAuth provider.
CREATE TABLE users (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL,
  email_verified  boolean     NOT NULL DEFAULT false,
  password_hash   text,
  provider        text        NOT NULL DEFAULT 'local'
                              CHECK (provider IN ('local', 'google', 'microsoft', 'apple')),
  provider_id     text,
  name            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_login_at   timestamptz,
  CHECK (provider = 'local' OR provider_id IS NOT NULL)
);

-- One account per email, case-insensitive.
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

-- One account per provider identity.
CREATE UNIQUE INDEX users_provider_identity_key
  ON users (provider, provider_id) WHERE provider_id IS NOT NULL;
