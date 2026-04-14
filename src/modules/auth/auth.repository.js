import { query } from '../../config/db.js';

export async function findUserByEmail(email) {
  const result = await query(
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

export async function createUser({ name, email, passwordHash }) {
  const result = await query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role, is_active, created_at, updated_at
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}