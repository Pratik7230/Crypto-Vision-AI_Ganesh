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
        { error: "Email, new password and OTP are required" },
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

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email" },
        { status: 404 },
      );
    }

    const otpRecord = await OtpCode.findOne({ email, purpose: "reset" });
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

    user.passwordHash = hashPassword(password);
    await user.save();

    const token = signAuthToken({
      id: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password reset failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
