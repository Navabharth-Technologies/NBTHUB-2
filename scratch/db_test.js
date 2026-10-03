const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Shobha@123',
  server: '127.0.0.1',
  database: 'NBT_DB',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function run() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('email', sql.NVarChar, 'rakesh@navabharathtechnologies.com')
      .query('SELECT id, name, email, password, role, phone_number, profile_picture, about_me, team, joining_date, token_version, status FROM users WHERE email = @email');
    console.log(result.recordset);
    sql.close();
  } catch (err) {
    console.error("DB Error:", err);
  }
}
run();
