const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test',
      email: 'test' + Date.now() + '@example.com',
      password: 'password'
    });
    console.log(res.data);
  } catch (error) {
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
  }
}

test();
