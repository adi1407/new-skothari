import { cookies } from "next/headers";

export type ServerUiLang = "hi" | "en";

export async function getServerUiLang(): Promise<ServerUiLang> {
  const jar = await cookies();
  const v = jar.get("kn-lang")?.value;
  return v === "en" ? "en" : "hi";
}
