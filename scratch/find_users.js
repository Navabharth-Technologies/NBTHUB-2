const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Shobha@123',
  server: '127.0.0.1',
  database: 'master',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function run() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query("EXEC sp_MSforeachdb 'USE [?]; SELECT ''?'' as DB, name FROM sys.tables WHERE name LIKE ''%user%'' OR name LIKE ''%joinee%'' OR name LIKE ''%intern%'''");
    console.log(JSON.stringify(res.recordsets, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}
run();
