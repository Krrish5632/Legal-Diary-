import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LegalCase } from '../types';

export const exportCasePDF = (c: LegalCase) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Legal Diary', 14, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('Case Report', 14, 28);

  // Divider line
  doc.setDrawColor(200);
  doc.line(14, 32, 196, 32);

  // Case title
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(
    `${c.parties.plaintiff} vs ${c.parties.defendant}`,
    14, 44
  );

  // Basic details table
  autoTable(doc, {
    startY: 50,
    head: [['Field', 'Details']],
    body: [
      ['Case Number', c.caseNumber],
      ['Case Type', c.caseType],
      ['Status', c.status],
      ['Court', c.court.name],
      ['Next Hearing', c.nextDate],
      ['Current Proceeding', c.currentProceeding],
      ['Plaintiff', c.parties.plaintiff],
      ['Defendant', c.parties.defendant],
    ],
    headStyles: {
      fillColor: [22, 163, 74], // legal-green
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
    },
  });

  // Notes section (if exists)
  if (c.notes) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text('Notes', 14, finalY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    const lines = doc.splitTextToSize(c.notes, 175);
    doc.text(lines, 14, finalY + 8);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(160);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN')} · Legal Diary`,
    14,
    pageHeight - 10
  );

  // Save / Download
  const fileName = `${c.caseNumber.replace(/\//g, '-')}_${c.parties.plaintiff}.pdf`;
  doc.save(fileName);
};
