import type { FastifyInstance } from "fastify";

import {
  answerQuestion,
} from "../services/ragService.js";


export async function askRoutes(
  app: FastifyInstance,
) {

  app.post(
    "/ask",
    async (request, reply) => {

      const body =
        request.body as {
          question?: string;
        };


      if (!body.question) {
        return reply
          .status(400)
          .send({
            error:
              "Question is required",
          });
      }


      const result =
        await answerQuestion(
          body.question,
        );


      return result;
    },
  );
}