import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllSubmissions } from "@/lib/submissions";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Admin login
  if (username === "admin" && password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ role: "admin", name: "admin" }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  }

  // Mentor login — username is the mentor name (case-insensitive), same password
  if (password === adminPassword) {
    const submissions = getAllSubmissions();
    const mentors = [...new Set(submissions.map((s) => s.mentor).filter(Boolean))] as string[];
    const match = mentors.find(
      (m) => m.toLowerCase() === username.toLowerCase()
    );

    if (match) {
      const cookieStore = await cookies();
      cookieStore.set("session", JSON.stringify({ role: "mentor", name: match }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
