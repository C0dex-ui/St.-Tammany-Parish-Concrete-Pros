/**
 * Pick the correct homepage per Vercel project.
 * - new-orleans-concrete-pros → New Orleans Concrete Pros
 * - st-tammany-parish-concrete-pros (default) → St. Tammany homepage stays index.html
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const prodUrl = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  ""
).toLowerCase();

const isNola =
  prodUrl.includes("new-orleans-concrete-pros") ||
  process.env.BRAND_HOME === "nola-concrete";

if (isNola) {
  const src = path.join(root, "new-orleans-concrete.html");
  const dest = path.join(root, "index.html");
  fs.copyFileSync(src, dest);
  console.log(
    "[select-home] NOLA project detected → index.html = new-orleans-concrete.html"
  );
  console.log("[select-home] production URL:", prodUrl || "(local/env)");
} else {
  console.log(
    "[select-home] ST / default project → keeping index.html (St. Tammany)"
  );
  console.log("[select-home] production URL:", prodUrl || "(local/env)");
}
