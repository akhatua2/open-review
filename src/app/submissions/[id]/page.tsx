import { getSubmission, getPdfUrl } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { RUBRIC, TOTAL_POINTS } from "@/lib/rubric";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RubricForm from "./rubric-form";

export const dynamic = "force-dynamic";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/login");
  const { id } = await params;

  const submission = getSubmission(id);
  if (!submission) return notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("submission_id", id)
    .order("created_at", { ascending: true });

  const pdfUrl = getPdfUrl(submission.pdf_file);

  const avgScore =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / reviews.length).toFixed(2)
      : null;

  return (
    <div>
      <Link href="/" className="text-sm text-[var(--muted)] no-underline hover:text-[var(--foreground)]">
        &larr; All Projects
      </Link>

      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {submission.authors} &middot; Mentor: {submission.mentor || "Unassigned"}
          {submission.milestone_score !== null && (
            <> &middot; Milestone: {submission.milestone_score}</>
          )}
        </p>
      </div>

      {/* Two-column layout: PDF left, grading right */}
      <div className="flex gap-6" style={{ height: "calc(100vh - 180px)" }}>
        {/* Left: PDF viewer */}
        <div className="w-1/2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Project Report</span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--muted)] no-underline hover:text-[var(--foreground)]"
            >
              Open in new tab
            </a>
          </div>
          <iframe
            src={pdfUrl}
            className="flex-1 w-full border border-[var(--border)] rounded"
            title="Project PDF"
          />
        </div>

        {/* Right: Grading panel (scrollable) */}
        <div className="w-1/2 overflow-y-auto min-h-0 pr-2">
          {/* Existing Reviews */}
          {reviews && reviews.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Submitted Grades ({reviews.length})
                {avgScore && (
                  <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                    Avg: {avgScore} / {TOTAL_POINTS}
                  </span>
                )}
              </h2>
              <div className="space-y-3">
                {reviews.map(
                  (rev: {
                    id: string;
                    grader_name: string;
                    score: number;
                    rubric_selections: Record<string, number>;
                    additional_comments: string | null;
                    created_at: string;
                  }) => (
                    <div key={rev.id} className="border border-[var(--border)] rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{rev.grader_name}</span>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                          <span>
                            <strong className="text-[var(--foreground)]">{rev.score}</strong> / {TOTAL_POINTS}
                          </span>
                          <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--muted)] space-y-0.5">
                        {RUBRIC.flatMap((g) => g.items).map((item) => {
                          const selIdx = rev.rubric_selections[item.id];
                          if (selIdx === undefined) return null;
                          const opt = item.options[selIdx];
                          return (
                            <div key={item.id} className="flex gap-2">
                              <span className="font-medium text-[var(--foreground)] w-10 shrink-0">
                                {item.id.toUpperCase()}
                              </span>
                              <span className={opt.deduction === 0 ? "" : "text-[var(--danger)]"}>
                                {opt.deduction === 0 ? "Full marks" : `${opt.deduction} — ${opt.comment}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {rev.additional_comments && (
                        <p className="text-xs whitespace-pre-wrap mt-2 pt-2 border-t border-[var(--border)]">
                          {rev.additional_comments}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* Grading Form */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Grade This Submission</h2>
            <RubricForm submissionId={id} mentorName={submission.mentor || ""} />
          </section>
        </div>
      </div>
    </div>
  );
}
