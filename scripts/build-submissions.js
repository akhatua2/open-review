// Run: node scripts/build-submissions.js
// Merges Gradescope YAML + Excel mentor data into a single JSON file
// that the app reads at runtime.

const XLSX = require("xlsx");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const YAML_PATH = path.join(__dirname, "..", "src", "data", "submission_metadata.yml");
const EXCEL_PATH = "/Users/arpan/Downloads/CS224N Winter 2026 Final Project Data.xlsx";
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "submissions.json");

// Parse YAML — keyed by PDF filename
const yamlContent = fs.readFileSync(YAML_PATH, "utf8");
const yamlData = yaml.load(yamlContent);

// Parse Excel FINAL sheet
const wb = XLSX.readFile(EXCEL_PATH);
const sheet = wb.Sheets["FINAL"];
const excelRows = XLSX.utils.sheet_to_json(sheet);

// Build email -> mentor map from Excel
const emailToMentor = {};
const emailToTitle = {};
for (const row of excelRows) {
  const mentor = row["Assigned Mentor"];
  const title = row["Question 1 Response"]; // Project title
  if (row.Emails) {
    row.Emails.split(",").map(e => e.trim()).forEach(email => {
      if (mentor) emailToMentor[email] = mentor;
      if (title) emailToTitle[email] = title;
    });
  }
}

// Build submissions array
const submissions = [];
for (const [pdfFile, meta] of Object.entries(yamlData)) {
  const id = pdfFile.replace(".pdf", "");
  const submitters = (meta[":submitters"] || []).map(s => ({
    name: s[":name"],
    sid: s[":sid"],
    email: s[":email"],
  }));

  const names = submitters.map(s => s.name).join(", ");
  const emails = submitters.map(s => s.email);

  // Find mentor and title via email match
  let mentor = null;
  let title = null;
  for (const email of emails) {
    if (emailToMentor[email]) mentor = emailToMentor[email];
    if (emailToTitle[email]) title = emailToTitle[email];
  }

  submissions.push({
    id,
    pdf_file: pdfFile,
    title: title || meta[":original_filename"]?.replace(/.pdf$/i, "").replace(/_/g, " ") || `Submission ${id}`,
    authors: names,
    emails,
    mentor,
    milestone_score: meta[":score"] ?? null,
    created_at: meta[":created_at"],
  });
}

// Sort by title
submissions.sort((a, b) => a.title.localeCompare(b.title));

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(submissions, null, 2));
console.log(`Wrote ${submissions.length} submissions to ${OUTPUT_PATH}`);

// Stats
const withMentor = submissions.filter(s => s.mentor).length;
const withTitle = submissions.filter(s => s.title).length;
console.log(`With mentor: ${withMentor}/${submissions.length}`);
console.log(`With title: ${withTitle}/${submissions.length}`);
