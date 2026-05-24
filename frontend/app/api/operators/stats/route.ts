import { getAccessToken } from "@/lib/actions/auth.actions";
import { cookies } from "next/headers";

export async function GET() {
  const token = await getAccessToken();
  console.log(token);

  const res = await fetch(`localhost/api/operators/stats/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return new Response(await res.text(), {
    status: res.status,
  });
}
