import { NextResponse } from "next/server";
import { signAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/password";
import { OtpCode } from "@/models/OtpCode";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      otp?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const otp = body.otp?.trim();

    if (!email || !password || !otp) {
      return NextResponse.json(
        { error: "Email, password and OTP are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const otpRecord = await OtpCode.findOne({ email, purpose: "signup" });
    if (!otpRecord || otpRecord.usedAt || otpRecord.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "OTP is invalid or expired" },
        { status: 400 },
      );
    }

    const isOtpValid = verifyPassword(otp, otpRecord.codeHash);
    if (!isOtpValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    const created = await User.create({
      email,
      passwordHash: hashPassword(password),
    });

    const token = signAuthToken({
      id: created._id.toString(),
      email: created.email,
    });

    return NextResponse.json({
      token,
      user: {
        id: created._id.toString(),
        email: created.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OTP signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
