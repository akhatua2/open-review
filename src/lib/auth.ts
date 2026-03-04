import { cookies } from "next/headers";

export interface Session {
  role: "admin" | "mentor";
  name: string; // "admin" or mentor name
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get("session")?.value;
  if (!val) return null;
  try {
    return JSON.parse(val) as Session;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
