import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { submission_id, grader_name, score, rubric_selections, additional_comments } = body;

  if (!submission_id || !grader_name || score === undefined || !rubric_selections) {
    return NextResponse.json(
      { error: "submission_id, grader_name, score, and rubric_selections are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({ submission_id, grader_name, score, rubric_selections, additional_comments: additional_comments || null })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
