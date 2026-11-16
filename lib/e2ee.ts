// Direct E2EE mode: the key lives in the URL *fragment* (#k=...).
// Browsers never send the fragment to any server, so LiveKit cannot decrypt the media.
export function makeKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function readKeyFromHash(): string | null {
  return new URLSearchParams(window.location.hash.slice(1)).get("k");
}
