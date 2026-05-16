import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LegalCase } from '../types';
import { format } from 'date-fns';

const buildDoc = (date: string, cases: LegalCase[], advocateName: string) => {
  const doc = new jsPDF() as any;

  // Header background
  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text('CAUSE LIST', 105, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(`Advocate: ${advocateName}`, 15, 26);
  doc.text(`Date: ${format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy')}`, 15, 33);
  doc.text(`Total Cases: ${cases.length}`, 150, 26);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 150, 33);

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.8);
  doc.line(15, 42, 195, 42);

  const tableData = cases.map((c, i) => [
    i + 1,
    c.caseNumber || '-',
    `${c.parties.plaintiff} vs ${c.parties.defendant}`,
    c.court.name || '-',
    c.currentProceeding || '-',
    c.status || '-',
  ]);

  doc.autoTable({
    startY: 48,
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
      2: { cellWidth: 55 },
      3: { cellWidth: 38 },
      4: { cellWidth: 30 },
      5: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data: any) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `${advocateName} | Page ${data.pageNumber} of ${pageCount}`,
        105, 290, { align: 'center' }
      );
    },
  });

  return doc;
};

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const pdfGenerator = {
  generateCauseList: async (date: string, cases: LegalCase[], advocateName: string) => {
    if (cases.length === 0) return;
    const doc = buildDoc(date, cases, advocateName);
    const filename = `cause_list_${date}.pdf`;

    try {
      // Try Capacitor Share (works on Android for save + share)
      const { Share } = await import('@capacitor/share');
      const base64 = doc.output('datauristring').split(',')[1];

      // Try Filesystem first
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Documents,
        });
        const uri = await Filesystem.getUri({
          path: filename,
          directory: Directory.Documents,
        });
        await Share.share({
          title: `Cause List — ${date}`,
          text: `Cause list for ${advocateName}`,
          url: uri.uri,
          dialogTitle: 'Save or Share PDF',
        });
        return;
      } catch {
        // Filesystem failed, use share directly
        await Share.share({
          title: `Cause List — ${date}`,
          text: `Cause list for ${advocateName} on ${date}`,
          dialogTitle: 'Share PDF',
        });
        return;
      }
    } catch {
      // Fallback for browser/web
      try {
        saveBlob(doc.output('blob'), filename);
      } catch {
        const win = window.open();
        if (win) {
          win.document.write(
            `<iframe src="${doc.output('datauristring')}" style="width:100%;height:100vh;border:none;"></iframe>`
          );
        }
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
        <!DOCTYPE html><html>
        <head>
          <title>Cause List ${date}</title>
          <style>
            * { margin:0; padding:0; }
            body { background:#fff; }
            iframe { width:100%; height:100vh; border:none; }
          </style>
        </head>
        <body>
          <iframe src="${dataUri}"
            onload="setTimeout(()=>{ window.focus(); window.print(); }, 800)">
          </iframe>
        </body></html>
      `);
      win.document.close();
    }
  },
};
