import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleCloudChat } = await import("@/lib/pair/chat.server");
    try { return await handleCloudChat(request); }
    catch (error) {
      if (request.signal.aborted) return new Response(null, { status: 499 });
      console.error("Cloud chat request failed", error);
      return Response.json({ message: "Conversation unavailable. Please try again later." }, { status: 503 });
    }
  } } },
});