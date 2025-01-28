import { describe, expect, test } from 'bun:test';
import { sanitizeFileName } from '../src/utils/file';

describe('sanitizeFileName', () => {
  test('converts to lowercase', () => {
    expect(sanitizeFileName('MyFile.jpg')).toBe('myfile.jpg');
  });

  test('replaces spaces with hyphens', () => {
    expect(sanitizeFileName('my file.jpg')).toBe('my-file.jpg');
  });

  test('removes special characters', () => {
    expect(sanitizeFileName('my@file#1.jpg')).toBe('my-file-1.jpg');
  });

  test('collapses multiple hyphens', () => {
    expect(sanitizeFileName('my---file.jpg')).toBe('my-file.jpg');
  });

  test('removes leading and trailing hyphens', () => {
    expect(sanitizeFileName('-myfile-.jpg')).toBe('myfile.jpg');
  });

  test('replaces dots in filename with hyphens but preserves extension', () => {
    expect(sanitizeFileName('my.awesome.file.jpg')).toBe('my-awesome-file.jpg');
  });

  test('handles multiple dots in extension', () => {
    expect(sanitizeFileName('my.file.tar.gz')).toBe('my-file.tar.gz');
  });
});
