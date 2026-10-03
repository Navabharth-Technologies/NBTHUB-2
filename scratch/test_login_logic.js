const { getPool } = require('C:/Users/Shobha/OneDrive/Desktop/NBT HUB/backend/backend/db.js');

async function testLogin() {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('email', 'rakesh@navabharathtechnologies.com')
            .query('SELECT id, name, email, password, role, phone_number, profile_picture, about_me, team, joining_date, token_version, status FROM users WHERE email = @email');
        
        console.log("DB Query Success! Users found:", result.recordset.length);
        if (result.recordset.length > 0) {
            console.log("User:", result.recordset[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error("DB Error in login:", err);
        process.exit(1);
    }
}
testLogin();
