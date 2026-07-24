export interface ProcessPageJobData {
  pageId: number;
  contentHash: string;
}

export interface TextChunk {
  index: number;
  content: string;
  contentHash: string;
  characterCount: number;
  wordCount: number;
}