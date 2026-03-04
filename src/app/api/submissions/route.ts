import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const author_name = formData.get("author_name") as string;
  const author_email = formData.get("author_email") as string;
  const pdf = formData.get("pdf") as File | null;

  if (!title || !author_name || !author_email) {
    return NextResponse.json(
      { error: "Title, author name, and email are required" },
      { status: 400 }
    );
  }

  let pdf_url: string | null = null;

  if (pdf && pdf.size > 0) {
    const filename = `${Date.now()}-${pdf.name}`;
    const buffer = Buffer.from(await pdf.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("papers")
      .upload(filename, buffer, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `PDF upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("papers")
      .getPublicUrl(filename);

    pdf_url = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({ title, author_name, author_email, pdf_url })
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
