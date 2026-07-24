export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("scraped_page_versions", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    page_id: {
      type: "bigint",
      notNull: true,
      references: "scraped_pages",
      onDelete: "CASCADE",
    },

    version_number: {
      type: "integer",
      notNull: true,
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

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createConstraint(
    "scraped_page_versions",
    "scraped_page_versions_page_version_unique",
    {
      unique: ["page_id", "version_number"],
    },
  );

  pgm.createIndex("scraped_page_versions", "page_id");
  pgm.createIndex("scraped_page_versions", "content_hash");
};

export const down = (pgm) => {
  pgm.dropTable("scraped_page_versions");
};