fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tester@example.com', password: 'Test123!' })
})
  .then(res => res.text())
  .then(text => {
    console.log(text);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
