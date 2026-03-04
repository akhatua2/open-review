import { getSubmission, getPdfUrl } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ submissionId: string; reviewerId: string }>;
}) {
  const { submissionId, reviewerId } = await params;

  const submission = getSubmission(submissionId);
  if (!submission) return notFound();

  const [{ data: reviewer }, { data: existingReview }] = await Promise.all([
    supabase.from("reviewers").select("*").eq("id", reviewerId).single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("submission_id", submissionId)
      .eq("reviewer_id", reviewerId)
      .maybeSingle(),
  ]);

  if (!reviewer) return notFound();
  if (reviewer.submission_id !== submissionId) return notFound();

  const pdfUrl = getPdfUrl(submission.pdf_file);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {submission.authors} &middot; Reviewer: {reviewer.name}
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

      {/* Review section */}
      {existingReview ? (
        <div className="border border-[var(--border)] rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Your Review</span>
            <span className="text-sm text-[var(--muted)]">
              Score: <strong className="text-[var(--foreground)]">{existingReview.score}</strong> / 10
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{existingReview.comments}</p>
          <p className="text-xs text-[var(--muted)] mt-3">
            Submitted {new Date(existingReview.created_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Submit Your Review</h2>
          <ReviewForm submissionId={submissionId} reviewerId={reviewerId} />
        </div>
      )}
    </div>
  );
}
