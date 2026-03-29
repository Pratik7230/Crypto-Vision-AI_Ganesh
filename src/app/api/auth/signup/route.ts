import { NextResponse } from "next/server";
import { signAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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

    const passwordHash = hashPassword(password);
    const created = await User.create({
      email,
      passwordHash,
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
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
