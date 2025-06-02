import bcrypt from 'bcryptjs';
import { pool } from '../utils/database';

export interface IUser {
  id: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  static async create(userData: {
    username: string;
    email: string;
    password?: string;
    googleId?: string;
    avatar?: string;
  }): Promise<IUser> {
    const { username, email, password, googleId, avatar } = userData;
      // Hash password if provided
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const query = `
      INSERT INTO users (username, email, password, google_id, avatar)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, google_id as "googleId", avatar, is_email_verified as "isEmailVerified", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [username, email, hashedPassword, googleId, avatar];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const query = `
      SELECT id, username, email, password, google_id as "googleId", avatar, 
             is_email_verified as "isEmailVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<IUser | null> {
    const query = `
      SELECT id, username, email, password, google_id as "googleId", avatar, 
             is_email_verified as "isEmailVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<IUser | null> {
    const query = `
      SELECT id, username, email, password, google_id as "googleId", avatar, 
             is_email_verified as "isEmailVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByGoogleId(googleId: string): Promise<IUser | null> {
    const query = `
      SELECT id, username, email, password, google_id as "googleId", avatar, 
             is_email_verified as "isEmailVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE google_id = $1
    `;
    
    const result = await pool.query(query, [googleId]);
    return result.rows[0] || null;
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!hashedPassword) return false;
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateById(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database columns
        const dbKey = key === 'isEmailVerified' ? 'is_email_verified' : 
                     key === 'googleId' ? 'google_id' : key;
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, google_id as "googleId", avatar, 
                is_email_verified as "isEmailVerified", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}
