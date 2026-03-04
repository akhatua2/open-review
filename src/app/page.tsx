import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      reviewers(id),
      reviews(id)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Final Projects</h1>
        <Link
          href="/submit"
          className="text-sm px-4 py-2 bg-[var(--accent)] text-white no-underline rounded hover:bg-[var(--accent-hover)] hover:no-underline"
        >
          New Submission
        </Link>
      </div>

      {!submissions || submissions.length === 0 ? (
        <p className="text-[var(--muted)] text-sm">
          No projects yet. <Link href="/submit">Submit the first project.</Link>
        </p>
      ) : (
        <div className="border border-[var(--border)] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface)] text-left text-[var(--muted)] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium w-28">Reviewers</th>
                <th className="px-4 py-3 font-medium w-28">Reviews</th>
                <th className="px-4 py-3 font-medium w-32">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-t border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <Link href={`/submissions/${s.id}`} className="font-medium">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.author_name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.reviewers?.length ?? 0} / 2</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.reviews?.length ?? 0}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
