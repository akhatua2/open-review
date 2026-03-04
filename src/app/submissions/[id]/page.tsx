import { getSubmission, getPdfUrl } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AssignReviewerForm from "./assign-reviewer-form";

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

  const { data: reviewers } = await supabase
    .from("reviewers")
    .select("*")
    .eq("submission_id", id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:reviewers(*)")
    .eq("submission_id", id);

  const pdfUrl = getPdfUrl(submission.pdf_file);

  const avgScore =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / reviews.length).toFixed(1)
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

      {/* Reviewers */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Reviewers ({reviewers?.length ?? 0} / 2)
        </h2>

        {reviewers && reviewers.length > 0 ? (
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
                {reviewers.map((r: { id: string; name: string; email: string }) => {
                  const hasReview = reviews?.some(
                    (rev: { reviewer_id: string }) => rev.reviewer_id === r.id
                  );
                  return (
                    <tr key={r.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-2">{r.name}</td>
                      <td className="px-4 py-2 text-[var(--muted)]">{r.email}</td>
                      <td className="px-4 py-2">
                        {hasReview ? (
                          <span className="text-[var(--success)] text-xs font-medium">Reviewed</span>
                        ) : (
                          <span className="text-[var(--muted)] text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Link href={`/review/${id}/${r.id}`} className="text-xs">
                          {hasReview ? "View" : "Submit Review"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)] mb-4">No reviewers assigned yet.</p>
        )}

        {(!reviewers || reviewers.length < 2) && (
          <AssignReviewerForm submissionId={id} />
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

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(
              (rev: {
                id: string;
                score: number;
                comments: string;
                created_at: string;
                reviewer: { name: string };
              }) => (
                <div key={rev.id} className="border border-[var(--border)] rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{rev.reviewer?.name ?? "Reviewer"}</span>
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
