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
      const competencyRows = category.competencies.map(competency => [
        `  - ${competency.text}`,
        getRatingText(student.assessments[competency.id] ?? Rating.NotTaught),
      ]);
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