-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "focusKeywordAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "focusKeywordFr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "focusKeywordAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "focusKeywordFr" TEXT NOT NULL DEFAULT '';
