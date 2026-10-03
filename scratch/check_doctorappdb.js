const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Shobha@123',
  server: '127.0.0.1',
  database: 'DoctorAppDB',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function run() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'");
    console.log(res.recordset);
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}
run();
