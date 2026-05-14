import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LegalCase } from '../types';
import { format } from 'date-fns';

export const pdfGenerator = {
  generateCauseList: (date: string, cases: LegalCase[], advocateName: string) => {
    const doc = new jsPDF() as any;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CAUSE LIST', 105, 18, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Advocate: ${advocateName}`, 105, 27, { align: 'center' });
    doc.text(`Date: ${format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy')}`, 105, 34, { align: 'center' });

    doc.setDrawColor(26, 77, 46);
    doc.setLineWidth(0.8);
    doc.line(15, 39, 195, 39);

    const tableData = cases.map((c, i) => [
      i + 1,
      c.caseNumber || '-',
      `${c.parties.plaintiff} vs ${c.parties.defendant}`,
      c.court.name || '-',
      c.currentProceeding || '-',
      c.notes || '-',
    ]);

    doc.autoTable({
      startY: 44,
      head: [['Sr.', 'Case No.', 'Parties', 'Court', 'Proceeding', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [26, 77, 46], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 }, 1: { cellWidth: 28 }, 2: { cellWidth: 45 },
        3: { cellWidth: 35 }, 4: { cellWidth: 30 }, 5: { cellWidth: 35 },
      },
      margin: { left: 15, right: 15 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 290);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290);
    }

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
        win.document.write(`<iframe src="${dataUri}" style="width:100%;height:100vh;border:none;"></iframe>`);
      }
    }
  },
};
