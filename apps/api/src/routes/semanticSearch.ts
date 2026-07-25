import type { FastifyInstance } from "fastify";

import { semanticSearch } from "../rag/semanticSearch.js";

export async function searchRoutes(
  app: FastifyInstance,
) {
  app.post(
    "/search/semantic",
    async (request) => {

      const body =
        request.body as {
          query: string;
          limit?: number;
        };

      const results =
        await semanticSearch(
          body.query,
          body.limit ?? 5,
        );

      return {
        query: body.query,
        results,
      };
    },
  );
}