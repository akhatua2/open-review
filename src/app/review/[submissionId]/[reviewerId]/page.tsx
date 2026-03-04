import { getSubmission, getPdfUrl } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { RUBRIC, TOTAL_POINTS } from "@/lib/rubric";
import { notFound } from "next/navigation";
import ReviewRubricForm from "./review-rubric-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ submissionId: string; reviewerId: string }>;
}) {
  const { submissionId, reviewerId } = await params;

  const submission = getSubmission(submissionId);
  if (!submission) return notFound();

  // reviewerId here is used as the grader identifier in the URL
  // Check if this grader already submitted
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("submission_id", submissionId)
    .eq("grader_name", reviewerId)
    .maybeSingle();

  const pdfUrl = getPdfUrl(submission.pdf_file);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {submission.authors}
        </p>
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

      {existingReview ? (
        <div className="border border-[var(--border)] rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Your Grade</span>
            <span className="text-sm text-[var(--muted)]">
              Score: <strong className="text-[var(--foreground)]">{existingReview.score}</strong> / {TOTAL_POINTS}
            </span>
          </div>
          <div className="text-xs text-[var(--muted)] space-y-1">
            {RUBRIC.flatMap((g) => g.items).map((item) => {
              const selIdx = existingReview.rubric_selections[item.id];
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
          {existingReview.additional_comments && (
            <p className="text-sm whitespace-pre-wrap mt-3 pt-3 border-t border-[var(--border)]">
              {existingReview.additional_comments}
            </p>
          )}
          <p className="text-xs text-[var(--muted)] mt-3">
            Submitted {new Date(existingReview.created_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4">Grade This Submission</h2>
          <ReviewRubricForm submissionId={submissionId} graderName={reviewerId} />
        </div>
      )}
    </div>
  );
}
