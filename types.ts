
export enum FormatType {
  PASCAL_CASE = 'PascalCase',
  CAMEL_CASE = 'camelCase'
}

export interface TranslationResult {
  original: string;
  translated: string;
  formatted: string;
  timestamp: number;
}

export interface GeminiResponse {
  translations: {
    original: string;
    translated: string;
  }[];
}
