const { execSync } = require('child_process');
const modules = ['admin', 'employee', 'hr', 'pm', 'teamleader'];
for (const m of modules) {
  const dir = 'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/' + m;
  try {
    const out = execSync('git add -A && git commit -m "fix: enforce deployed backend base URL and eliminate localhost references"', { cwd: dir, encoding: 'utf8' });
    console.log(m + ':', out.trim());
  } catch (e) {
    console.log(m + ' skipped or error:', e.message);
  }
}

