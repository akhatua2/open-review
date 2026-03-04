"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function MentorFilter({ mentors }: { mentors: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("mentor") || "";

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val) {
      router.push(`/?mentor=${encodeURIComponent(val)}`);
    } else {
      router.push("/");
    }
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--accent)]"
    >
      <option value="">All Mentors</option>
      {mentors.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
