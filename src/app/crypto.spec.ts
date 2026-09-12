import { TestBed } from '@angular/core/testing';

import { Crypto } from './crypto';

describe('Crypto', () => {
  let service: Crypto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Crypto);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('encrypts and decrypts Caesar with a custom alphabet', () => {
    const alphabet = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const plainText = 'La seguridad';
    const cipherText = service.encryptCaesar(plainText, alphabet, 7);

    expect(cipherText).not.toBe(plainText);
    expect(service.decryptCaesar(cipherText, alphabet, 7)).toBe(plainText);
  });

  it('supports negative Caesar shifts', () => {
    const plainText = 'la seguridad se analiza con frecuencia';
    const cipherText = service.encryptCaesar(plainText, service.defaultCharacters, -3);
    const result = service.detectAndDecrypt(cipherText, service.defaultCharacters);

    expect(service.decryptCaesar(cipherText, service.defaultCharacters, -3)).toBe(plainText);
    expect(result.kind).toBe('caesar');
    expect(result.shift).toBe(-3);
    expect(result.plainText).toBe(plainText);
  });

  it('keeps Atbash reversible', () => {
    const plainText = 'mensaje seguro';
    const cipherText = service.encryptAtbash(plainText, service.defaultCharacters);

    expect(cipherText).not.toBe(plainText);
    expect(service.decryptAtbash(cipherText, service.defaultCharacters)).toBe(plainText);
  });

  it('detects a Caesar shift automatically', () => {
    const plainText = 'el mensaje de seguridad se descifra con analisis de frecuencia';
    const cipherText = service.encryptCaesar(plainText, service.defaultCharacters, 4);
    const result = service.detectAndDecrypt(cipherText, service.defaultCharacters);

    expect(result.kind).toBe('caesar');
    expect(result.shift).toBe(4);
    expect(result.plainText).toBe(plainText);
  });

  it('detects Atbash automatically', () => {
    const plainText = 'la informacion se protege con metodos modernos';
    const cipherText = service.encryptAtbash(plainText, service.defaultCharacters);
    const result = service.detectAndDecrypt(cipherText, service.defaultCharacters);

    expect(result.kind).toBe('atbash');
    expect(result.plainText).toBe(plainText);
  });

  it('encrypts and decrypts uncommon symbols when they are in the alphabet', () => {
    const alphabet = ' abc𓁨𓁞ñ¿€Z';
    const plainText = 'a𓁨 ñ€';
    const cipherText = service.encryptCaesar(plainText, alphabet, 3);

    expect(cipherText).not.toBe(plainText);
    expect(service.decryptCaesar(cipherText, alphabet, 3)).toBe(plainText);
  });

  it('removes characters outside the alphabet during automatic detection', () => {
    const plainText = 'el mensaje de seguridad se descifra con frecuencia';
    const extraText = '𓁨𓁞';
    const cipherText = `${service.encryptCaesar(plainText, service.defaultCharacters, 4)}${extraText}`;
    const result = service.detectAndDecrypt(cipherText, service.defaultCharacters);

    expect(result.kind).toBe('caesar');
    expect(result.shift).toBe(4);
    expect(result.plainText).toBe(plainText);
    expect(result.ignoredCharacters).toContain('𓁨');
  });
});
