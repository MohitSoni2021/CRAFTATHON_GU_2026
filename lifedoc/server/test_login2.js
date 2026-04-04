const axios = require('axios');
const CryptoJS = require("crypto-js");

const SECRET_KEY = "4bf99b1551ee3e11fca3f5a0db6addebdc007d46c803a04ca97d46c14a187a755549d004e0ec8006323a97746d0e6d7fc97b6cbbe72385112c135b0fed9cd49a";

const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

async function test() {
  try {
    const encryptedData = encrypt({ email: "techforgames985@gmail.com", password: "wrongpassword123" });
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      encryptedData
    });
    console.log("Success:", response.status, response.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.status + " " + JSON.stringify(err.response.data) : err.message);
  }
}
test();
