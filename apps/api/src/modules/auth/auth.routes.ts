import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '@fastcopy/database';
import { UserRole } from '@fastcopy/shared';
import { env, isProduction } from '../../config/env';
import { validateBody } from '../../middleware/validate';

export const authRouter = Router();
const requestOtpSchema = z.object({ phone: z.string().min(8).max(16), role: UserRole.default('customer') });
const verifyOtpSchema = requestOtpSchema.extend({ otp: z.string().length(6) });

function signAccessToken(userId: string, role: string) { return jwt.sign({ role }, env.JWT_ACCESS_SECRET, { subject: userId, expiresIn: '15m' }); }
function signRefreshToken(userId: string, role: string) { return jwt.sign({ role }, env.JWT_REFRESH_SECRET, { subject: userId, expiresIn: '30d' }); }

authRouter.post('/otp/request', validateBody(requestOtpSchema), async (req, res, next) => {
  try {
    const otp = isProduction ? String(Math.floor(100000 + Math.random() * 900000)) : '123456';
    const otpHash = await bcrypt.hash(`${otp}.${env.OTP_PEPPER}`, 12);
    await UserModel.findOneAndUpdate({ phone: req.body.phone, role: req.body.role }, { $set: { otpHash, otpExpiresAt: new Date(Date.now() + 5 * 60_000) }, $setOnInsert: { phone: req.body.phone, role: req.body.role } }, { upsert: true });
    res.json({ message: 'OTP sent', devOtp: isProduction ? undefined : otp });
  } catch (error) { next(error); }
});

authRouter.post('/otp/verify', validateBody(verifyOtpSchema), async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ phone: req.body.phone, role: req.body.role, otpExpiresAt: { $gt: new Date() } });
    if (!user || !user.otpHash || !(await bcrypt.compare(`${req.body.otp}.${env.OTP_PEPPER}`, user.otpHash))) return res.status(401).json({ message: 'Invalid OTP' });
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.otpHash = undefined;
    user.lastLoginAt = new Date();
    await user.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 30 * 86400_000 }).json({ accessToken, user: { id: user.id, role: user.role, phone: user.phone } });
  } catch (error) { next(error); }
});
