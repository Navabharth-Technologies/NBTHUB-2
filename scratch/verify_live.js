const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ url, status: res.statusCode, length: data.length, data }));
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function verify() {
  const root = await get('https://nbthub.in/');
  console.log('Homepage status:', root.status, 'HTML length:', root.length);
  const scriptRegex = /src="(\/static\/js\/[^"]+)"/g;
  let match;
  const scripts = [];
  while ((match = scriptRegex.exec(root.data)) !== null) {
    scripts.push(match[1]);
  }
  console.log('Loaded scripts:', scripts);

  for (const s of scripts) {
    const sUrl = 'https://nbthub.in' + s;
    const res = await get(sUrl);
    console.log(s, '-> Status:', res.status, 'Bytes:', res.length);
  }
}

verify();

