// Run: node scripts/upload-papers.js
// Uploads all PDFs from the Gradescope export to Supabase Storage bucket "papers"
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PAPERS_DIR =
  "/Users/arpan/Downloads/assignment_7718089_export";
const BUCKET = "papers";

async function main() {
  const files = fs
    .readdirSync(PAPERS_DIR)
    .filter((f) => f.endsWith(".pdf"));

  console.log(`Found ${files.length} PDFs to upload`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(PAPERS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      if (error.message?.includes("already exists")) {
        skipped++;
      } else {
        console.error(`Failed: ${file} - ${error.message}`);
        failed++;
      }
    } else {
      uploaded++;
    }

    if ((uploaded + skipped + failed) % 20 === 0) {
      console.log(
        `Progress: ${uploaded + skipped + failed}/${files.length} (${uploaded} uploaded, ${skipped} skipped, ${failed} failed)`
      );
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`);
}

main().catch(console.error);
