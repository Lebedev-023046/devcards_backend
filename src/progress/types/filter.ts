import { CardType } from '@prisma/client';

export type ProgressFilter = 'all' | 'learned' | 'inProgress' | 'notStarted';

export interface CardStatus {
  cardId: string;
  question: string;
  type: CardType;
  attemptCount: number;
  correctCount: number;
  lastReviewedAt: Date | null;
}

export interface DeckProgress {
  aggregate: {
    totalCards: number;
    learned: number;
    inProgress: number;
    notStarted: number;
  };
  details: CardStatus[];
}
