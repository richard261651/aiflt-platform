const fetch = require('node-fetch');
async function test() {
  const res = await fetch('https://aiflt-backend.onrender.com/auth/student-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'richard' })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}
test();
