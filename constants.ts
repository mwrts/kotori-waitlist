
import { LanguageOption, LanguageCode, TranslationResult } from './types';

export const TARGET_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];

export const DOCUMENT_LANGUAGES: LanguageOption[] = [
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

export interface DemoSentence {
  lang: string;
  code: LanguageCode;
  tokens: { text: string; trans: string; rom: string; ex: string }[];
}

export const DEMO_SENTENCES: DemoSentence[] = [
  {
    lang: "Japanese",
    code: "ja",
    tokens: [
      { text: "私", trans: "I / Me", rom: "watashi", ex: "私は学生です。" },
      { text: "は", trans: "Topic Marker", rom: "wa", ex: "これは本です。" },
      { text: "毎日", trans: "Every day", rom: "mainichi", ex: "毎日走ります。" },
      { text: "日本語", trans: "Japanese", rom: "nihongo", ex: "日本語は難しいです。" },
      { text: "を", trans: "Object Marker", rom: "o", ex: "水を飲みます。" },
      { text: "勉強しています", trans: "Am studying", rom: "benkyou-shite-imasu", ex: "今、日本語を勉強しています。" }
    ]
  },
  {
    lang: "Spanish",
    code: "es",
    tokens: [
      { text: "Mañana", trans: "Tomorrow", rom: "ma-nya-na", ex: "Mañana es lunes." },
      { text: "voy", trans: "I go", rom: "boy", ex: "Voy al cine." },
      { text: "a", trans: "To", rom: "a", ex: "Voy a casa." },
      { text: "ver", trans: "To see", rom: "ber", ex: "Quiero ver la tele." },
      { text: "una", trans: "A (feminine)", rom: "u-na", ex: "Una manzana roja." },
      { text: "película", trans: "Movie", rom: "pe-li-ku-la", ex: "La película es larga." },
      { text: "con", trans: "With", rom: "kon", ex: "Café con leche." },
      { text: "mis", trans: "My (plural)", rom: "mis", ex: "Mis amigos son locos." },
      { text: "amigos", trans: "Friends", rom: "a-mi-gos", ex: "Hola amigos." }
    ]
  },
  {
    lang: "French",
    code: "fr",
    tokens: [
      { text: "J'aime", trans: "I love / like", rom: "zhem", ex: "J'aime le café." },
      { text: "lire", trans: "To read", rom: "leer", ex: "Je veux lire." },
      { text: "des", trans: "Some (plural)", rom: "day", ex: "Des pommes." },
      { text: "livres", trans: "Books", rom: "leevr", ex: "Les livres sont vieux." },
      { text: "le", trans: "The (masculine)", rom: "luh", ex: "Le chat." },
      { text: "soir", trans: "Evening", rom: "swahr", ex: "Bon soir." }
    ]
  },
  {
    lang: "Chinese",
    code: "zh",
    tokens: [
      { text: "他", trans: "He / Him", rom: "tā", ex: "他是我的老师。" },
      { text: "是", trans: "To be", rom: "shì", ex: "我是学生。" },
      { text: "我", trans: "I / Me", rom: "wǒ", ex: "我很好。" },
      { text: "的", trans: "Possessive Marker", rom: "de", ex: "我的书。" },
      { text: "好", trans: "Good", rom: "hǎo", ex: "好久不见。" },
      { text: "朋友", trans: "Friend", rom: "péngyǒu", ex: "老朋友。" }
    ]
  }
];

export const GRAMMAR_TAGS = [
  "Noun", "Verb", "Adjective", "Adverb", "Particle", "Pronoun", "Preposition", "Conjunction", "Interjection", "Determiner", "Auxiliary"
];

export const LANGUAGE_PRESETS: Record<string, Record<string, TranslationResult>> = {
  ja: {
    "私": {
      translation: "I / Me",
      baseForm: "私",
      romanization: "watashi",
      baseFormRomanization: "watashi",
      exampleSentence: "私は学生です。",
      exampleTranslation: "I am a student.",
      isParticle: false,
      explanation: "Standard polite pronoun for oneself.",
      tags: ["Noun", "Pronoun"]
    }
  },
  zh: {},
  es: {},
  fr: {}
};
