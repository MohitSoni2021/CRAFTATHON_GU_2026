import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './auth.model';
import { OAuth2Client } from 'google-auth-library';
import { UserRole } from '@hackgu/shared';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id: string, role: string) =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' } as jwt.SignOptions
  );

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user._id.toString(), user.role);
    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, timezone: user.timezone },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, phone, timezone } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, phone, timezone });
    await user.save();
    const token = signToken(user._id.toString(), user.role);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, timezone: user.timezone },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: payload.name || 'User',
        email: payload.email,
        role: UserRole.PATIENT,
      });
      await user.save();
    }
    const token = signToken(user._id.toString(), user.role);
    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, timezone: user.timezone },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};
