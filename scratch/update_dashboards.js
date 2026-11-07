const fs = require('fs');

// 1. Update HRDashboard.js
const hrFile = 'c:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/HRDashboard.js';
let hrContent = fs.readFileSync(hrFile, 'utf8').replace(/\r\n/g, '\n');

hrContent = hrContent.replace(
  "import { filterActiveEmployees } from '../../utils/employeeUtils';",
  "import { filterActiveEmployees, getEmployeeCounts } from '../../utils/employeeUtils';"
);

hrContent = hrContent.replace(
  "const usersRes = await fetch(API_ENDPOINTS.USERS, {",
  "const usersRes = await fetch(`${API_ENDPOINTS.USERS}?include_inactive=true`, {"
);

hrContent = hrContent.replace(
  "currentUsers = filterActiveEmployees(allParsedUsers);\n        setEmployeesCount(currentUsers.length);",
  "currentUsers = filterActiveEmployees(allParsedUsers);\n        const counts = getEmployeeCounts(allParsedUsers);\n        setEmployeesCount(counts.total);"
);

fs.writeFileSync(hrFile, hrContent, 'utf8');
console.log('HRDashboard updated successfully.');

// 2. Update PMDashboard.js
const pmFile = 'c:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/pm/src/components/profile/PMDashboard.js';
let pmContent = fs.readFileSync(pmFile, 'utf8').replace(/\r\n/g, '\n');

pmContent = pmContent.replace(
  "import { filterActiveEmployees } from '../../utils/employeeUtils';",
  "import { filterActiveEmployees, getEmployeeCounts } from '../../utils/employeeUtils';"
);

pmContent = pmContent.replace(
  "const userRes = await fetch(API_ENDPOINTS.USERS, {",
  "const userRes = await fetch(`${API_ENDPOINTS.USERS}?include_inactive=true`, {"
);

pmContent = pmContent.replace(
  "if (userRes.ok) {\n          setUsersList(currentUsers);\n          setEmployeesCount(currentUsers.length);\n        }",
  "if (userRes.ok) {\n          setUsersList(currentUsers);\n          const counts = getEmployeeCounts(filteredUsers);\n          setEmployeesCount(counts.total);\n        }"
);

fs.writeFileSync(pmFile, pmContent, 'utf8');
console.log('PMDashboard updated successfully.');

