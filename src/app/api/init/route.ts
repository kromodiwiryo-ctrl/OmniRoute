import { ensureCloudSyncInitialized } from "@/lib/initCloudSync";

export const dynamic = "force-dynamic";

// This API route is called automatically to initialize sync
export async function GET() {
  const initialized = await ensureCloudSyncInitialized();
  return Response.json({ initialized });
}
