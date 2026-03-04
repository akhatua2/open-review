import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import AssignReviewerForm from "./assign-reviewer-form";

export const dynamic = "force-dynamic";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: submission } = await supabase
    .from("submissions")
    .select(`
      *,
      reviewers(*),
      reviews(*, reviewer:reviewers(*))
    `)
    .eq("id", id)
    .single();

  if (!submission) return notFound();

  const avgScore =
    submission.reviews && submission.reviews.length > 0
      ? (
          submission.reviews.reduce(
            (sum: number, r: { score: number }) => sum + r.score,
            0
          ) / submission.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div>
      <Link href="/" className="text-sm text-[var(--muted)] no-underline hover:text-[var(--foreground)]">
        &larr; All Submissions
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {submission.author_name} &middot; {submission.author_email} &middot;{" "}
          {new Date(submission.created_at).toLocaleDateString()}
        </p>
        {submission.pdf_url && (
          <a
            href={submission.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm px-3 py-1.5 border border-[var(--border)] rounded no-underline hover:bg-[var(--surface)] hover:no-underline text-[var(--foreground)]"
          >
            View PDF
          </a>
        )}
      </div>

      {/* Reviewers */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Reviewers ({submission.reviewers?.length ?? 0} / 2)
        </h2>

        {submission.reviewers && submission.reviewers.length > 0 ? (
          <div className="border border-[var(--border)] rounded overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface)] text-left text-[var(--muted)] text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Review Link</th>
                </tr>
              </thead>
              <tbody>
                {submission.reviewers.map(
                  (r: { id: string; name: string; email: string }) => {
                    const hasReview = submission.reviews?.some(
                      (rev: { reviewer_id: string }) =>
                        rev.reviewer_id === r.id
                    );
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2 text-[var(--muted)]">
                          {r.email}
                        </td>
                        <td className="px-4 py-2">
                          {hasReview ? (
                            <span className="text-[var(--success)] text-xs font-medium">
                              Reviewed
                            </span>
                          ) : (
                            <span className="text-[var(--muted)] text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/review/${submission.id}/${r.id}`}
                            className="text-xs"
                          >
                            {hasReview ? "View" : "Submit Review"}
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)] mb-4">
            No reviewers assigned yet.
          </p>
        )}

        {(!submission.reviewers || submission.reviewers.length < 2) && (
          <AssignReviewerForm submissionId={submission.id} />
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Reviews
          {avgScore && (
            <span className="ml-2 text-sm font-normal text-[var(--muted)]">
              Avg: {avgScore} / 10
            </span>
          )}
        </h2>

        {submission.reviews && submission.reviews.length > 0 ? (
          <div className="space-y-4">
            {submission.reviews.map(
              (rev: {
                id: string;
                score: number;
                comments: string;
                created_at: string;
                reviewer: { name: string };
              }) => (
                <div
                  key={rev.id}
                  className="border border-[var(--border)] rounded p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {rev.reviewer?.name ?? "Reviewer"}
                    </span>
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                      <span>
                        Score: <strong className="text-[var(--foreground)]">{rev.score}</strong> / 10
                      </span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{rev.comments}</p>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
