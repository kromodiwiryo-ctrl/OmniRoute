/**
 * GET  /api/tools/agent-bridge/cert   — cert status
 * POST /api/tools/agent-bridge/cert   — trust (install) the cert
 * LOCAL_ONLY: registered in routeGuard.ts
 */
import { z } from "zod";
import { uninstallCert, checkCertInstalled } from "@/mitm/cert/install";
import { resolveMitmDataDir } from "@/mitm/dataDir";
import { getCachedPassword, setCachedPassword } from "@/mitm/manager";
import {
  isMitmSudoPasswordRequired,
  normalizeMitmSudoPasswordInput,
  resolveMitmSudoPassword,
} from "@/mitm/sudoGate";
import path from "path";
import fs from "fs";
import { sanitizeErrorMessage } from "@omniroute/open-sse/utils/error";
import { createErrorResponse } from "@/lib/api/errorResponse";

export const dynamic = "force-dynamic";

// Exported for unit testing. Next.js only treats GET/POST/etc. as route
// handlers; additional named exports are ignored by the App Router.
export const CertTrustBodySchema = z.object({
  sudoPassword: z.string().optional(),
});

function certPath(): string {
  return path.join(resolveMitmDataDir(), "mitm", "server.crt");
}

export async function GET(): Promise<Response> {
  try {
    const crtPath = certPath();
    const exists = fs.existsSync(crtPath);
    const trusted = exists ? await checkCertInstalled(crtPath) : false;
    return Response.json({ exists, trusted, path: exists ? crtPath : null });
  } catch (err) {
    const msg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
    return createErrorResponse({ status: 500, message: msg });
  }
}

export async function POST(_request: Request): Promise<Response> {
  return createErrorResponse({ status: 501, message: "Not implemented in minimal build profile" });
}

/**
 * DELETE /api/tools/agent-bridge/cert — untrust (uninstall) the MITM root CA.
 *
 * OmniRoute keeps the CA installed across normal stop/start to avoid repeated
 * sudo prompts (same as mitmproxy/Charles), so removal is an explicit action.
 * Idempotent: removing an absent cert reports success. (Gap 9 — a persistent
 * always-trusted MITM root CA whose key lives on disk is an attack surface.)
 */
export async function DELETE(request: Request): Promise<Response> {
  const raw = await request.json().catch(() => ({}));
  const parsed = CertTrustBodySchema.safeParse(raw);
  const sudoPassword = resolveMitmSudoPassword(
    parsed.success ? parsed.data.sudoPassword : undefined,
    getCachedPassword()
  );

  if (isMitmSudoPasswordRequired(sudoPassword)) {
    return createErrorResponse({ status: 400, message: "Missing sudoPassword" });
  }

  try {
    const crtPath = certPath();
    if (!fs.existsSync(crtPath)) {
      // No cert on disk → nothing to untrust. Idempotent success.
      return Response.json({ ok: true, trusted: false });
    }
    await uninstallCert(sudoPassword, crtPath);
    const suppliedPassword = parsed.success
      ? normalizeMitmSudoPasswordInput(parsed.data.sudoPassword)
      : "";

    if (process.platform !== "win32" && suppliedPassword) {
      setCachedPassword(suppliedPassword);
    }
    const trusted = await checkCertInstalled(crtPath);
    return Response.json({ ok: true, trusted });
  } catch (err) {
    const msg = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
    return createErrorResponse({ status: 500, message: msg });
  }
}
