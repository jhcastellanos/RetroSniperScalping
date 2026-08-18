function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  databaseUrl: read("DATABASE_URL"),
  directUrl: read("DIRECT_URL"),
  authSecret: read("AUTH_SECRET"),
  googleClientId: read("GOOGLE_CLIENT_ID"),
  googleClientSecret: read("GOOGLE_CLIENT_SECRET"),
  blobToken: read("BLOB_READ_WRITE_TOKEN"),
  appUrl: read("AUTH_URL") ?? read("NEXT_PUBLIC_APP_URL"),
};

export function isGoogleAuthConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret);
}

export function isBlobConfigured() {
  return Boolean(
    env.blobToken || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

export function isDatabaseConfigured() {
  return Boolean(env.databaseUrl);
}
