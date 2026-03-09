export class MintAuthError extends Error {
  constructor() {
    super("admin-auth-required");
    this.name = "MintAuthError";
  }
}

export async function mintMockUSDC(
  userPublicKey: string,
  _signTransaction: (xdr: string) => Promise<string>,
  onStatus?: (msg: string) => void
): Promise<string> {
  onStatus?.("Admin'den mint talebi gönderiliyor...");

  const res = await fetch("/api/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPublicKey }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(data.error ?? "Rate limit aşıldı");
    }
    throw new Error(data.error ?? "Mint başarısız");
  }

  onStatus?.("Onaylanıyor...");
  return data.hash as string;
}
