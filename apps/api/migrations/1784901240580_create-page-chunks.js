export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createExtension("vector", {
    ifNotExists: true,
  });
  pgm.createTable("page_chunks", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    page_id: {
      type: "bigint",
      notNull: true,
      references: "scraped_pages(id)",
      onDelete: "CASCADE",
    },

    chunk_index: {
      type: "integer",
      notNull: true,
    },

    content: {
      type: "text",
      notNull: true,
    },

    content_hash: {
      type: "varchar(64)",
      notNull: true,
    },

    character_count: {
      type: "integer",
      notNull: true,
    },

    word_count: {
      type: "integer",
      notNull: true,
    },

     embedding: {
      type: "vector(768)",
      notNull: false,
    },

    embedded_at: {
      type: "timestamptz",
      notNull: false,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.addConstraint(
    "page_chunks",
    "page_chunks_page_chunk_unique",
    {
      unique: ["page_id", "chunk_index"],
    }
  );

  pgm.createIndex("page_chunks", "page_id");
  pgm.createIndex("page_chunks", "content_hash");
};

export const down = (pgm) => {
  pgm.dropTable("page_chunks");
};