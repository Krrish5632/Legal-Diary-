import { LegalCase, DashboardStats } from '../types';

const STORAGE_KEY = 'legal_diary_cases';

// Split cases into chunks to avoid 5MB limit
const CHUNK_SIZE = 50;

export const storage = {
  getCases: (): LegalCase[] => {
    try {
      // Try chunked storage first
      const count = parseInt(localStorage.getItem(`${STORAGE_KEY}_chunks`) || '0');
      if (count > 0) {
        let all: LegalCase[] = [];
        for (let i = 0; i < count; i++) {
          const chunk = localStorage.getItem(`${STORAGE_KEY}_${i}`);
          if (chunk) all = all.concat(JSON.parse(chunk));
        }
        return all;
      }
      // Fallback to old single key
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCase: (legalCase: LegalCase): void => {
    const cases = storage.getCases();
    const index = cases.findIndex(c => c.id === legalCase.id);
    const now = new Date().toISOString();
    if (index >= 0) {
      cases[index] = { ...legalCase, updatedAt: now };
    } else {
      cases.push({ ...legalCase, createdAt: now, updatedAt: now });
    }
    storage._saveAll(cases);
    window.dispatchEvent(new Event('storage_update'));
  },

  deleteCase: (id: string): void => {
    const cases = storage.getCases().filter(c => c.id !== id);
    storage._saveAll(cases);
    window.dispatchEvent(new Event('storage_update'));
  },

  // Save in chunks of 50 cases
  _saveAll: (cases: LegalCase[]): void => {
    // Clear old chunks
    const oldCount = parseInt(localStorage.getItem(`${STORAGE_KEY}_chunks`) || '0');
    for (let i = 0; i < oldCount; i++) {
      localStorage.removeItem(`${STORAGE_KEY}_${i}`);
    }
    // Save new chunks
    const chunks = Math.ceil(cases.length / CHUNK_SIZE) || 1;
    for (let i = 0; i < chunks; i++) {
      const chunk = cases.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      localStorage.setItem(`${STORAGE_KEY}_${i}`, JSON.stringify(chunk));
    }
    localStorage.setItem(`${STORAGE_KEY}_chunks`, String(chunks));
    // Remove old single key if exists
    localStorage.removeItem(STORAGE_KEY);
  },

  getStats: () => {
    const cases = storage.getCases();
    const today = new Date().toISOString().split('T')[0];
    return {
      totalCases: cases.length,
      todayCases: cases.filter(c => c.nextDate === today).length,
      upcomingHearings: cases.filter(c => c.nextDate > today).length,
      urgentCases: cases.filter(c => c.status === 'Urgent').length,
      completedCases: cases.filter(c => c.status === 'Disposed').length,
    };
  },
};
