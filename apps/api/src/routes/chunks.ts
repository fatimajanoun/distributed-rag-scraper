import type { FastifyInstance } from "fastify";

import {
  findChunksByPageId,
  findScrapedPageById,
} from "@rag-scraper/database";


export async function chunksRoutes(
  app: FastifyInstance,
) {

  app.get(
    "/pages/:id/chunks",
    async (
      request,
      reply,
    ) => {

      const params =
        request.params as {
          id: string;
        };


      const pageId = Number(params.id);


      if (Number.isNaN(pageId)) {
        return reply.status(400).send({
          error: "Invalid page id",
        });
      }


      const page =
        await findScrapedPageById(pageId);


      if (!page) {
        return reply.status(404).send({
          error: "Page not found",
        });
      }


      const chunks =
        await findChunksByPageId(pageId);


      return {
        pageId,
        chunks,
      };
    },
  );

}