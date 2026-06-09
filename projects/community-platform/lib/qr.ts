import QRCode from "qrcode";

/**
 * Server-side QR as a PNG data-URI. ECC level Q + margin 4 (4-module quiet
 * zone) + width 1024 per ISO 18004 — robust scanning of a PROJECTED code at
 * distance and angle (spec §21 H137). Returned as a data-URI so the caller
 * renders a plain `<img src>` (no innerHTML, no XSS surface) and no
 * third-party QR service ever sees the token (H132). Input is a controlled
 * URL (HMAC token on our own domain).
 */
export async function renderQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { errorCorrectionLevel: "Q", margin: 4, width: 1024 });
}
