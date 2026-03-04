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
      <h1 className="text-2xl font-semibold mb-6">Final Projects</h1>

      {!submissions || submissions.length === 0 ? (
        <p className="text-[var(--muted)] text-sm">No projects uploaded yet.</p>
      ) : (
        <div className="border border-[var(--border)] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface)] text-left text-[var(--muted)] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium w-28">Reviewers</th>
                <th className="px-4 py-3 font-medium w-28">Reviews</th>
                <th className="px-4 py-3 font-medium w-32">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const reviewCount = s.reviews?.length ?? 0;
                const reviewerCount = s.reviewers?.length ?? 0;
                return (
                  <tr key={s.id} className="border-t border-[var(--border)] hover:bg-[var(--surface)]">
                    <td className="px-4 py-3">
                      <Link href={`/submissions/${s.id}`} className="font-medium">
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{s.author_name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{reviewerCount} / 2</td>
                    <td className="px-4 py-3">
                      {reviewCount === 2 ? (
                        <span className="text-[var(--success)] text-xs font-medium">Complete</span>
                      ) : reviewCount > 0 ? (
                        <span className="text-xs">{reviewCount} / 2</span>
                      ) : (
                        <span className="text-[var(--muted)] text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
