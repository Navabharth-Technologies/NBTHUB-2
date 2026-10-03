const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Shobha@123',
  server: '127.0.0.1',
  port: 1433,
  database: 'NBT_DB',
  options: { encrypt: false, trustServerCertificate: true }
};

async function run() {
  try {
    let pool = await sql.connect(config);
    
    // Check if rakesh already exists, if not insert
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM users WHERE email = 'rakesh@navabharathtechnologies.com')
      BEGIN
          INSERT INTO users (name, email, password, role, status)
          VALUES ('Rakesh', 'rakesh@navabharathtechnologies.com', '$2b$10$wT8K48.pW4t38Zz53oI3/.E8Jt6a/9.J98hYy3qR/k3Uq.5O5pX4W', 'Admin', 'Active');
      END
    `);
    
    console.log('Successfully inserted Rakesh with password: admin123');
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}
run();
