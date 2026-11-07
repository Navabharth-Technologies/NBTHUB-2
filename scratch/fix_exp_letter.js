const fs = require('fs');
const file = 'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/ExperienceLetterUser.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("`${API_ENDPOINTS.BASE_URL || 'http://localhost:5000'}/api/assets`", "`${API_ENDPOINTS.BASE_URL || 'https://nbthub.navabharathtechnologies.com'}/api/assets`");
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ExperienceLetterUser.js line 495');

