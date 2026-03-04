"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({
  submissionId,
  reviewerId,
}: {
  submissionId: string;
  reviewerId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: submissionId,
        reviewer_id: reviewerId,
        score: Number(form.get("score")),
        comments: form.get("comments"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit review");
      setSubmitting(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="score" className="block text-sm font-medium mb-1">
          Score (1&ndash;10)
        </label>
        <input
          id="score"
          name="score"
          type="number"
          min={1}
          max={10}
          required
          className="w-24 border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium mb-1">
          Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          rows={8}
          required
          className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] resize-y"
          placeholder="Provide detailed feedback on the project..."
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
