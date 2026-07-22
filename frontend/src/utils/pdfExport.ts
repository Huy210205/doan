import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vulnerability } from '../types';
import { RobotoRegularBase64 } from './RobotoRegular';

export const generatePDFReport = (targetUrl: string, vulnerabilities: Vulnerability[], scanId: string = 'SCN-AUTO') => {
  const doc = new jsPDF('p', 'pt', 'a4');
  
  // Add Font to VFS
  doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegularBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal", 400, "Identity-H");
  doc.setFont("Roboto", "normal");
  
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Báo cáo Rà quét Lỗ hổng Bảo mật (AI WebSec)", 40, 60);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Mã Quét: ${scanId}`, 40, 90);
  doc.text(`Mục tiêu: ${targetUrl}`, 40, 110);
  doc.text(`Ngày Quét: ${new Date().toLocaleString('vi-VN')}`, 40, 130);

  const tableColumn = ["Loại", "Mức độ", "Tham số", "Payload", "Khuyến nghị (Tóm tắt)", "Giải pháp AI"];
  const tableRows: any[][] = [];

  vulnerabilities.forEach(v => {
    const recText = v.recommendation || 'Liên hệ quản trị viên để xem khuyến nghị.';
    const aiRecText = v.ai_recommendation || 'Chưa có phân tích AI';
    
    const row = [
      v.type,
      v.level, // mapping severity
      v.parameter || 'N/A',
      v.payload || 'N/A',
      recText,
      aiRecText
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    startY: 180,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontStyle: 'normal' },
    styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 60 },
      2: { cellWidth: 50 },
      3: { cellWidth: 70 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 'auto' }
    },
    didParseCell: function (data: any) {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.cell.raw === 'CRITICAL') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'normal';
        } else if (data.cell.raw === 'HIGH') {
          data.cell.styles.textColor = [234, 88, 12];
          data.cell.styles.fontStyle = 'normal';
        } else if (data.cell.raw === 'MEDIUM') {
          data.cell.styles.textColor = [202, 138, 4];
        } else {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    }
  });

  doc.save(`Security_Report_${scanId}.pdf`);
};
