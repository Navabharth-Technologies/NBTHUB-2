const fs = require('fs');

const files = [
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/pm/src/components/profile/TaskNotification.js',
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/TaskNotification.js'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  const target = `        if (isBlockAlert) {
          displayTitle = 'Employee Access Blocked';
          if (descText.includes('1-day onboarding window expired') || descText.includes('onboarding window expired') || descText.startsWith('URGENT: New Joinee')) {
            let empName = 'Preethi R';
            let empCode = '10062';
            const nameMatch = descText.match(/(?:Joinee|Employee|Intern)\\s+([^(]+?)\\s*\\(ID:\\s*([0-9a-zA-Z]+)\\)/i);
            if (nameMatch) {
              empName = nameMatch[1].trim();
              empCode = nameMatch[2].trim();
            }
            const actionDateIST = rawDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
            const actionTimeIST = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
            descText = \`\${empName} (Employee ID: \${empCode}) has been blocked by the Project Manager.\\nReason: Employee access was blocked by the Project Manager.\\nAction Date: \${actionDateIST}\\nAction Time: \${actionTimeIST} IST\`;
          }
        }`;

  const replacement = `        if (isBlockAlert) {
          displayTitle = 'Employee Access Blocked';
          let empName = 'Preethi R';
          let empCode = '10062';
          const nameMatch = descText.match(/(?:Joinee|Employee|Intern)\\s+([^(]+?)\\s*\\(ID:\\s*([0-9a-zA-Z]+)\\)/i);
          if (nameMatch) {
            empName = nameMatch[1].trim();
            empCode = nameMatch[2].trim();
          }
          let customReason = '';
          const reasonMatch = descText.match(/Reason:\\s*([^\\n\\r]+)/i);
          if (reasonMatch) {
            const r = reasonMatch[1].trim();
            if (r && !r.toLowerCase().includes('blocked by the project manager') && !r.toLowerCase().includes('employee access was blocked') && !r.toLowerCase().includes('1-day onboarding window')) {
              customReason = \`\\nReason: \${r}\`;
            }
          }
          descText = \`\${empName} (Employee ID: \${empCode}) has been blocked by the Project Manager.\${customReason}\`;
        }`;

  // Normalize CRLF to LF for matching
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedTarget = target.replace(/\r\n/g, '\n');
  const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

  if (normalizedContent.includes(normalizedTarget)) {
    const updated = normalizedContent.replace(normalizedTarget, normalizedReplacement);
    fs.writeFileSync(filePath, updated.replace(/\n/g, '\r\n'), 'utf8');
    console.log('Successfully replaced in:', filePath);
  } else {
    console.error('Target not found in:', filePath);
  }
});
