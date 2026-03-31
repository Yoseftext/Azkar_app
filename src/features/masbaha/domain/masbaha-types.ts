export interface MasbahaState {
  isInitialized: boolean;
  isSilent: boolean;
  currentTarget: number;
  currentSessionCount: number;
  totalCount: number;
  selectedPhrase: string;
  customPhrases: string[];
  dailyCounts: Record<string, number>;
}

export interface PersistedMasbahaState extends Omit<MasbahaState, 'isInitialized'> {}
