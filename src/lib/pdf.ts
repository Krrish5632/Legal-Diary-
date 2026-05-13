/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LegalCase } from '../types';
import { format } from 'date-fns';

export const pdfGenerator = {
  generateCauseList: (date: string, cases: LegalCase[], advocateName: string) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.text('CAUSE LIST', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Advocate: ${advocateName}`, 105, 30, { align: 'center' });
    doc.text(`Date: ${format(new Date(date), 'PPP')}`, 105, 40, { align: 'center' });

    // Table
    const tableData = cases.map((c, i) => [
      i + 1,
      c.caseNumber,
      `${c.parties.plaintiff} vs ${c.parties.defendant}`,
      c.court.name,
      c.currentProceeding,
      c.notes || '-'
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Sr.', 'Case No.', 'Parties', 'Court', 'Proceeding', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: '#1a4d2e' }, // Dark Green theme
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 20, 285);
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    doc.save(`cause_list_${date}.pdf`);
  }
};
