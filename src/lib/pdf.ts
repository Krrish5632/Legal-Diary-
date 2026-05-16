import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LegalCase } from '../types';
import { format } from 'date-fns';

const buildDoc = (date: string, cases: LegalCase[], advocateName: string) => {
  const doc = new jsPDF() as any;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CAUSE LIST', 105, 18, { align: 'center' });

  doc.setDrawColor(26, 77, 46);
  doc.setLineWidth(0.5);
  doc.line(15, 22, 195, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Advocate: ${advocateName}`, 15, 30);
  doc.text(`Date: ${format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy')}`, 15, 37);
  doc.text(`Total Cases: ${cases.length}`, 150, 30);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 150, 37);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 42, 195, 42);

  const tableData = cases.map((c, i) => [
    i + 1,
    c.caseNumber || '-',
    `${c.parties.plaintiff}\nvs\n${c.parties.defendant}`,
    c.court.name || '-',
    c.currentProceeding || '-',
    c.status || '-',
  ]);

  doc.autoTable({
    startY: 46,
    head: [['Sr.', 'Case No.', 'Parties', 'Court', 'Stage', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 77, 46],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      3: { cellWidth: 38 },
      4: { cellWidth: 32 },
      5: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data: any) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(advocateName, 15, 290);
    },
  });

  return doc;
};

export const pdfGenerator = {
  generateCauseList: (date: string, cases: LegalCase[], advocateName: string) => {
    if (cases.length === 0) return;
    const doc = buildDoc(date, cases, advocateName);
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cause_list_${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      const dataUri = doc.output('datauristring');
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${dataUri}" style="width:100%;height:100vh;border:none;"></iframe>`
        );
      }
    }
  },

  printCauseList: (date: string, cases: LegalCase[], advocateName: string) => {
    if (cases.length === 0) return;
    const doc = buildDoc(date, cases, advocateName);
    const dataUri = doc.output('datauristring');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cause List - ${date}</title>
          <style>
            body { margin: 0; }
            iframe { width: 100%; height: 100vh; border: none; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <iframe src="${dataUri}" onload="setTimeout(()=>{ window.print(); }, 500)"></iframe>
        </body>
        </html>
      `);
      win.document.close();
    }
  },
};
