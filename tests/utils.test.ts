import { describe, it, expect } from 'vitest';
import { gradeAnswer, pct, trendingScore, computeStreak, pointsForAnswer } from '../src/lib/utils';
describe('gradeAnswer', () => {
  it('grades multiple choice', () => { expect(gradeAnswer('a', ['a'], 'multiple_choice')).toBe(true); expect(gradeAnswer('b', ['a'], 'multiple_choice')).toBe(false); });
  it('grades multiple answer order-insensitively', () => { expect(gradeAnswer(['b','a'], ['a','b'], 'multiple_answer')).toBe(true); expect(gradeAnswer(['a'], ['a','b'], 'multiple_answer')).toBe(false); });
  it('grades numerical and true/false', () => { expect(gradeAnswer('42', ['42'], 'numerical')).toBe(true); expect(gradeAnswer('true', ['True'], 'true_false')).toBe(true); expect(gradeAnswer(null, ['a'], 'multiple_choice')).toBe(false); });
});
describe('pct / points', () => { it('computes percentage safely', () => { expect(pct(1,2)).toBe(50); expect(pct(0,0)).toBe(0); }); it('awards points', () => { expect(pointsForAnswer(true)).toBe(10); expect(pointsForAnswer(false)).toBe(1); }); });
describe('trendingScore', () => { it('ranks engaged recent questions higher', () => { const now = new Date().toISOString(); const a = trendingScore({ attempts: 100, saves: 10, likes: 5, comments: 2, createdAt: now }); const b = trendingScore({ attempts: 1, saves: 0, likes: 0, comments: 0, createdAt: now }); expect(a).toBeGreaterThan(b); }); });
describe('computeStreak', () => { it('counts consecutive days', () => { const today = new Date().toISOString(); const y = new Date(Date.now()-86400000).toISOString(); const y2 = new Date(Date.now()-2*86400000).toISOString(); expect(computeStreak([today, y, y2])).toBe(3); expect(computeStreak([])).toBe(0); }); });
