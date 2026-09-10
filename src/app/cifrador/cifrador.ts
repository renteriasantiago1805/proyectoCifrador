import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CipherCandidate, CipherKind, Crypto } from '../crypto';

@Component({
  selector: 'app-cifrador',
  imports: [CommonModule, FormsModule],
  templateUrl: './cifrador.html',
  styleUrl: './cifrador.css',
})
export class Cifrador {
  private readonly crypto = inject(Crypto);

  readonly asciiPreset = this.crypto.defaultCharacters;
  readonly spanishPreset = `${this.asciiPreset}áéíóúÁÉÍÓÚñÑ¡¿`;
  readonly encryptionResult = signal('');
  readonly decryptionResult = signal<CipherCandidate | null>(null);

  characters = this.asciiPreset;
  plainText = 'La seguridad inicia cuando entendemos como se rompe un cifrado simple.';
  cipherText = '';
  cipherKind: CipherKind = 'caesar';
  shift = 3;

  encrypt(): void {
    const cleanCharacters = this.cleanCharacters().join('');
    const result =
      this.cipherKind === 'caesar'
        ? this.crypto.encryptCaesar(this.plainText, cleanCharacters, this.shift)
        : this.crypto.encryptAtbash(this.plainText, cleanCharacters);

    this.encryptionResult.set(result);
    this.cipherText = result;
    this.decryptionResult.set(null);
  }

  decryptAutomatically(): void {
    const result = this.crypto.detectAndDecrypt(this.cipherText, this.cleanCharacters().join(''));
    this.decryptionResult.set(result);
  }

  useAsciiPreset(): void {
    this.characters = this.asciiPreset;
    this.clampShift();
  }

  useSpanishPreset(): void {
    this.characters = this.spanishPreset;
    this.clampShift();
  }

  missingCharacters(): string[] {
    const alphabet = new Set(this.cleanCharacters());
    const usedText = `${this.plainText}${this.cipherText}`;

    // [9] Detecta caracteres escritos por el usuario que aun no pertenecen al alfabeto de cifrado.
    return Array.from(new Set(Array.from(usedText).filter((character) => !alphabet.has(character))));
  }

  addMissingCharacters(): void {
    const missingCharacters = this.missingCharacters().join('');

    if (missingCharacters.length === 0) {
      return;
    }

    this.characters += missingCharacters;
    this.clampShift();
  }

  maxShift(): number {
    return Math.max(this.cleanCharacters().length - 1, 0);
  }

  minShift(): number {
    return -this.maxShift();
  }

  cleanCharacters(): string[] {
    return this.crypto.normalizeCharacters(this.characters);
  }

  clampShift(): void {
    this.shift = Math.min(Math.max(Math.trunc(this.shift || 0), this.minShift()), this.maxShift());
  }

  detectedLabel(result: CipherCandidate): string {
    return result.kind === 'caesar' ? `Cesar, modulo ${result.shift}` : 'Atbash';
  }
}
