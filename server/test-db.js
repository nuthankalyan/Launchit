// Simple database connection test script
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://nuthan:AgeMQtnJQ6h0OBEixaBd4A@nuthancluster-11900.j77.aws-ap-south-1.cockroachlabs.cloud:26257/Launchit?sslmode=verify-full',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔄 Testing CockroachDB connection...');
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to CockroachDB!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('📊 Database info:');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   Database version:', result.rows[0].db_version);
    
    // Check if our users table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Users table exists');
      
      // Check table structure
      const columnInfo = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Users table structure:');
      columnInfo.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('⚠️  Users table does not exist yet');
    }
    
    client.release();
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure your connection string is correct and the database is accessible');
  } finally {
    await pool.end();
  }
}

testConnection();
