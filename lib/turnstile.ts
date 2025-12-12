type VerifyResult = { success: boolean; code?: string; raw?: unknown };

export async function verifyTurnstileToken(token: string | undefined | null): Promise<VerifyResult> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("Turnstile secret key missing (CLOUDFLARE_TURNSTILE_SECRET_KEY or TURNSTILE_SECRET_KEY)");
    return { success: false, code: "missing-secret" };
  }

  if (!token) {
    return { success: false, code: "missing-token" };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data = (await response.json()) as { success?: boolean; ["error-codes"]?: string[] };
    const success = Boolean(data.success);
    return { success, code: data["error-codes"]?.[0], raw: data };
  } catch (err) {
    console.error("Turnstile verification failed", err);
    return { success: false, code: "verify-error" };
  }
}


