const fs = require('fs');

function updateFile(filePath, searchStr, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', filePath);
  } else {
    console.warn('String not found in:', filePath);
  }
}

// 1. Employee config
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/employee/src/config.js',
  "(typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000')",
  "'https://nbthub.navabharathtechnologies.com'"
);

// 2. Admin config
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/admin/src/config.js',
  "(typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000')",
  "'https://nbthub.navabharathtechnologies.com'"
);

// 3. Teamleader config
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/teamleader/src/config.js',
  "'http://localhost:5000'",
  "'https://nbthub.navabharathtechnologies.com'"
);

// 4. Employee LeaveScreen logger
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/employee/src/components/LeaveScreen.js',
  "fetch('http://localhost:9999', { method: 'POST', body: JSON.stringify(selectedLeave) }).catch(() => null);",
  "// logger disabled"
);

// 5. HR AttendanceManagement
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/AttendanceManagement.js',
  "http://localhost:3000/api/attendance_logs",
  "https://nbthub.navabharathtechnologies.com/api/attendance_logs"
);

// 6. PM AttendanceManagement
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/pm/src/components/profile/AttendanceManagement.js',
  "http://localhost:3000/api/attendance_logs",
  "https://nbthub.navabharathtechnologies.com/api/attendance_logs"
);

// 7. PM LeaveAttendanceCenter
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/pm/src/components/profile/LeaveAttendanceCenter.js',
  "http://localhost:3000/api/attendance_logs",
  "https://nbthub.navabharathtechnologies.com/api/attendance_logs"
);

// 8. HR ExperienceLetterUser
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/ExperienceLetterUser.js',
  "http://localhost:5000",
  "https://nbthub.navabharathtechnologies.com"
);

// 9. HR JobApplications
updateFile(
  'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/JobApplications.js',
  "(BASE_URL || 'http://localhost:5000')",
  "(BASE_URL || 'https://nbthub.navabharathtechnologies.com')"
);

console.log('All frontend url updates completed.');

