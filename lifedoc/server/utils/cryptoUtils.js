const CryptoJS = require("crypto-js");
require("dotenv").config();

const SECRET_KEY = process.env.CRYPTO_SECRET || "default_secret_key";

const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};

module.exports = { encrypt, decrypt };
