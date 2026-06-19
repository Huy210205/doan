import { Vulnerability } from '../types';

export const generateHTMLReport = (targetUrl: string, vulnerabilities: Vulnerability[], scanId: string = 'SCN-AUTO') => {
  const currentDate = new Date().toLocaleString('vi-VN');
  
  // Tính toán số liệu biểu đồ
  const crit = vulnerabilities.filter(v => v.level === 'CRITICAL').length;
  const high = vulnerabilities.filter(v => v.level === 'HIGH').length;
  const med = vulnerabilities.filter(v => v.level === 'MEDIUM').length;
  const low = vulnerabilities.filter(v => v.level === 'LOW').length;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo cáo Bảo mật - ${scanId}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-w-5xl; margin: 0 auto; padding: 40px; background-color: #f8fafc; }
        .header { text-align: center; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0f172a; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 30px; display: flex; justify-content: space-between; }
        .info-item { text-align: center; }
        .info-value { font-size: 1.2em; font-weight: bold; color: #0284c7; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .summary-card { flex: 1; padding: 20px; border-radius: 8px; text-align: center; color: white; font-weight: bold; font-size: 1.2em; }
        .bg-crit { background: #dc2626; }
        .bg-high { background: #ea580c; }
        .bg-med { background: #ca8a04; }
        .bg-low { background: #16a34a; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 0.85em; }
        tr:hover { background-color: #f8fafc; }
        .level-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; color: white; display: inline-block; text-align: center; width: 70px; }
        .payload-box { background: #f1f5f9; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.9em; word-break: break-all; border: 1px solid #cbd5e1; }
        .footer { text-align: center; margin-top: 50px; font-size: 0.9em; color: #64748b; }
        @media print { body { padding: 0; background-color: #fff; } .info-box, table { box-shadow: none; border: 1px solid #e2e8f0; } }
    </style>
</head>
<body>

    <div class="header">
        <h1>BÁO CÁO KIỂM THỬ BẢO MẬT TỰ ĐỘNG</h1>
        <p>Hệ thống Đánh giá Lỗ hổng Trí tuệ Nhân tạo (AI WebSec)</p>
    </div>

    <div class="info-box">
        <div class="info-item">
            <div>Mã Báo Cáo</div>
            <div class="info-value">${scanId}</div>
        </div>
        <div class="info-item">
            <div>Mục tiêu Rà Quét</div>
            <div class="info-value">${targetUrl}</div>
        </div>
        <div class="info-item">
            <div>Thời gian Báo cáo</div>
            <div class="info-value">${currentDate}</div>
        </div>
    </div>

    <h2 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">1. Tổng Quan Điểm Yếu</h2>
    <div class="summary">
        <div class="summary-card bg-crit">CRITICAL<br>${crit}</div>
        <div class="summary-card bg-high">HIGH<br>${high}</div>
        <div class="summary-card bg-med">MEDIUM<br>${med}</div>
        <div class="summary-card bg-low">LOW<br>${low}</div>
    </div>

    <h2 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 40px;">2. Chi tiết Lỗ hổng</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 5%">STT</th>
                <th style="width: 15%">Loại Lỗi</th>
                <th style="width: 15%">Mức độ</th>
                <th style="width: 15%">Tham số</th>
                <th style="width: 25%">Payload (Mã độc)</th>
                <th style="width: 25%">Khuyến nghị</th>
            </tr>
        </thead>
        <tbody>
            ${vulnerabilities.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: #16a34a; font-weight: bold;">Hệ thống an toàn, không phát hiện lỗ hổng.</td></tr>' : ''}
            ${vulnerabilities.map((v, index) => {
                let badgeClass = '';
                if (v.level === 'CRITICAL') badgeClass = 'bg-crit';
                else if (v.level === 'HIGH') badgeClass = 'bg-high';
                else if (v.level === 'MEDIUM') badgeClass = 'bg-med';
                else badgeClass = 'bg-low';

                return `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: bold; color: #0f172a;">${v.type}</td>
                    <td><span class="level-badge ${badgeClass}">${v.level}</span></td>
                    <td style="font-family: monospace; color: #b45309;">${v.parameter || 'N/A'}</td>
                    <td><div class="payload-box">${v.payload ? v.payload.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'N/A'}</div></td>
                    <td style="font-size: 0.9em;">${v.recommendation || 'Không có mô tả'}</td>
                </tr>
                `;
            }).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Báo cáo được tạo tự động bởi AI WebSec. Vui lòng tham vấn chuyên gia bảo mật để xác thực các lỗ hổng trên.</p>
    </div>

</body>
</html>
  `;

  // Tạo file download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Security_Report_${scanId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
