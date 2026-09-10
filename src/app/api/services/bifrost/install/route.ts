import { install } from "@/lib/services/installers/bifrost";
import { handleServiceInstall } from "@/app/api/services/_shared/installRoute";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleServiceInstall(request, install);
}
