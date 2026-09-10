import {
  elevenLabsOptionsResponse,
  proxyElevenLabsRequest,
} from "@/app/api/v1/_shared/elevenLabsProxy";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return elevenLabsOptionsResponse();
}

export async function GET(request: Request) {
  return proxyElevenLabsRequest(request, "/voices");
}
