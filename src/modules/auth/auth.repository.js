import { query } from '../../config/db.js';

function runQuery(client, text, params = []) {
  if (client) {
    return client.query(text, params);
  }

  return query(text, params);
}

export async function findUserByEmail(email, client = null) {
  const result = await runQuery(
    client,
    `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export async function findUserById(id, client = null) {
  const result = await runQuery(
    client,
    `
      SELECT id, name, email, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createUser({ name, email, passwordHash }, client = null) {
  const result = await runQuery(
    client,
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role, is_active, created_at, updated_at
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

export async function createRefreshToken(
  { userId, tokenHash, expiresAt },
  client = null
) {
  const result = await runQuery(
    client,
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at
    `,
    [userId, tokenHash, expiresAt]
  );

  return result.rows[0];
}

export async function findValidRefreshTokenByHash(tokenHash, client = null) {
  const result = await runQuery(
    client,
    `
      SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
}

export async function revokeRefreshTokenByHash(tokenHash, client = null) {
  await runQuery(
    client,
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}