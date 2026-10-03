const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Shobha@123',
  server: '127.0.0.1',
  port: 1433,
  options: { encrypt: false, trustServerCertificate: true }
};

async function run() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(`
      DECLARE @command varchar(1000) 
      SELECT @command = 'USE ?; SELECT ''?'' AS DBName, name FROM sys.tables WHERE name = ''users''' 
      EXEC sp_MSforeachdb @command
    `);
    
    // Process all recordsets (sp_MSforeachdb returns multiple recordsets, one per DB)
    let found = [];
    for (let rs of res.recordsets) {
      if (rs && rs.length > 0) {
        found.push(...rs);
      }
    }
    console.log(JSON.stringify(found, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}
run();
