import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ submissionId: string; reviewerId: string }>;
}) {
  const { submissionId, reviewerId } = await params;

  const [{ data: submission }, { data: reviewer }, { data: existingReview }] =
    await Promise.all([
      supabase.from("submissions").select("*").eq("id", submissionId).single(),
      supabase.from("reviewers").select("*").eq("id", reviewerId).single(),
      supabase
        .from("reviews")
        .select("*")
        .eq("submission_id", submissionId)
        .eq("reviewer_id", reviewerId)
        .maybeSingle(),
    ]);

  if (!submission || !reviewer) return notFound();

  return (
    <div className="max-w-xl">
      <Link
        href={`/submissions/${submissionId}`}
        className="text-sm text-[var(--muted)] no-underline hover:text-[var(--foreground)]"
      >
        &larr; Back to Submission
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold">Review</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          <strong>{submission.title}</strong> &middot; Reviewer: {reviewer.name}
        </p>
      </div>

      {existingReview ? (
        <div className="border border-[var(--border)] rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Your Review</span>
            <span className="text-sm text-[var(--muted)]">
              Score: <strong className="text-[var(--foreground)]">{existingReview.score}</strong> / 10
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">
            {existingReview.comments}
          </p>
        </div>
      ) : (
        <ReviewForm submissionId={submissionId} reviewerId={reviewerId} />
      )}
    </div>
  );
}
