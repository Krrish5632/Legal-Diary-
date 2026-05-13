/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CourtType {
  CIVIL = 'Civil Court',
  CRIMINAL = 'Criminal Court',
  FAMILY = 'Family Court',
  REVENUE = 'Revenue Court',
  HIGH = 'High Court',
  SUPREME = 'Supreme Court',
  TRIBUNAL = 'Tribunal',
}

export enum CaseStatus {
  PENDING = 'Pending',
  DISPOSED = 'Disposed',
  URGENT = 'Urgent',
}

export enum ProceedingType {
  EVIDENCE = 'Evidence',
  ARGUMENT = 'Argument',
  BAIL = 'Bail',
  CROSS_EXAMINATION = 'Cross Examination',
  SUMMON = 'Summon',
  FRAMING_OF_CHARGE = 'Framing of Charge',
  FINAL_HEARING = 'Final Hearing',
  ORDER = 'Order',
  MISCELLANEOUS = 'Miscellaneous',
  CUSTOM = 'Custom',
}

export interface CourtDetails {
  name: string;
  number: string;
  judgeName: string;
  district: string;
  state: string;
  type: CourtType;
}

export interface PartyDetails {
  plaintiff: string;
  defendant: string;
  versus: string;
  advocateName: string;
  oppositeCounsel: string;
  tags: string[];
}

export interface LegalSections {
  policeStation: string;
  firNumber: string;
  ipcSections: string[];
  crpcSections: string[];
  evidenceActSections: string[];
  sections?: string; // For string-based input
}

export interface CaseHistoryEntry {
  date: string;
  proceeding: string;
  notes: string;
  nextDate?: string;
  orders?: string[];
}

export interface LegalCase {
  id: string;
  caseType: string;
  caseNumber: string;
  filingYear: number;
  court: CourtDetails;
  parties: PartyDetails;
  legalSections: LegalSections;
  currentProceeding: ProceedingType;
  nextDate: string;
  status: CaseStatus;
  history: CaseHistoryEntry[];
  notes: string;
  voiceNotes: string[]; // URLs or base64
  documents: string[]; // URLs or base64
  priority: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCases: number;
  todayCases: number;
  upcomingHearings: number;
  urgentCases: number;
  completedCases: number;
}
