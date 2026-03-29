import { Schema, model, models } from "mongoose";

export type OtpPurpose = "signup" | "reset";

export interface IOtpCode {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpCodeSchema = new Schema<IOtpCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["signup", "reset"],
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

OtpCodeSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const OtpCode = models.OtpCode || model<IOtpCode>("OtpCode", OtpCodeSchema);
