import { z } from "zod";

export const saveScrapedPageSchema = z.object({
  url: z.string().url("Invalid page URL"),

  title: z.string().trim(),

  text: z.string(),

  rawHtml: z.string(),

  statusCode: z
    .number()
    .int()
    .min(100)
    .max(599),
});

export type ValidatedScrapedPage = z.infer<
  typeof saveScrapedPageSchema
>;