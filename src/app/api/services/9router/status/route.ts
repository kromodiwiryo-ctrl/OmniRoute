import { createErrorResponse } from "@/lib/api/errorResponse";

export async function GET(_request: Request = new Request("http://localhost/")): Promise<Response> {
  return createErrorResponse({ status: 501, message: "Not implemented in minimal build profile" });
}
