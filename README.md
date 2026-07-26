# Distributed RAG Web Scraper Framework
A scalable, distributed, fault-tolerant web scraping framework augmented with Retrieval-Augmented Generation (RAG) preparation capabilities.

The system extracts data from multiple websites, processes and indexes collected content, and prepares it for natural-language question answering grounded in scraped sources.

The architecture follows distributed systems principles by separating responsibilities into independent services communicating asynchronously through Redis queues.

**Node.js**, **TypeScript**, **Fastify**, **BullMQ**, **Redis**, and **PostgreSQL**.

The system is designed to crawl websites, extract useful content, process pages asynchronously using distributed workers, store structured data, and prepare documents for future RAG-based search and AI question-answering systems.

---

# 🎥 Project Demonstration

A  demonstration of the system execution is available here:

(https://lh3.google.com/u/0/d/1VSGknzBrnEDQmoF4K1j04-ZNpcRXMcP9=w567-h423-p-k-nu-iv1?auditContext=thumbnail)

# 🚀 Features

- Recursive website crawling
- Same-domain crawling restriction
- Robots.txt compliance checking
- Distributed worker architecture
- Asynchronous processing using queues
- HTML content extraction
- Database persistence
- Text chunking for RAG pipelines
- Embedding generation support
- Scalable worker concurrency
- Monorepo architecture
- Separation of responsibilities between services

---

# 🏗️ System Architecture

The project follows a distributed architecture where each service has a specific responsibility.

```
                                  User
                                   |
                                   |
                                   v
                          +----------------+
                          |   API Server   |
                          |    Fastify     |
                          +----------------+
                                   |
                                   |
                            Create Crawl Job
                                   |
                                   v
                          +----------------+
                          | Redis Queues   |
                          |    BullMQ      |
                          +----------------+
                                   |
        -------------------------------------------------
        |                       |                       |
        v                       v                       v

+----------------+     +----------------+     +----------------+
| Crawler Worker |     | Scraper Worker |     | Processor      |
|                |     |                |     | Worker         |
+----------------+     +----------------+     +----------------+

        |                       |                       |
        |                       |                       |
        v                       v                       v

 Discover URLs          Extract Content          Process Documents
 Check robots.txt       Clean HTML               Split into Chunks
 Manage Crawl Depth     Store Pages              Generate Embeddings


                                   |
                                   v

                         +----------------+
                         |  PostgreSQL DB |
                         |                |
                         | Pages          |
                         | Chunks         |
                         | Metadata       |
                         +----------------+

                                   |
                                   v

                         Future RAG System
                    Vector Search + LLM Answering
```

---

# 🔄 Processing Workflow

## 1. Crawl Request

The process starts when the user sends a URL to the API.

Example:

```
POST /crawl

{
  "url": "https://example.com"
}
```

The API validates the request and creates a new crawling job.

The job is pushed into a Redis queue using BullMQ.

---

# 2. Crawling Phase

## Crawler Worker

The crawler worker is responsible for discovering pages.

Responsibilities:

- Receive crawl jobs from Redis
- Check robots.txt rules
- Visit webpages
- Extract internal links
- Prevent external-domain crawling
- Control maximum crawl depth
- Create scraping jobs

Workflow:

```
Starting URL
      |
      v
Crawler Worker
      |
      |
      +---- Check robots.txt
      |
      +---- Extract links
      |
      +---- Verify same domain
      |
      +---- Create scrape jobs
```

---

# 3. Scraping Phase

## Scraper Worker

The scraper worker extracts meaningful information from webpages.

Responsibilities:

- Fetch webpage content
- Parse HTML
- Remove unnecessary elements
- Extract readable text
- Store pages in PostgreSQL

Workflow:

```
Scrape Job
      |
      v
Scraper Worker
      |
      v
HTML Extraction
      |
      v
Clean Text Content
      |
      v
PostgreSQL Storage
```

Stored information includes:

- URL
- Page title
- Extracted content
- Metadata
- Crawl information

---

# 4. Processing Phase

## Processor Worker

The processor worker prepares scraped data for Retrieval-Augmented Generation.

Responsibilities:

- Retrieve stored pages
- Split documents into smaller chunks
- Generate embeddings
- Store processed chunks

Workflow:

```
Stored Page
      |
      v
Text Processing
      |
      v
Document Chunking
      |
      v
Embedding Generation
      |
      v
RAG Ready Data
```

---

# 🧰 Technologies Used

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| TypeScript | Type-safe development |
| Fastify | REST API framework |
| BullMQ | Distributed job queue management |
| Redis | Queue communication and job storage |

---

## Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Persistent application database |
| node-pg-migrate | Database migration management |

---

## Web Scraping

| Technology | Purpose |
|---|---|
| Cheerio | HTML parsing and extraction |
| Playwright | Dynamic webpage scraping |

---

## Development Tools

| Technology | Purpose |
|---|---|
| Docker | Containerized services |
| Git | Version control |
| npm Workspaces | Monorepo dependency management |

---



# 📦 Queue Architecture

The system uses Redis and BullMQ to communicate between distributed services.

```
                 API

                  |
                  |
                  v

             Redis Queue

                  |
    --------------------------------
    |              |               |

    v              v               v

Crawler        Scraper        Processor
Worker         Worker          Worker
```

Benefits:

- Independent worker scaling
- Parallel execution
- Better fault isolation
- Improved performance
- Easier maintenance

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/fatimajanoun/distributed-rag-scraper.git

cd distributed-rag-scraper
```

---

## Install Dependencies

```bash
npm install
```

---

# 🐳 Start Required Services

Start Redis and PostgreSQL using Docker:

```bash
docker compose up
```

---

# 🗄️ Database Migration

Run database migrations:

```bash
npm run migrate
```

---

# ▶️ Running the Application

The project uses npm workspaces to manage the API, workers, and frontend applications.

## Start API Server

```bash
npm run dev --workspace @rag-scraper/api
```

---

## Start Scraper Worker

```bash
npm run dev --workspace @rag-scraper/scraper-worker
```

---

## Start Processor Worker

```bash
npm run dev --workspace @rag-scraper/processor-worker
```

---

## Start Frontend

```bash
npm run dev --workspace web
```

---

# 🧪 Example Crawl Execution

To start a crawling process, run:

```bash
npm run crawl --workspace @rag-scraper/scraper-worker -- https://example.com
```

The crawling pipeline will:

1. Send the URL to the crawler process.
2. Discover pages according to crawl rules.
3. Extract webpage content.
4. Store scraped pages in PostgreSQL.
5. Process documents into chunks for RAG preparation.

The system will:

1. Create a crawl job
2. Discover pages
3. Extract content
4. Store pages
5. Process documents
6. Prepare data for RAG usage

---

# 📈 Scalability Design

The architecture allows horizontal scaling.

Example:

```
                 Redis Queue

                      |
        --------------------------------

        |              |              |

   Worker 1       Worker 2       Worker 3

```

Additional workers can be added without modifying the API.

---


# 🎯 Project Goals

This project demonstrates:

- Distributed systems concepts
- Asynchronous job processing
- Worker-based architectures
- Web crawling techniques
- Database management
- RAG pipeline preparation
- Scalable backend design

---

# 👩‍💻 Author

**Fatima Janoun**

Computer Science Graduate  
