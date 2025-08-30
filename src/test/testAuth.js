// testAuth.js
const axios = require("axios");

const API = "http://localhost:5000/api/auth";

async function testAuth() {
  try {
    // // 1. Signup new user
    // const signupRes = await axios.post(`${API}/signup`, {
    //   name: "CLI User",
    //   email: "cliuser@test.com",
    //   password: "123456",
    //   department: "68af47852359dfd30d3d2a69"
    // });
    // console.log("✅ Signup Response:", signupRes.data);

    // 2. Login user
    const loginRes = await axios.post(`${API}/login`, {
      email: "cliuser@test.com",
      password: "123456"
    });
    console.log("✅ Login Response:", loginRes.data);

    // Extract token
    const token = loginRes.data.token;

    // 3. Call a protected route (later when we add user routes)
    // Example:
    // const meRes = await axios.get("http://localhost:5000/api/users/me", {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // console.log("✅ User Info:", meRes.data);

  } catch (err) {
    console.error("❌ Error:", err.response ? err.response.data : err.message);
  }
}

testAuth();
