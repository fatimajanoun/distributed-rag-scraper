import { generateEmbedding } from "./embeddings/generateEmbedding.js";

const embedding = await generateEmbedding(
  "Hello world!",
);

console.log("Dimensions:", embedding.length);
console.log(
  "First 10 values:",
  embedding.slice(0, 10),
);