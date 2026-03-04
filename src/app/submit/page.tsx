"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/submissions", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/submissions/${id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Submit Final Project</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Project Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="author_name" className="block text-sm font-medium mb-1">
            Author Name
          </label>
          <input
            id="author_name"
            name="author_name"
            type="text"
            required
            className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="author_email" className="block text-sm font-medium mb-1">
            Author Email
          </label>
          <input
            id="author_email"
            name="author_email"
            type="email"
            required
            className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="pdf" className="block text-sm font-medium mb-1">
            Project Report (PDF)
          </label>
          <input
            id="pdf"
            name="pdf"
            type="file"
            accept="application/pdf"
            required
            className="w-full text-sm text-[var(--muted)] file:mr-3 file:px-3 file:py-1.5 file:border file:border-[var(--border)] file:rounded file:text-sm file:bg-[var(--surface)] file:text-[var(--foreground)] file:cursor-pointer"
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
          {submitting ? "Submitting..." : "Submit Project"}
        </button>
      </form>
    </div>
  );
}
