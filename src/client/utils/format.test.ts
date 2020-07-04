import {formatNumNice} from './format';

describe('formatNumNice', () => {
  test('should format zero', () => {
    expect(formatNumNice(0)).toBe('0');
  });
  test('should format trillions', () => {
    expect(formatNumNice(1e12)).toBe('1T');
  });
  test('should format billions (round)', () => {
    expect(formatNumNice(8e9)).toBe('8B');
  });
  test('should format billions (float)', () => {
    expect(formatNumNice(8234e6)).toBe('8.23B');
  });
  test('should format billions (float round up)', () => {
    expect(formatNumNice(8236e6)).toBe('8.24B');
  });
  test('should format millions', () => {
    expect(formatNumNice(1e6)).toBe('1M');
  });
  test('should format thousands', () => {
    expect(formatNumNice(1000)).toBe('1K');
  });
  test('should format 999,999 correctly', () => {
    expect(formatNumNice(999999)).toBe('999K');
  });
  test('should format floats correctly', () => {
    expect(formatNumNice(1.27487)).toBe('1.27');
  });
  test('should format floats correctly (round up)', () => {
    expect(formatNumNice(1.27687)).toBe('1.28');
  });
  test('should format negatives correctly', () => {
    expect(formatNumNice(-2634)).toBe('-2.63K');
  });
  test('should format negative floats correctly', () => {
    expect(formatNumNice(-0.121212)).toBe('-0.121');
  });
});
