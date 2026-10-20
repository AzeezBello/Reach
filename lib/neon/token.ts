export const SESSION_COOKIE_NAME = "reach_session";
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionClaims = {
  sub: string;
  email?: string;
  role?: string;
  type?: "session" | "recovery" | "invite";
  iat: number;
  exp: number;
};

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    "reach-neon-session-default-secret"
  );
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlDecodeBytes(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeString(str: string): string {
  return new TextDecoder().decode(base64UrlDecodeBytes(str));
}

async function getHmacKey(): Promise<CryptoKey> {
  const keyBytes = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(
  payload: {
    sub: string;
    email?: string;
    role?: string;
    type?: "session" | "recovery" | "invite";
  },
  maxAgeSeconds: number = DEFAULT_SESSION_MAX_AGE
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role ?? "authenticated",
    type: payload.type ?? "session",
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const headerPart = base64UrlEncodeString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadPart = base64UrlEncodeString(JSON.stringify(claims));
  const signingInput = `${headerPart}.${payloadPart}`;

  const key = await getHmacKey();
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  );

  const sigPart = base64UrlEncodeBytes(new Uint8Array(sigBuffer));
  return `${signingInput}.${sigPart}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionClaims | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, sigPart] = parts;
  try {
    const key = await getHmacKey();
    const sigBytes = base64UrlDecodeBytes(sigPart);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      new TextEncoder().encode(`${headerPart}.${payloadPart}`)
    );

    if (!valid) return null;

    const claims = JSON.parse(base64UrlDecodeString(payloadPart)) as SessionClaims;
    if (!claims?.sub || typeof claims.exp !== "number") return null;

    const now = Math.floor(Date.now() / 1000);
    if (claims.exp <= now) return null;

    return claims;
  } catch {
    return null;
  }
}
