import { getAllSubmissions, Submission } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isAdmin())) redirect("/login");
  const submissions = getAllSubmissions();

  // Fetch reviewer and review counts from Supabase
  const { data: reviewers } = await supabase.from("reviewers").select("submission_id");
  const { data: reviews } = await supabase.from("reviews").select("submission_id");

  const reviewerCounts: Record<string, number> = {};
  const reviewCounts: Record<string, number> = {};
  reviewers?.forEach((r) => {
    reviewerCounts[r.submission_id] = (reviewerCounts[r.submission_id] || 0) + 1;
  });
  reviews?.forEach((r) => {
    reviewCounts[r.submission_id] = (reviewCounts[r.submission_id] || 0) + 1;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Final Projects</h1>
        <span className="text-sm text-[var(--muted)]">{submissions.length} submissions</span>
      </div>

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface)] text-left text-[var(--muted)] text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Authors</th>
              <th className="px-4 py-3 font-medium w-32">Mentor</th>
              <th className="px-4 py-3 font-medium w-24">Reviewers</th>
              <th className="px-4 py-3 font-medium w-24">Reviews</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s: Submission) => {
              const rc = reviewerCounts[s.id] || 0;
              const revc = reviewCounts[s.id] || 0;
              return (
                <tr key={s.id} className="border-t border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <Link href={`/submissions/${s.id}`} className="font-medium">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.authors}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.mentor || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{rc} / 2</td>
                  <td className="px-4 py-3">
                    {revc === 2 ? (
                      <span className="text-[var(--success)] text-xs font-medium">Complete</span>
                    ) : revc > 0 ? (
                      <span className="text-xs">{revc} / 2</span>
                    ) : (
                      <span className="text-[var(--muted)] text-xs">Pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
