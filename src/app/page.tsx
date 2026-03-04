import { getAllSubmissions, Submission } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { TOTAL_POINTS } from "@/lib/rubric";
import { redirect } from "next/navigation";
import Link from "next/link";
import MentorFilter from "./mentor-filter";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mentor?: string }>;
}) {
  if (!(await isAdmin())) redirect("/login");

  const { mentor } = await searchParams;
  const allSubmissions = getAllSubmissions();

  // Get unique mentors for the filter
  const mentors = [
    ...new Set(allSubmissions.map((s) => s.mentor).filter(Boolean) as string[]),
  ].sort();

  // Filter by mentor if selected
  const submissions = mentor
    ? allSubmissions.filter((s) => s.mentor === mentor)
    : allSubmissions;

  const { data: reviews } = await supabase.from("reviews").select("submission_id, score");

  const reviewData: Record<string, { count: number; avgScore: number }> = {};
  reviews?.forEach((r) => {
    if (!reviewData[r.submission_id]) {
      reviewData[r.submission_id] = { count: 0, avgScore: 0 };
    }
    reviewData[r.submission_id].count++;
    reviewData[r.submission_id].avgScore += r.score;
  });
  Object.values(reviewData).forEach((d) => {
    d.avgScore = Math.round((d.avgScore / d.count) * 100) / 100;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Final Projects</h1>
        <div className="flex items-center gap-3">
          <MentorFilter mentors={mentors} />
          <span className="text-sm text-[var(--muted)]">{submissions.length} submissions</span>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface)] text-left text-[var(--muted)] text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Authors</th>
              <th className="px-4 py-3 font-medium w-32">Mentor</th>
              <th className="px-4 py-3 font-medium w-24">Grades</th>
              <th className="px-4 py-3 font-medium w-24">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s: Submission) => {
              const rd = reviewData[s.id];
              return (
                <tr key={s.id} className="border-t border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <Link href={`/submissions/${s.id}`} className="font-medium">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.authors}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.mentor || "—"}</td>
                  <td className="px-4 py-3">
                    {rd ? (
                      rd.count >= 2 ? (
                        <span className="text-[var(--success)] text-xs font-medium">Complete ({rd.count})</span>
                      ) : (
                        <span className="text-xs">{rd.count} / 2</span>
                      )
                    ) : (
                      <span className="text-[var(--muted)] text-xs">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {rd ? (
                      <span className="text-sm">{rd.avgScore} / {TOTAL_POINTS}</span>
                    ) : (
                      <span className="text-[var(--muted)] text-xs">—</span>
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
