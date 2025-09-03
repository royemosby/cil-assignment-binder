import { parseNameForLessonInfo } from './assignments_parser';
import { describe, it, expect } from 'vitest';

describe('parseNameForLessonInfo', () => {
  it('parses lesson number, name, and date from a typical string', () => {
    const input =
      'John Doe - Lesson 5: Introduction to JS submitted on2023-06-01T12:00:00.000Z';
    const result = parseNameForLessonInfo(input);
    expect(result).toEqual({
      'Lesson Number': '5',
      'Lesson Name': 'Introduction to JS',
      'Submitted On': '2023-06-01T12:00:00.000Z',
    });
  });

  it('returns nulls for missing lesson number and name', () => {
    const input = 'Jane Doe - Assignment submitted on2023-06-01T12:00:00.000Z';
    const result = parseNameForLessonInfo(input);
    expect(result).toEqual({
      'Lesson Number': null,
      'Lesson Name': null,
      'Submitted On': '2023-06-01T12:00:00.000Z',
    });
  });

  it('returns nulls for missing submitted date', () => {
    const input = 'Jane Doe - Lesson 2: Advanced CSS';
    const result = parseNameForLessonInfo(input);
    expect(result).toEqual({
      'Lesson Number': '2',
      'Lesson Name': 'Advanced CSS',
      'Submitted On': null,
    });
  });

  it('handles lesson numbers with one digit', () => {
    const input =
      'Student - Lesson 7: Loops submitted on2024-01-01T09:30:00.000Z';
    const result = parseNameForLessonInfo(input);
    expect(result['Lesson Number']).toBe('7');
    expect(result['Lesson Name']).toBe('Loops');
    expect(result['Submitted On']).toBe('2024-01-01T09:30:00.000Z');
  });

  it('handles lesson numbers with two digits', () => {
    const input =
      'Student - Lesson 12: Functions submitted on2024-02-01T10:00:00.000Z';
    const result = parseNameForLessonInfo(input);
    expect(result['Lesson Number']).toBe('12');
    expect(result['Lesson Name']).toBe('Functions');
    expect(result['Submitted On']).toBe('2024-02-01T10:00:00.000Z');
  });

  it('returns all nulls for completely unrelated string', () => {
    const input = 'No lesson info here';
    const result = parseNameForLessonInfo(input);
    expect(result).toEqual({
      'Lesson Number': null,
      'Lesson Name': null,
      'Submitted On': null,
    });
  });
});
