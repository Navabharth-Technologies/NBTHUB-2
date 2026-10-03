const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Shobha@123',
  server: '127.0.0.1',
  database: 'NBT_DB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: 'SQLEXPRESS'
  }
};

async function run() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query("SELECT name FROM sys.tables");
    console.log(res.recordset);
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}
run();
