import { searchSimilarChunks } from "@rag-scraper/database";
import { generateEmbedding } from "../../api/src/embeddings/generateEmbedding.js";

const question = "What is this website about?";


const queryEmbedding = await generateEmbedding(question);


const results = await searchSimilarChunks(
  queryEmbedding,
  3,
);


console.log("Retrieved chunks:", results);
console.log("Number of results:", results.length);
for (const chunk of results) {
  console.log("-------------------");
  console.log("Distance:", chunk.distance);
  console.log(chunk.content);
}