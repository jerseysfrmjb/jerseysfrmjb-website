import { json } from "./_auth.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, {
    "Set-Cookie": "jb_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  });
}
