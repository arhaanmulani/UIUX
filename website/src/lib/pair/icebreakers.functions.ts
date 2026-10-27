import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader, setResponseStatus } from "@tanstack/react-start/server";
import { icebreakerInputSchema } from "./icebreakers";

export const suggestIcebreakers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => icebreakerInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateIcebreakers } = await import("./icebreakers.server");
    setResponseHeader("Cache-Control", "no-store");
    const result = await generateIcebreakers(data, getRequest());
    if (result.status !== 200) setResponseStatus(result.status);
    return result;
  });