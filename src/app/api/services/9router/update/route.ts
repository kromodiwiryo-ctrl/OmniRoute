import { createErrorResponse } from "@/lib/api/errorResponse";

export async function POST(): Promise<Response> {
  return createErrorResponse({ status: 501, message: "Not implemented" });
}
