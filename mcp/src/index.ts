import { createMcpHandler } from "agents/mcp/server";
import { landingHtml } from "./landing";
import { createServer, type WorkerEnv } from "./server";

export default {
  fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp" || url.pathname === "/sse") {
      return createMcpHandler((context) => createServer(env, context.requestInfo ?? request), {
        route: url.pathname,
      })(request, env, ctx);
    }

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        name: "wpcom-mcp",
        mcp: `${url.origin}/mcp`,
      });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(landingHtml(url.origin), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<WorkerEnv>;
