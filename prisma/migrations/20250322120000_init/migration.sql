-- CreateTable
CREATE TABLE "SavedArticle" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pmid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "journal" TEXT,
    "pubDate" TEXT,
    "abstract" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedArticle_sessionId_pmid_key" ON "SavedArticle"("sessionId", "pmid");

-- CreateIndex
CREATE INDEX "SavedArticle_sessionId_idx" ON "SavedArticle"("sessionId");
