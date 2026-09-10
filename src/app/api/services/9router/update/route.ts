import { createErrorResponse } from "@/lib/api/errorResponse";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  return createErrorResponse({ status: 501, message: "Not implemented" });
}
