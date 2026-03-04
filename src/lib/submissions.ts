import submissionsData from "@/data/submissions.json";

export interface Submission {
  id: string;
  pdf_file: string;
  title: string;
  authors: string;
  emails: string[];
  mentor: string | null;
  milestone_score: number | null;
  created_at: string;
}

export function getAllSubmissions(): Submission[] {
  return submissionsData as Submission[];
}

export function getSubmission(id: string): Submission | undefined {
  return (submissionsData as Submission[]).find((s) => s.id === id);
}

export function getPdfUrl(pdfFile: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/papers/${pdfFile}`;
}
