-- DropForeignKey
ALTER TABLE "DeckTag" DROP CONSTRAINT "DeckTag_deckId_fkey";

-- DropForeignKey
ALTER TABLE "DeckTag" DROP CONSTRAINT "DeckTag_tagId_fkey";

-- AddForeignKey
ALTER TABLE "DeckTag" ADD CONSTRAINT "DeckTag_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckTag" ADD CONSTRAINT "DeckTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
