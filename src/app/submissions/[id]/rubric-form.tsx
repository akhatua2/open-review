"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RUBRIC, TOTAL_POINTS, computeScore } from "@/lib/rubric";

export default function RubricForm({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [graderName, setGraderName] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentScore = computeScore(selections);

  // Check all items are selected
  const allItems = RUBRIC.flatMap((g) => g.items);
  const allSelected = allItems.every((item) => selections[item.id] !== undefined);

  function select(itemId: string, optionIdx: number) {
    setSelections((prev) => ({ ...prev, [itemId]: optionIdx }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allSelected || !graderName.trim()) return;

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: submissionId,
        grader_name: graderName.trim(),
        score: currentScore,
        rubric_selections: selections,
        additional_comments: additionalComments.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit");
      setSubmitting(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Your Name</label>
        <input
          value={graderName}
          onChange={(e) => setGraderName(e.target.value)}
          required
          placeholder="e.g. Nevin George"
          className="border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] w-64"
        />
      </div>

      <div className="space-y-6">
        {RUBRIC.map((group) => (
          <div key={group.id}>
            <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--border)]">
              {group.label}
              <span className="ml-2 font-normal text-[var(--muted)]">{group.maxPoints} pts</span>
            </h3>

            <div className="space-y-4">
              {group.items.map((item) => {
                const isSubItem = group.items.length > 1;
                return (
                  <div key={item.id} className={isSubItem ? "pl-4" : ""}>
                    {isSubItem && (
                      <p className="text-sm font-medium mb-2">
                        {item.label}
                        <span className="ml-2 font-normal text-[var(--muted)]">{item.maxPoints} pts</span>
                      </p>
                    )}
                    <div className="space-y-1">
                      {item.options.map((opt, idx) => {
                        const isSelected = selections[item.id] === idx;
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-2 px-3 py-2 rounded cursor-pointer text-sm transition-colors ${
                              isSelected
                                ? "bg-blue-50 border border-[var(--accent)]"
                                : "hover:bg-[var(--surface)] border border-transparent"
                            }`}
                          >
                            <input
                              type="radio"
                              name={item.id}
                              checked={isSelected}
                              onChange={() => select(item.id, idx)}
                              className="mt-0.5 shrink-0"
                            />
                            <span className="flex-1">
                              <span
                                className={`font-mono text-xs mr-2 ${
                                  opt.deduction === 0
                                    ? "text-[var(--success)]"
                                    : "text-[var(--danger)]"
                                }`}
                              >
                                {opt.deduction === 0 ? "0" : opt.deduction.toString()}
                              </span>
                              {opt.comment}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Additional comments */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">Additional Comments (optional)</label>
        <textarea
          value={additionalComments}
          onChange={(e) => setAdditionalComments(e.target.value)}
          rows={4}
          className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] resize-y"
          placeholder="Any additional feedback..."
        />
      </div>

      {/* Score summary and submit */}
      <div className="mt-6 flex items-center gap-4">
        <div className="text-sm">
          Score: <strong className="text-lg">{currentScore}</strong>
          <span className="text-[var(--muted)]"> / {TOTAL_POINTS}</span>
        </div>
        <button
          type="submit"
          disabled={submitting || !allSelected || !graderName.trim()}
          className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Grade"}
        </button>
        {error && <span className="text-sm text-[var(--danger)]">{error}</span>}
      </div>
    </form>
  );
}
