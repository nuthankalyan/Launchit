import { pool } from '../utils/database';

export interface ILaunchPage {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tagline?: string;
  colorPalette?: string;
  theme?: string;
  htmlContent: string;
  status: 'generating' | 'generated' | 'error';
  publishSlug?: string;
  isPublished?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class LaunchPage {  static async create(pageData: {
    userId: string;
    name: string;
    description?: string;
    tagline?: string;
    colorPalette?: string;
    theme?: string;
    htmlContent: string;
    status?: 'generating' | 'generated' | 'error';
  }): Promise<ILaunchPage> {
    const { userId, name, description, tagline, colorPalette, theme, htmlContent, status = 'generated' } = pageData;

    const query = `
      INSERT INTO launch_pages (user_id, name, description, tagline, color_palette, theme, html_content, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id as "userId", name, description, tagline, color_palette as "colorPalette", 
                theme, html_content as "htmlContent", status, publish_slug as "publishSlug", 
                is_published as "isPublished", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [userId, name, description, tagline, colorPalette, theme, htmlContent, status];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }
  static async findById(id: string): Promise<ILaunchPage | null> {
    const query = `
      SELECT id, user_id as "userId", name, description, tagline, color_palette as "colorPalette", 
             theme, html_content as "htmlContent", status, publish_slug as "publishSlug", 
             is_published as "isPublished", created_at as "createdAt", updated_at as "updatedAt"
      FROM launch_pages 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  static async findByUserId(userId: string): Promise<ILaunchPage[]> {
    const query = `
      SELECT id, user_id as "userId", name, description, tagline, color_palette as "colorPalette",
             theme, html_content as "htmlContent", status, publish_slug as "publishSlug", 
             is_published as "isPublished", created_at as "createdAt", updated_at as "updatedAt"
      FROM launch_pages 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async updateById(id: string, updates: Partial<Omit<ILaunchPage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<ILaunchPage | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database columns
        const dbKey = key === 'htmlContent' ? 'html_content' : key;
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
      UPDATE launch_pages 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, user_id as "userId", name, description, tagline, html_content as "htmlContent", 
                status, publish_slug as "publishSlug", is_published as "isPublished",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM launch_pages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async findBySlug(slug: string): Promise<ILaunchPage | null> {
    const query = `
      SELECT id, user_id as "userId", name, description, tagline, html_content as "htmlContent", 
             status, publish_slug as "publishSlug", is_published as "isPublished",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM launch_pages 
      WHERE publish_slug = $1 AND is_published = true
    `;
    
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
  }

  static async publishBySlug(id: string, slug: string): Promise<ILaunchPage | null> {    // First check if the slug already exists
    const checkQuery = `SELECT id FROM launch_pages WHERE publish_slug = $1`;
    const checkResult = await pool.query(checkQuery, [slug]);
    
    if (checkResult.rowCount && checkResult.rowCount > 0) {
      throw new Error('This URL is already taken. Please choose a different one.');
    }
    
    // If slug is unique, update the page to publish it
    const query = `
      UPDATE launch_pages 
      SET publish_slug = $1, is_published = true, updated_at = NOW()
      WHERE id = $2
      RETURNING id, user_id as "userId", name, description, tagline, html_content as "htmlContent", 
                status, publish_slug as "publishSlug", is_published as "isPublished",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [slug, id]);
    return result.rows[0] || null;
  }
}
