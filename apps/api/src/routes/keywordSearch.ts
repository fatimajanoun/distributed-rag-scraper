import type { FastifyInstance } from "fastify";
import { searchKeywordChunks } from "@rag-scraper/database";


export async function keywordSearchRoutes(
  app: FastifyInstance,
) {

  app.post(
    "/search/keyword",
    async (request) => {

      const body =
        request.body as {
          query: string;
          limit?: number;
        };


      const results =
        await searchKeywordChunks(
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