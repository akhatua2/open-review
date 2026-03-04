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

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {submission.authors} &middot; Mentor: {submission.mentor || "Unassigned"}
          {submission.milestone_score !== null && (
            <> &middot; Milestone: {submission.milestone_score}</>
          )}
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm px-3 py-1.5 border border-[var(--border)] rounded no-underline hover:bg-[var(--surface)] hover:no-underline text-[var(--foreground)]"
        >
          Open PDF in new tab
        </a>
      </div>

      {/* Embedded PDF */}
      <div className="mb-8">
        <iframe
          src={pdfUrl}
          className="w-full border border-[var(--border)] rounded"
          style={{ height: "70vh" }}
          title="Project PDF"
        />
      </div>

      {/* Existing Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            Submitted Grades ({reviews.length})
            {avgScore && (
              <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                Avg: {avgScore} / {TOTAL_POINTS}
              </span>
            )}
          </h2>
          <div className="space-y-4">
            {reviews.map(
              (rev: {
                id: string;
                grader_name: string;
                score: number;
                rubric_selections: Record<string, number>;
                additional_comments: string | null;
                created_at: string;
              }) => (
                <div key={rev.id} className="border border-[var(--border)] rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{rev.grader_name}</span>
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                      <span>
                        Score: <strong className="text-[var(--foreground)]">{rev.score}</strong> / {TOTAL_POINTS}
                      </span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Show rubric breakdown */}
                  <div className="text-xs text-[var(--muted)] space-y-1 mb-2">
                    {RUBRIC.flatMap((g) => g.items).map((item) => {
                      const selIdx = rev.rubric_selections[item.id];
                      if (selIdx === undefined) return null;
                      const opt = item.options[selIdx];
                      return (
                        <div key={item.id} className="flex gap-2">
                          <span className="font-medium text-[var(--foreground)] w-12 shrink-0">
                            {item.id.toUpperCase()}:
                          </span>
                          <span className={opt.deduction === 0 ? "" : "text-[var(--danger)]"}>
                            {opt.deduction === 0 ? "Full marks" : `${opt.deduction} — ${opt.comment}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {rev.additional_comments && (
                    <p className="text-sm whitespace-pre-wrap mt-2 pt-2 border-t border-[var(--border)]">
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
        <RubricForm submissionId={id} />
      </section>
    </div>
  );
}
