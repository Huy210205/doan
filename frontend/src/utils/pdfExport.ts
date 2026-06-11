import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vulnerability } from '../types';

const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
};

export const generatePDFReport = (targetUrl: string, vulnerabilities: Vulnerability[], scanId: string = 'SCN-AUTO') => {
  const doc = new jsPDF('p', 'pt', 'a4');
  
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Bao cao Ra quet Lo hong Bao mat (AI WebSec)", 40, 60);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Ma Quet: ${scanId}`, 40, 90);
  doc.text(`Muc tieu: ${targetUrl}`, 40, 110);
  doc.text(`Ngay Quet: ${new Date().toLocaleString('vi-VN')}`, 40, 130);

  const tableColumn = ["Loai", "Muc do", "Tham so", "Payload", "Khuyen nghi (Tom tat)"];
  const tableRows: any[][] = [];

  vulnerabilities.forEach(v => {
    const recText = removeVietnameseTones(v.recommendation || 'Lien he quan tri vien de xem khuyen nghi.');
    
    const row = [
      removeVietnameseTones(v.type),
      v.level, // mapping severity
      removeVietnameseTones(v.parameter || 'N/A'),
      v.payload || 'N/A',
      recText
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    startY: 180,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 65 },
      2: { cellWidth: 60 },
      3: { cellWidth: 100 },
      4: { cellWidth: 'auto' }
    },
    didParseCell: function (data: any) {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.cell.raw === 'CRITICAL') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'HIGH') {
          data.cell.styles.textColor = [234, 88, 12];
          data.cell.styles.fontStyle = 'bold';
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
