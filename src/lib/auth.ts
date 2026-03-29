import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "dev-only-change-this-secret";

export type AuthUser = {
  id: string;
  email: string;
};

export function getJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_SECRET;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "7d" });
}
