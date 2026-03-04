"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignReviewerForm({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/reviewers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: submissionId,
        name: form.get("name"),
        email: form.get("email"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to assign reviewer");
      setSubmitting(false);
      return;
    }

    e.currentTarget.reset();
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">
          Reviewer Name
        </label>
        <input
          name="name"
          required
          className="border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">
          Reviewer Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-3 py-1.5 bg-[var(--accent)] text-white text-sm rounded hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {submitting ? "Adding..." : "Assign Reviewer"}
      </button>
      {error && (
        <span className="text-sm text-[var(--danger)]">{error}</span>
      )}
    </form>
  );
}
