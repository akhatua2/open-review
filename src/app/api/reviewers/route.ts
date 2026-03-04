import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { submission_id, name, email } = body;

  if (!submission_id || !name || !email) {
    return NextResponse.json(
      { error: "submission_id, name, and email are required" },
      { status: 400 }
    );
  }

  // Check existing reviewer count
  const { count } = await supabase
    .from("reviewers")
    .select("*", { count: "exact", head: true })
    .eq("submission_id", submission_id);

  if (count !== null && count >= 2) {
    return NextResponse.json(
      { error: "This submission already has 2 reviewers" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviewers")
    .insert({ submission_id, name, email })
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
