import { getAllSubmissions, Submission } from "@/lib/submissions";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
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
  const session = await getSession();
  if (!session) redirect("/login");

  const { mentor: mentorParam } = await searchParams;
  const allSubmissions = getAllSubmissions();

  // Get unique mentors for the filter (admin only)
  const mentors = [
    ...new Set(allSubmissions.map((s) => s.mentor).filter(Boolean) as string[]),
  ].sort();

  // Filter submissions based on role
  let submissions: Submission[];
  if (session.role === "mentor") {
    // Mentors only see their assigned papers
    submissions = allSubmissions.filter((s) => s.mentor === session.name);
  } else if (mentorParam) {
    submissions = allSubmissions.filter((s) => s.mentor === mentorParam);
  } else {
    submissions = allSubmissions;
  }

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
        <div>
          <h1 className="text-2xl font-semibold">
            {session.role === "mentor" ? `${session.name}'s Papers` : "Final Projects"}
          </h1>
          {session.role === "mentor" && (
            <p className="text-sm text-[var(--muted)] mt-1">
              Logged in as mentor
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {session.role === "admin" && <MentorFilter mentors={mentors} />}
          <span className="text-sm text-[var(--muted)]">{submissions.length} submissions</span>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface)] text-left text-[var(--muted)] text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Authors</th>
              {session.role === "admin" && <th className="px-4 py-3 font-medium w-32">Mentor</th>}
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
                  {session.role === "admin" && (
                    <td className="px-4 py-3 text-[var(--muted)]">{s.mentor || "—"}</td>
                  )}
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
