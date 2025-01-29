import { describe, expect, test } from 'bun:test';
import { sanitizeFileName } from '../src/utils/file';

describe('sanitizeFileName', () => {
  test('collapses multiple hyphens', () => {
    expect(sanitizeFileName('my---file.jpg')).toBe('my-file.jpg');
  });
});
