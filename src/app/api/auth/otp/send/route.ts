import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { OtpCode, type OtpPurpose } from "@/models/OtpCode";
import { User } from "@/models/User";

function generateSixDigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      purpose?: OtpPurpose;
    };

    const email = body.email?.trim().toLowerCase();
    const purpose = body.purpose;

    if (!email || !purpose) {
      return NextResponse.json(
        { error: "Email and purpose are required" },
        { status: 400 },
      );
    }

    if (purpose !== "signup" && purpose !== "reset") {
      return NextResponse.json({ error: "Invalid OTP purpose" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email }).lean();
    if (purpose === "signup" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    if (purpose === "reset" && !existingUser) {
      return NextResponse.json(
        { error: "No account found for this email" },
        { status: 404 },
      );
    }

    const otp = generateSixDigitOtp();
    const codeHash = hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpCode.findOneAndUpdate(
      { email, purpose },
      {
        $set: {
          codeHash,
          expiresAt,
          usedAt: null,
          attempts: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await sendOtpEmail(email, otp, purpose);

    const response: {
      message: string;
      devOtp?: string;
    } = {
      message: "OTP sent successfully",
    };

    if (process.env.NODE_ENV !== "production") {
      response.devOtp = otp;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
