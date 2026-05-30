import { redirect } from "next/navigation";

export function redirectWithSearchParams(targetPath: string, params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    }
  }

  redirect(`${targetPath}${query.size > 0 ? `?${query.toString()}` : ""}`);
}
