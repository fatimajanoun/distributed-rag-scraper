export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("scraped_pages", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    url: {
      type: "text",
      notNull: true,
      unique: true,
    },

    title: {
      type: "text",
    },

    raw_html: {
      type: "text",
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

    status_code: {
      type: "integer",
    },

    first_scraped_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    last_scraped_at: {
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

  pgm.createIndex("scraped_pages", "content_hash");
};

export const down = (pgm) => {
  pgm.dropTable("scraped_pages");
};