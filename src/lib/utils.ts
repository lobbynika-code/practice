export function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(' '); }
export function pct(correct: number, total: number) { return total === 0 ? 0 : Math.round((correct / total) * 100); }
export function gradeAnswer(selected: string | string[] | null, correct: string | string[], type: string): boolean {
  if (selected == null || selected === '') return false;
  if (type === 'multiple_answer') {
    const a = [...(Array.isArray(selected) ? selected : [selected])].sort().join(',');
    const b = [...(Array.isArray(correct) ? correct : [correct])].sort().join(',');
    return a === b;
  }
  if (type === 'numerical') return Number(selected) === Number(Array.isArray(correct) ? correct[0] : correct);
  if (type === 'true_false') return String(selected).toLowerCase() === String(Array.isArray(correct) ? correct[0] : correct).toLowerCase();
  return String(selected) === String(Array.isArray(correct) ? correct[0] : correct);
}
// Transparent trending score: recent attempts + saves + likes + comments, decayed by age.
export function trendingScore(q: { attempts: number; saves: number; likes: number; comments: number; createdAt: string }): number {
  const ageDays = Math.max(0, (Date.now() - new Date(q.createdAt).getTime()) / 86400000);
  const decay = 1 / (1 + ageDays / 7);
  return Math.round((q.attempts * 1 + q.saves * 3 + q.likes * 2 + q.comments * 4) * decay * 10) / 10;
}
export function computeStreak(activityDates: string[]): number {
  const days = [...new Set(activityDates.map(d => d.slice(0, 10)))].sort().reverse();
  if (!days.length) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000;
    if (diff === 1) streak++; else break;
  }
  return streak;
}
export function pointsForAnswer(correct: boolean, streakBonus = 0) { return correct ? 10 + Math.min(streakBonus, 5) : 1; }
