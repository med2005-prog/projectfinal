
async function testAPI() {
  try {
    const res = await fetch('http://localhost:3000/api/messages/unread-count');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body snippet:', text.slice(0, 200));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testAPI();
