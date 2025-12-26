
export type LanguageCode = 'en' | 'pt' | 'fr' | 'es' | 'ja' | 'zh';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
}

export enum WordStatus {
  NONE = 'none',
  LEARNING = 'learning',
  LEARNED = 'learned'
}

/**
 * Added missing interface for translation data used by Gemini service and WordPopup
 */
export interface TranslationResult {
  translation: string;
  baseForm: string;
  romanization: string;
  baseFormRomanization: string;
  exampleSentence: string;
  exampleTranslation: string;
  isParticle?: boolean;
  explanation?: string;
  tags: string[];
}

/**
 * Added missing interface for saved words in local storage/state
 */
export interface SavedWord extends TranslationResult {
  surfaceForm: string;
  status: WordStatus;
}

/**
 * Added missing interface for document management within the application
 */
export interface DocumentFile {
  id: string;
  name: string;
  docLang: LanguageCode;
  targetLang: LanguageCode;
  content: string;
  createdAt: number;
  lastReadAt: number;
  tokens: string[];
}
