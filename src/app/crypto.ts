import { Injectable } from '@angular/core';

export type CipherKind = 'caesar' | 'atbash';

export interface CipherCandidate {
  kind: CipherKind;
  shift: number | null;
  plainText: string;
  score: number;
  confidence: number;
  ignoredCharacters: string[];
}

@Injectable({
  providedIn: 'root',
})
export class Crypto {
  // Referencia 1
  readonly defaultCharacters = Array.from({ length: 95 }, (_, index) =>
    String.fromCharCode(index + 32),
  ).join('');

  encryptCaesar(text: string, characters: string, shift: number): string {
    const alphabet = this.normalizeCharacters(characters);

    if (alphabet.length < 2) {
      return text;
    }

    // Referencia 2
    return this.transformByIndex(text, alphabet, this.safeShift(shift, alphabet.length));
  }

  decryptCaesar(text: string, characters: string, shift: number): string {
    const alphabet = this.normalizeCharacters(characters);

    if (alphabet.length < 2) {
      return text;
    }

    return this.transformByIndex(text, alphabet, -this.safeShift(shift, alphabet.length));
  }

  encryptAtbash(text: string, characters: string): string {
    const alphabet = this.normalizeCharacters(characters);

    if (alphabet.length < 2) {
      return text;
    }

    // Referencia 3
    return Array.from(text)
      .map((character) => {
        const index = alphabet.indexOf(character);
        return index === -1 ? character : alphabet[alphabet.length - 1 - index];
      })
      .join('');
  }

  decryptAtbash(text: string, characters: string): string {
    return this.encryptAtbash(text, characters);
  }

  detectAndDecrypt(cipherText: string, characters: string): CipherCandidate {
    const alphabet = this.normalizeCharacters(characters);

    if (alphabet.length < 2 || cipherText.trim().length === 0) {
      return {
        kind: 'caesar',
        shift: 0,
        plainText: cipherText,
        score: 0,
        confidence: 0,
        ignoredCharacters: [],
      };
    }

    const normalizedCharacters = alphabet.join('');
    const ignoredCharacters = this.charactersOutsideAlphabet(cipherText, alphabet);
    const textToDecrypt = this.textUsedForDecryption(cipherText, alphabet);

    // Referencia 4
    const candidates: CipherCandidate[] = [
      {
        kind: 'atbash' as const,
        shift: null,
        plainText: this.decryptAtbash(textToDecrypt, normalizedCharacters),
        score: 0,
        confidence: 0,
        ignoredCharacters,
      },
      ...Array.from({ length: alphabet.length }, (_, shift) => ({
        kind: 'caesar' as const,
        shift,
        plainText: this.decryptCaesar(textToDecrypt, normalizedCharacters, shift),
        score: 0,
        confidence: 0,
        ignoredCharacters,
      })),
    ].map((candidate) => ({
      ...candidate,
      score: this.scoreSpanishPlainText(candidate.plainText, alphabet),
    }));

    candidates.sort((first, second) => second.score - first.score);

    const best = candidates[0];
    const runnerUp = candidates[1];
    const difference = runnerUp ? best.score - runnerUp.score : best.score;

    return {
      ...best,
      shift: best.kind === 'caesar' && best.shift !== null ? this.toSignedShift(best.shift, alphabet.length) : null,
      confidence: this.toConfidence(difference, best.score),
    };
  }

  normalizeCharacters(characters: string): string[] {
    return Array.from(new Set(Array.from(characters)));
  }

  private transformByIndex(text: string, alphabet: string[], shift: number): string {
    // Referencia 5
    return Array.from(text)
      .map((character) => {
        const index = alphabet.indexOf(character);

        if (index === -1) {
          return character;
        }

        return alphabet[this.mod(index + shift, alphabet.length)];
      })
      .join('');
  }

  private textUsedForDecryption(text: string, alphabet: string[]): string {
    // Referencia 11
    const allowedCharacters = new Set(alphabet);

    return Array.from(text)
      .filter((character) => allowedCharacters.has(character) || /\s/.test(character))
      .join('');
  }

  private charactersOutsideAlphabet(text: string, alphabet: string[]): string[] {
    const allowedCharacters = new Set(alphabet);

    return Array.from(
      new Set(Array.from(text).filter((character) => !allowedCharacters.has(character) && !/\s/.test(character))),
    );
  }

  private scoreSpanishPlainText(text: string, alphabet: string[]): number {
    // Referencia 6
    const normalized = this.normalizeSpanish(text);
    const letters = normalized.match(/[a-z]/g) ?? [];
    const words = normalized.match(/[a-z]{1,24}/g) ?? [];
    const transformedRatio = this.countCharactersInsideAlphabet(text, alphabet) / Math.max(Array.from(text).length, 1);
    let score = transformedRatio * 15;

    score += this.scoreCommonWords(words);
    score += this.scoreCommonPhrases(normalized);
    score += this.scoreTextShape(normalized, letters, words);
    score += this.scoreReadableSeparators(text, normalized);

    if (letters.length >= 8) {
      score -= this.frequencyPenalty(letters) * 0.18;
    }

    return score;
  }

