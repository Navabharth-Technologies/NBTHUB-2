const fs = require('fs');

const serverFile = 'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/backend/backend/server.js';
let content = fs.readFileSync(serverFile, 'utf8');

const targetAnchor = "app.put('/api/admin/birthdays/:userId', verifyToken, async (req, res) => {";

if (!content.includes(targetAnchor)) {
  console.error('Target anchor not found!');
  process.exit(1);
}

const endpointCode = `/**
 * PM/Admin: Update Employee Application Access (Block/Unblock)
 * Allows Project Manager or Admin to block or unblock application access for employees.
 * When blocked: sets status to 'Resigned' (or 'Blocked') and increments token_version to immediately revoke existing sessions.
 * When unblocked: restores status to 'Active'.
 */
app.put('/api/admin/employees/:id/access', verifyToken, async (req, res) => {
  const role = (req.user.role || '').toLowerCase();
  const isAuthorized = isPMRole(role) || role.includes('admin') || role.includes('ceo');
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Unauthorized: Only Project Manager or Admin can manage employee access.' });
  }

  const employeeId = sanitizeNumericId(req.params.id);
  const { action } = req.body; // 'block' or 'unblock'

  if (!employeeId) {
    return res.status(400).json({ error: 'Valid employee ID is required.' });
  }

  if (action !== 'block' && action !== 'unblock') {
    return res.status(400).json({ error: "Action must be either 'block' or 'unblock'." });
  }

  try {
    const pool = await getPool();
    const newStatus = action === 'block' ? 'Resigned' : 'Active';

    // Update status and increment token_version when blocking to force instant token invalidation
    if (action === 'block') {
      await pool.request()
        .input('id', sql.Int, employeeId)
        .input('status', sql.NVarChar, newStatus)
        .query('UPDATE users SET status = @status, token_version = ISNULL(token_version, 0) + 1 WHERE id = @id');
    } else {
      await pool.request()
        .input('id', sql.Int, employeeId)
        .input('status', sql.NVarChar, newStatus)
        .query('UPDATE users SET status = @status WHERE id = @id');
    }

    // Invalidate token cache and all users cache
    tokenVersionCache.delete(\`employee_\${employeeId}\`);
    allUsersCache = null;
    lastAllUsersCacheUpdate = 0;

    Log.success('Access Management', \`Employee ID \${employeeId} access updated to \${action.toUpperCase()}ED by \${req.user.name}\`);
    res.json({
      success: true,
      employeeId,
      status: newStatus,
      isBlocked: action === 'block',
      message: \`Employee \${action === 'block' ? 'blocked' : 'unblocked'} successfully.\`
    });
  } catch (err) {
    console.error('[EMPLOYEE ACCESS UPDATE ERROR]:', err);
    res.status(500).json({ error: 'Failed to update employee access status.' });
  }
});

`;

content = content.replace(targetAnchor, endpointCode + targetAnchor);
fs.writeFileSync(serverFile, content, 'utf8');
console.log('Successfully added /api/admin/employees/:id/access endpoint to server.js');

