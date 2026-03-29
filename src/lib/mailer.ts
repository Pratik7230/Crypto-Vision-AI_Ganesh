import nodemailer from "nodemailer";

type OtpPurpose = "signup" | "reset";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function normalizeEnv(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

function parseSecure(value: string | undefined, port: number): boolean {
  if (!value) return port === 465;
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("true") || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized.startsWith("false") || normalized === "0" || normalized === "no") {
    return false;
  }
  return port === 465;
}

function buildTransport() {
  const user = normalizeEnv(getRequiredEnv("SMTP_USER")) as string;
  const pass = normalizeEnv(getRequiredEnv("SMTP_PASS")) as string;
  const host = normalizeEnv(process.env.SMTP_HOST) || "smtp.gmail.com";
  const port = Number(normalizeEnv(process.env.SMTP_PORT) || 465);
  const secure = parseSecure(normalizeEnv(process.env.SMTP_SECURE), port);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user,
      pass,
    },
  });
}

function buildGmailFallbackTransport() {
  const user = normalizeEnv(getRequiredEnv("SMTP_USER")) as string;
  const pass = normalizeEnv(getRequiredEnv("SMTP_PASS")) as string;

  return nodemailer.createTransport({
    service: "gmail",
    secure: true,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  purpose: OtpPurpose,
) {
  const transport = buildTransport();
  const smtpUser = normalizeEnv(getRequiredEnv("SMTP_USER")) as string;
  const configuredFrom = normalizeEnv(process.env.SMTP_FROM);
  const from =
    configuredFrom && !configuredFrom.includes("yourgmail@gmail.com")
      ? configuredFrom
      : smtpUser;

  const subject =
    purpose === "signup"
      ? "Crypto Vision AI: Verify Your Email"
      : "Crypto Vision AI: Reset Password OTP";

  const actionText =
    purpose === "signup" ? "complete your signup" : "reset your password";

  const supportEmail = smtpUser;

  const html = `
    <div style="margin:0;padding:0;background:#0b111b;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b111b;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#111827;border:1px solid #1f2937;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(90deg,#0ea5e9,#22c55e,#facc15);height:4px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
              <tr>
                <td style="padding:24px 24px 8px 24px;">
                  <h1 style="margin:0;font-size:22px;line-height:1.3;color:#f9fafb;">Crypto Vision AI</h1>
                  <p style="margin:10px 0 0 0;font-size:14px;color:#9ca3af;line-height:1.6;">
                    Use the one-time password below to ${actionText}.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 8px 24px;">
                  <div style="background:#0b1220;border:1px solid #243244;border-radius:12px;padding:16px 14px;text-align:center;">
                    <div style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;">Your OTP Code</div>
                    <div style="font-size:34px;font-weight:700;letter-spacing:8px;line-height:1.2;color:#facc15;">${otp}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 24px 24px;">
                  <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:13px;line-height:1.8;">
                    <li>This code expires in <strong>10 minutes</strong>.</li>
                    <li>Do not share this OTP with anyone.</li>
                    <li>If you did not request this, you can safely ignore this email.</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 24px;border-top:1px solid #1f2937;background:#0f172a;">
                  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                    Need help? Reply to this email or contact <span style="color:#38bdf8;">${supportEmail}</span>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    "Crypto Vision AI",
    "",
    `Use this OTP to ${actionText}: ${otp}`,
    "",
    "The code expires in 10 minutes.",
    "Do not share this OTP with anyone.",
    "If you did not request this, ignore this email.",
    "",
    `Support: ${supportEmail}`,
  ].join("\n");

  const message = {
    from,
    to: toEmail,
    subject,
    html,
    text,
  };

  try {
    await transport.sendMail(message);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    const host = (normalizeEnv(process.env.SMTP_HOST) || "smtp.gmail.com").toLowerCase();

    if (messageText.includes("Unexpected socket close") && host.includes("gmail")) {
      const fallbackTransport = buildGmailFallbackTransport();
      await fallbackTransport.sendMail(message);
      return;
    }

    throw error;
  }
}
