const sql = require('C:/Users/Shobha/OneDrive/Desktop/NBT HUB/backend/backend/node_modules/mssql');
const bcrypt = require('C:/Users/Shobha/OneDrive/Desktop/NBT HUB/backend/backend/node_modules/bcrypt');

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
    console.log('Connected to NBT_DB.');
    
    // Create missing tables so the backend doesn't crash (Error 500)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'new_joinees')
      BEGIN
          CREATE TABLE new_joinees (
              id INT IDENTITY(1,1) PRIMARY KEY,
              name VARCHAR(100),
              email_id VARCHAR(100),
              password VARCHAR(255),
              role VARCHAR(50),
              joining_date DATE,
              course_completion DATE,
              is_blocked BIT,
              block_reason VARCHAR(255),
              token_version INT DEFAULT 0
          );
      END
      
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'interns')
      BEGIN
          CREATE TABLE interns (
              id INT IDENTITY(1,1) PRIMARY KEY,
              name VARCHAR(100),
              email VARCHAR(100),
              password VARCHAR(255),
              role VARCHAR(50),
              token_version INT DEFAULT 0
          );
      END
    `);
    
    // Hash passwords and insert users
    const usersToInsert = [
      { name: 'Shobha', email: 'shobha@navabharathtechnologies.com', pass: 'shobha123' },
      { name: 'Rakesh', email: 'rakesh@navabharathtechnologies.com', pass: '123456' },
      { name: 'Varun', email: 'varun@navabharathtechnologies.com', pass: 'varun123' }
    ];

    for (const u of usersToInsert) {
      const hash = await bcrypt.hash(u.pass, 10);
      
      // Update if exists, insert if not
      await pool.request().query(`
        IF EXISTS (SELECT * FROM users WHERE email = '${u.email}')
        BEGIN
            UPDATE users SET password = '${hash}' WHERE email = '${u.email}'
        END
        ELSE
        BEGIN
            INSERT INTO users (name, email, password, role, status)
            VALUES ('${u.name}', '${u.email}', '${hash}', 'employee', 'Active');
        END
      `);
      console.log(`Inserted/Updated ${u.name} with provided password.`);
    }

    console.log('Done fixing missing tables and inserting users.');
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}
run();
