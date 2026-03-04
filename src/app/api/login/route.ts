import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getMentorPasswords(): Record<string, string> {
  try {
    return JSON.parse(process.env.MENTOR_PASSWORDS || "{}");
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // Admin login
  if (username === "admin" && password === process.env.ADMIN_PASSWORD) {
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

  // Mentor login — match name case-insensitively, check their specific password
  const passwords = getMentorPasswords();
  const mentorName = Object.keys(passwords).find(
    (m) => m.toLowerCase() === username.toLowerCase()
  );

  if (mentorName && passwords[mentorName] === password) {
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ role: "mentor", name: mentorName }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
