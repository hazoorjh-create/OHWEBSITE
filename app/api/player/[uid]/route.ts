import { NextResponse } from "next/server";
import { buildProfile } from "@/lib/profile";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params;
  const result = await buildProfile(uid);

  if (result.status === "bad") {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }
  if (result.status === "notfound") {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }
  return NextResponse.json(result.data);
}
