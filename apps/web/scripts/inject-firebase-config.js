const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const swPath = path.join(root, "public", "firebase-messaging-sw.js");

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv(envPath);
const sw = fs.readFileSync(swPath, "utf-8");

const replacements = {
  "___FIREBASE_API_KEY___": env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  "___FIREBASE_PROJECT_ID___": env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  "___FIREBASE_MESSAGING_SENDER_ID___":
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  "___FIREBASE_APP_ID___": env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let result = sw;
for (const [placeholder, value] of Object.entries(replacements)) {
  result = result.split(placeholder).join(value);
}

fs.writeFileSync(swPath, result, "utf-8");
console.log("[inject-firebase-config] Placeholders replaced in firebase-messaging-sw.js");
