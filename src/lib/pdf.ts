import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LegalCase } from '../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const buildDoc = (title: string, cases: LegalCase[], advocateName: string, subtitle?: string) => {
  const doc = new jsPDF() as any;

  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, 210, 48, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text(title, 105, 16, { align: 'center' });

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text(subtitle, 105, 24, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(`Advocate: ${advocateName}`, 15, subtitle ? 32 : 26);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, subtitle ? 38 : 32);
  doc.text(`Total Cases: ${cases.length}`, 155, subtitle ? 32 : 26);

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.8);
  doc.line(15, 44, 195, 44);

  const tableData = cases.map((c, i) => [
    i + 1,
    c.caseNumber || '-',
    `${c.parties.plaintiff} vs ${c.parties.defendant}`,
    c.court.name || '-',
    c.nextDate ? format(new Date(c.nextDate + 'T00:00:00'), 'dd/MM/yyyy') : '-',
    c.currentProceeding || '-',
    c.status || '-',
  ]);

  doc.autoTable({
    startY: 48,
    head: [['Sr.', 'Case No.', 'Parties', 'Court', 'Next Date', 'Stage', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [26, 77, 46], textColor: 255, fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 52 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 25 },
      6: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 12, right: 12 },
    didDrawPage: (data: any) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`${advocateName} | Page ${data.pageNumber} of ${pageCount}`, 105, 290, { align: 'center' });
    },
  });

  return doc;
};

const downloadPDF = async (doc: any, filename: string) => {
  // Method 1: Web Share API (works best on Android)
  try {
    const blob = doc.output('blob');
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename.replace('.pdf', '') });
      return;
    }
  } catch { /* continue */ }

  // Method 2: Blob URL download
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
    return;
  } catch { /* continue */ }

  // Method 3: Data URI fallback (opens PDF in browser/viewer)
  const dataUri = doc.output('datauristring');
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(`
      <html><head><title>${filename}</title></head>
      <body style="margin:0">
        <iframe src="${dataUri}" style="width:100%;height:100vh;border:none"></iframe>
      </body></html>
    `);
    win.document.close();
  } else {
    window.location.href = dataUri;
  }
};

export const pdfGenerator = {
  generateCauseList: async (date: string, cases: LegalCase[], advocateName: string) => {
    if (cases.length === 0) return;
    const formattedDate = format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy');
    const doc = buildDoc('DAILY CAUSE LIST', cases, advocateName, `Date: ${formattedDate}`);
    await downloadPDF(doc, `cause_list_${date}.pdf`);
  },

  generateMonthlyCauseList: async (month: Date, cases: LegalCase[], advocateName: string) => {
    if (cases.length === 0) return;
    const monthStr = format(month, 'MMMM yyyy');
    const doc = buildDoc('MONTHLY CAUSE LIST', cases, advocateName, `Month: ${monthStr}`);
    await downloadPDF(doc, `cause_list_${format(month, 'yyyy-MM')}.pdf`);
  },

  printCauseList: (date: string, cases: LegalCase[], advocateName: string) => {
    if (cases.length === 0) return;
    const formattedDate = format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy');
    const doc = buildDoc('CAUSE LIST', cases, advocateName, `Date: ${formattedDate}`) as any;
    const dataUri = doc.output('datauristring');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html><html><head><title>Print - ${formattedDate}</title>
        <style>*{margin:0}iframe{width:100%;height:100vh;border:none}</style></head>
        <body><iframe src="${dataUri}" onload="setTimeout(()=>{window.print()},800)"></iframe>
        </body></html>
      `);
      win.document.close();
    }
  },
};
