// FIX: 'Rating' is used as a value, so it cannot be a type-only import.
import { Rating, type Student, type Subject } from '../types';

// These are expected to be available globally from the scripts in index.html
declare const jspdf: any;

const getRatingText = (rating: Rating): string => {
  switch (rating) {
    case Rating.Excellent: return 'sehr ausgeprägt';
    case Rating.Proficient: return 'ausgeprägt';
    case Rating.Partial: return 'teilweise ausgeprägt';
    case Rating.Low: return 'gering ausgeprägt';
    case Rating.NotTaught: return 'nicht vermittelt';
    default: return '-';
  }
};

const getMajorityRating = (logs: Record<Rating, string[]> | undefined): Rating => {
  if (!logs) return Rating.NotTaught;
  const counts: Array<{ r: Rating; c: number }> = [
    { r: Rating.Excellent, c: logs[Rating.Excellent]?.length || 0 },
    { r: Rating.Proficient, c: logs[Rating.Proficient]?.length || 0 },
    { r: Rating.Partial, c: logs[Rating.Partial]?.length || 0 },
    { r: Rating.Low, c: logs[Rating.Low]?.length || 0 },
    { r: Rating.NotTaught, c: logs[Rating.NotTaught]?.length || 0 },
  ];
  counts.sort((a, b) => b.c - a.c);
  return counts[0].c > 0 ? counts[0].r : Rating.NotTaught;
};

export const generatePdf = (student: Student, subjects: Subject[]): void => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Bewertungsübersicht für ${student.name}`, 14, 22);

  let startY = 30;

  subjects.forEach(subject => {
    const tableData = subject.categories.flatMap(category => {
      // Add a row for the category name
      const categoryRow = [{ content: category.name, colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#f1f5f9' } }];
      const competencyRows = category.competencies.map(competency => {
        const logs = (student.assessments as any)[competency.id] as Record<Rating, string[]> | undefined;
        const majority = getMajorityRating(logs);
        return [
          `  - ${competency.text}`,
          getRatingText(majority),
        ];
      });
      return [categoryRow, ...competencyRows];
    });

    if (startY > 250) { // check for page break
        doc.addPage();
        startY = 20;
    }

    doc.setFontSize(14);
    doc.text(subject.name, 14, startY);
    startY += 8;

    doc.autoTable({
      startY: startY,
      head: [['Kompetenz', 'Bewertung']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: '#475569' },
      didDrawPage: (data: any) => {
        startY = data.cursor.y + 10;
      }
    });
  });

  doc.save(`bewertung_${student.name.replace(/\s/g, '_')}.pdf`);
};