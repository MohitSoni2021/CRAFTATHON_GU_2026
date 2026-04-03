"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
var token = jwt.sign({ id: '65f0a1b2c3d4e5f6g7h8i9j0', role: 'PATIENT' }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345', { expiresIn: '1h' });
console.log(token);
