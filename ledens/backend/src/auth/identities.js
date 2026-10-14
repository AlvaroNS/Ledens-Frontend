import { getPool } from '../db/pool.js';

/**
 * Finds the user behind a verified social login, creating one — or linking
 * the identity to an existing *already-verified* account with the same
 * email — if there isn't one yet. Shared by Google (#11) and, later,
 * Microsoft (#12) and Apple (#13), so each provider only needs its own
 * "get me a verified profile" code, not its own copy of this logic.
 *
 * Security note: `users.email` is unique, so "create a second account" is
 * never an option when an email is already taken — the real choice is
 * between linking and reclaiming. Password registration (#10) never proves
 * anyone owns the email they typed in, so an attacker could pre-register
 * someone else's email. A later *verified* social login on that same email
 * IS proof of ownership — stronger than whatever unverified password sits
 * there — so it reclaims the account: marks it verified, clears the
 * unproven password, and kills any session already open under it. An
 * already-verified account (proven by an earlier social login) is instead
 * a safe, ordinary link — that's the case auth_identities (#9) was built
 * for in the first place.
 */
export async function findOrCreateUserFromIdentity({ provider, providerUserId, email, emailVerified, name }) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT u.id, u.email, u.name, u.created_at
         FROM auth_identities ai JOIN users u ON u.id = ai.user_id
        WHERE ai.provider = $1 AND ai.provider_user_id = $2`,
      [provider, providerUserId],
    );
    if (existing.rows[0]) {
      await client.query('COMMIT');
      return existing.rows[0];
    }

    let user;
    if (emailVerified) {
      const byEmail = await client.query(
        'SELECT id, email, name, created_at, email_verified FROM users WHERE lower(email) = lower($1)',
        [email],
      );
      const found = byEmail.rows[0];
      if (found?.email_verified) {
        user = found;
      } else if (found) {
        const reclaimed = await client.query(
          `UPDATE users SET email_verified = true, password_hash = NULL, updated_at = now()
            WHERE id = $1 RETURNING id, email, name, created_at`,
          [found.id],
        );
        await client.query('DELETE FROM sessions WHERE user_id = $1', [found.id]);
        user = reclaimed.rows[0];
      }
    }

    if (!user) {
      const created = await client.query(
        'INSERT INTO users (email, name, password_hash, email_verified) VALUES ($1, $2, NULL, $3) RETURNING id, email, name, created_at',
        [email, name, emailVerified],
      );
      user = created.rows[0];
    }

    await client.query(
      'INSERT INTO auth_identities (user_id, provider, provider_user_id) VALUES ($1, $2, $3)',
      [user.id, provider, providerUserId],
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
