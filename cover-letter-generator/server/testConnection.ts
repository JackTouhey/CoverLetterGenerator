import pool from './utils/connectionPool'

export async function testConnection() {
  try {
    console.log('Attempting connection to db');
    const result = await pool.query('SELECT NOW()');

    console.log('Connection successful!');
    console.log('Server Time:', result.rows[0].now);
  } catch (error) {
    console.error('Connection failed:', (error as Error).message);
  } finally {
    await pool.end();
  }
}