  private scoreCommonWords(words: string[]): number {
    const commonWords = new Set([
      'a',
      'al',
      'como',
      'con',
      'de',
      'del',
      'el',
      'en',
      'es',
      'esta',
      'este',
      'hay',
      'la',
      'las',
      'lo',
      'los',
      'mas',
      'mensaje',
      'mi',
      'no',
      'para',
      'por',
      'que',
      'se',
      'si',
      'sin',
      'su',
      'texto',
      'un',
      'una',
      'y',
    ]);

    return words.reduce((total, word) => {
      if (commonWords.has(word)) {
        return total + (word.length <= 2 ? 8 : 15);
      }

      if (word.length === 1 && !['a', 'e', 'o', 'y'].includes(word)) {
        return total - 8;
      }

      return total;
    }, 0);
  }

  private scoreCommonPhrases(normalized: string): number {
    const padded = ` ${normalized} `;
    const phraseWeights: Record<string, number> = {
      ' de ': 10,
      ' el ': 10,
      ' en ': 9,
      ' la ': 10,
      ' que ': 14,
      ' se ': 8,
      ' un ': 8,
      ' una ': 10,
      ' y ': 8,
    };

    return Object.entries(phraseWeights).reduce((total, [phrase, weight]) => {
      return total + (padded.split(phrase).length - 1) * weight;
    }, 0);
  }

  private scoreTextShape(normalized: string, letters: string[], words: string[]): number {
    if (normalized.length === 0) {
      return -20;
    }

    const vowelCount = letters.filter((letter) => 'aeiou'.includes(letter)).length;
    const vowelRatio = vowelCount / Math.max(letters.length, 1);
    const spaceRatio = (normalized.match(/\s/g) ?? []).length / Math.max(normalized.length, 1);
    const longConsonantRuns = normalized.match(/[bcdfghjklmnpqrstvwxyz]{5,}/g)?.length ?? 0;
    const averageWordLength = words.reduce((total, word) => total + word.length, 0) / Math.max(words.length, 1);
    let score = 0;

    if (vowelRatio >= 0.32 && vowelRatio <= 0.58) {
      score += 18;
    } else {
      score -= 12;
    }

    if (spaceRatio > 0.08 && spaceRatio < 0.28) {
      score += 10;
    }

    if (averageWordLength >= 2.5 && averageWordLength <= 9) {
      score += 8;
    }

    return score - longConsonantRuns * 12;
  }

  private scoreReadableSeparators(text: string, normalized: string): number {
    // Referencia 7
    const realSpaceRatio = (text.match(/\s/g) ?? []).length / Math.max(text.length, 1);
    const artificialSeparators = (text.match(/[_^`|~{}[\]\\]/g) ?? []).length;
    let score = 0;

    if (realSpaceRatio > 0.08 && realSpaceRatio < 0.28) {
      score += 24;
    }

    if (realSpaceRatio === 0 && normalized.includes(' ')) {
      score -= 28;
    }

    return score - artificialSeparators * 5;
  }

  private frequencyPenalty(letters: string[]): number {
    const spanishFrequencies: Record<string, number> = {
      a: 12.53,
      b: 1.42,
      c: 4.68,
      d: 5.86,
      e: 13.68,
      f: 0.69,
      g: 1.01,
      h: 0.7,
      i: 6.25,
      j: 0.44,
      k: 0.02,
      l: 4.97,
      m: 3.15,
      n: 6.71,
      o: 8.68,
      p: 2.51,
      q: 0.88,
      r: 6.87,
      s: 7.98,
      t: 4.63,
      u: 3.93,
      v: 0.9,
      w: 0.01,
      x: 0.22,
      y: 0.9,
      z: 0.52,
    };

    return Object.entries(spanishFrequencies).reduce((penalty, [letter, expectedPercent]) => {
      const observed = letters.filter((value) => value === letter).length;
      const expected = (expectedPercent / 100) * letters.length;
      return penalty + Math.pow(observed - expected, 2) / Math.max(expected, 0.01);
    }, 0);
  }

  private normalizeSpanish(text: string): string {
    return text
      .toLocaleLowerCase('es-MX')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private countCharactersInsideAlphabet(text: string, alphabet: string[]): number {
    return Array.from(text).filter((character) => alphabet.includes(character)).length;
  }

  private toConfidence(difference: number, score: number): number {
    if (score <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(99, Math.round((difference / Math.max(Math.abs(score), 1)) * 100)));
  }

  private safeShift(shift: number, alphabetLength: number): number {
    return this.mod(Math.trunc(Number.isFinite(shift) ? shift : 0), alphabetLength);
  }

  private toSignedShift(shift: number, alphabetLength: number): number {
    // Referencia 8
    const normalizedShift = this.safeShift(shift, alphabetLength);
    const halfLength = Math.floor(alphabetLength / 2);

    return normalizedShift > halfLength ? normalizedShift - alphabetLength : normalizedShift;
  }

  private mod(value: number, modulo: number): number {
    return ((value % modulo) + modulo) % modulo;
  }
}
