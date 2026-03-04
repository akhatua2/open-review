import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { submission_id, reviewer_id, score, comments } = body;

  if (!submission_id || !reviewer_id || !score || !comments) {
    return NextResponse.json(
      { error: "submission_id, reviewer_id, score, and comments are required" },
      { status: 400 }
    );
  }

  if (score < 1 || score > 10) {
    return NextResponse.json(
      { error: "Score must be between 1 and 10" },
      { status: 400 }
    );
  }

  // Check if this reviewer already submitted a review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("submission_id", submission_id)
    .eq("reviewer_id", reviewer_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "This reviewer has already submitted a review" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({ submission_id, reviewer_id, score, comments })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
