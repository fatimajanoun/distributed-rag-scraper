import type { FastifyInstance } from "fastify";

import {
  findAllScrapedPages,
  findScrapedPageById,
} from "@rag-scraper/database";


export async function pagesRoutes(
  app: FastifyInstance,
) {


  app.get(
    "/pages",
    async (request) => {

      const query =
        request.query as {
          limit?: string;
          offset?: string;
        };


      const pages =
        await findAllScrapedPages(
          Number(query.limit ?? 20),
          Number(query.offset ?? 0),
        );


      return {
        pages,
        pagination: {
          limit: Number(query.limit ?? 20),
          offset: Number(query.offset ?? 0),
        },
      };
    },
  );



  app.get(
    "/pages/:id",
    async (
      request,
      reply,
    ) => {

      const params =
        request.params as {
          id: string;
        };


      const page =
        await findScrapedPageById(
          Number(params.id),
        );


      if (!page) {
        return reply
          .status(404)
          .send({
            error: "Page not found",
          });
      }


      return page;
    },
  );
}