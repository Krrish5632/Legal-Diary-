/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LegalCase } from '../types';

const STORAGE_KEY = 'legal_diary_cases';

export const storage = {
  getCases: (): LegalCase[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCase: (legalCase: LegalCase): void => {
    const cases = storage.getCases();
    const index = cases.findIndex(c => c.id === legalCase.id);
    if (index >= 0) {
      cases[index] = { ...legalCase, updatedAt: new Date().toISOString() };
    } else {
      cases.push({ ...legalCase, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    window.dispatchEvent(new Event('storage_update'));
  },

  deleteCase: (id: string): void => {
    const cases = storage.getCases().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    window.dispatchEvent(new Event('storage_update'));
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
  }
};
