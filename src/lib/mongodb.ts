import mongoose from "mongoose";

function normalizeMongoUri(value?: string): string | undefined {
  if (!value) return undefined;

  // Trim spaces/newlines and strip accidental surrounding quotes.
  const trimmed = value.trim().replace(/^['\"]|['\"]$/g, "");
  return trimmed || undefined;
}

const MONGODB_URI = normalizeMongoUri(process.env.MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = cached;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  if (
    !MONGODB_URI.startsWith("mongodb://") &&
    !MONGODB_URI.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      'Invalid MongoDB URI scheme. It must start with "mongodb://" or "mongodb+srv://"',
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
