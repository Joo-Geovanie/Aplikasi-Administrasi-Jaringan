import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'kelompok19_user',
  host: 'localhost',
  database: 'kelompok19_db',
  password: 'kelompok19_pass',
  port: 5432,
});

export default pool;
