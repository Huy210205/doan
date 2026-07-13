import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Trash2, Calendar, Shield, ExternalLink, Printer, Check, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScanHistoryItem, Vulnerability } from '../types';
import contentData from '../data/contentData.json';
import api from '../api';
import { generatePDFReport } from '../utils/pdfExport';
import { generateHTMLReport } from '../utils/htmlExport';

interface HistoryViewProps {
  activeTab?: string;
  historyList?: ScanHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
}

export default function HistoryView({ activeTab, onDeleteHistoryItem }: HistoryViewProps) {
  const { vulnerability_severities } = contentData;
  const [searchTerm, setSearchTerm] = useState('');

  const [apiHistoryList, setApiHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected single audit states for Modal Overlays
  const [selectedAuditForView, setSelectedAuditForView] = useState<any | null>(null);
  const [vulnsData, setVulnsData] = useState<Vulnerability[]>([]);
  const [isLoadingVulns, setIsLoadingVulns] = useState(false);
  // States for PDF downloading
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // States for Delete Modal and Toast
  const [itemToDelete, setItemToDelete] = useState<{ raw_id: number, id: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (activeTab === 'history' || activeTab === undefined) {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/scans');
      setApiHistoryList(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVulnerabilities = async (rawId: number) => {
    setIsLoadingVulns(true);
    try {
      const res = await api.get(`/scans/${rawId}/vulnerabilities`);
      const mappedFindings: Vulnerability[] = res.data.map((v: any) => ({
        id: `vuln-${v.id}`,
        type: v.type,
        url: v.url || 'N/A',
        level: v.severity.toUpperCase(),
        confidence: `${Math.round((v.confidence || 0.9) * 100)}%`,
        description: v.description || 'Chi tiết lỗi do AI dự đoán.',
        parameter: v.param,
        payload: v.payload,
        evidence: v.evidence,
        recommendation: v.recommendation,
        code_block: v.code_snippet || '// Liên hệ admin để xem code hướng dẫn'
      }));
      setVulnsData(mappedFindings);
    } catch (err) {
      console.error('Failed to fetch vulnerabilities', err);
      setVulnsData([]);
    } finally {
      setIsLoadingVulns(false);
    }
  };

  const handleView = (item: any) => {
    setSelectedAuditForView(item);
    fetchVulnerabilities(item.raw_id);
  };

  const handlePdf = async (item: any) => {
    setDownloadingPdfId(item.id);
    try {
      const res = await api.get(`/scans/${item.raw_id}/vulnerabilities`);
      const mappedFindings: Vulnerability[] = res.data.map((v: any) => ({
        id: `vuln-${v.id}`,
        type: v.type,
        level: v.severity.toUpperCase(),
        parameter: v.param,
        payload: v.payload,
        recommendation: v.recommendation,
      }));
      generatePDFReport(item.url, mappedFindings, item.id);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Lỗi tải báo cáo PDF!');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleHtml = async (item: any) => {
    setDownloadingPdfId(item.id + '_html'); // Dùng chung state loading cho tiện
    try {
      const res = await api.get(`/scans/${item.raw_id}/vulnerabilities`);
      const mappedFindings: Vulnerability[] = res.data.map((v: any) => ({
        id: `vuln-${v.id}`,
        type: v.type,
        level: v.severity.toUpperCase(),
        parameter: v.param,
        payload: v.payload,
        recommendation: v.recommendation,
      }));
      generateHTMLReport(item.url, mappedFindings, item.id);
    } catch (err) {
      console.error('Failed to generate HTML', err);
      alert('Lỗi tải báo cáo HTML!');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleDeleteClick = (rawId: number, id: string) => {
    setItemToDelete({ raw_id: rawId, id });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/scans/${itemToDelete.raw_id}`);
      onDeleteHistoryItem(itemToDelete.id);
      setApiHistoryList(prev => prev.filter(item => item.id !== itemToDelete.id));
      setToastMessage({ text: `Đã xóa lịch sử ${itemToDelete.id} thành công!`, type: 'success' });
    } catch (err) {
      console.error('Failed to delete scan', err);
      setToastMessage({ text: 'Lỗi xóa lịch sử quét!', type: 'error' });
    } finally {
      setItemToDelete(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Filter list by target url
  const filteredHistory = apiHistoryList.filter(item =>
    item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="history-view" className="space-y-6 animate-fadeIn py-6 px-8 max-w-7xl mx-auto w-full">
      {/* View Title */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-cyber-text-main">
            Lịch sử Quét & Báo cáo PDF
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            Bản ghi an ninh toàn diện và báo cáo đề xuất phòng ngừa nguy cơ cho quản trị viên.
          </p>
        </div>
      </div>

      {/* Audit control search tool */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input
          id="search-audit-input"
          type="text"
          className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-cyber-border/80 transition-all placeholder-slate-400 dark:placeholder-slate-500 font-mono"
          placeholder="Tìm kiếm URL mục tiêu hoặc mã SCN-000..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Primary Historical Listings Grid */}
      <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-cyber-border/60">
          <h3 className="text-sm font-semibold text-cyber-text-main">Lịch sử thiết lập và rà quét</h3>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border/80 text-[11px] font-mono font-bold uppercase tracking-wider text-cyber-text-muted bg-cyber-card-light/50">
                <th className="py-4 px-6">Mã Quét</th>
                <th className="py-4 px-6">Mục tiêu (Target URL)</th>
                <th className="py-4 px-6 text-center">Thời gian</th>
                <th className="py-4 px-6 text-center">Số lỗi phát hiện</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-cyber-text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyber-blue" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-cyber-text-muted text-xs font-mono">
                    Danh sách tìm kiếm trống hoặc chưa thực hiện lần quét nào.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-cyber-card-light/40 transition-colors duration-150"
                  >
                    <td className="py-4.5 px-6 font-semibold font-mono text-cyan-600 dark:text-cyan-400">
                      {item.id}
                    </td>
                    <td className="py-4.5 px-6 font-mono text-cyber-text-main select-all max-w-xs truncate">
                      <div className="flex items-center gap-2 group">
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-cyber-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-center font-mono text-cyber-text-muted text-xs">
                      {item.date}
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      {item.status === 'running' ? (
                        <span className="inline-block bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold text-xs animate-pulse">
                          Đang chạy...
                        </span>
                      ) : item.vulns === 0 ? (
                        <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold text-xs">
                          An toàn
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 px-2.5 py-0.5 rounded-full font-mono font-black text-xs">
                          {item.vulns} LỖI
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : item.status === 'running' ? 'bg-blue-500 animate-ping' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium ${item.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : item.status === 'running' ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>{item.status}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleView(item)}
                          disabled={item.status === 'running'}
                          className="px-3 py-1.5 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20 hover:text-white transition-all duration-200 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        <button
                          onClick={() => handlePdf(item)}
                          disabled={downloadingPdfId === item.id || item.status === 'running'}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 hover:text-white transition-all duration-200 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                        >
                          {downloadingPdfId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => handleHtml(item)}
                          disabled={downloadingPdfId === item.id + '_html' || item.status === 'running'}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 hover:text-white transition-all duration-200 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                        >
                          {downloadingPdfId === item.id + '_html' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                          <span>HTML</span>
                        </button>

                        <button
                          onClick={() => handleDeleteClick(item.raw_id, item.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 hover:bg-red-500/20 hover:text-white transition-all duration-200 text-xs font-semibold flex items-center cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Drawer Popup ("Xem" details) */}
      {selectedAuditForView && (
        <div id="view-details-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl glass-panel h-full shadow-2xl flex flex-col justify-between animate-slideLeft z-50">

            <div className="p-6 border-b border-cyber-border flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">
                  CHI TIẾT RÀ QUÉT :: {selectedAuditForView.id}
                </span>
                <h2 className="text-lg font-bold text-cyber-text-main break-all">
                  {selectedAuditForView.url}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAuditForView(null)}
                className="p-2 text-cyber-text-muted hover:text-cyber-text-main rounded-lg hover:bg-cyber-card-light transition-all cursor-pointer hover:scale-110"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-cyber-card-light/45 border border-cyber-border/70 rounded-xl">
                <div>
                  <span className="text-[10px] font-mono text-cyber-text-muted block mb-0.5 uppercase font-bold">Thời gian quét</span>
                  <span className="text-sm font-mono text-cyber-text-main font-semibold">{selectedAuditForView.date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyber-text-muted block mb-0.5 uppercase font-bold">Lỗ hổng phát hiện</span>
                  <span className="text-sm font-mono font-bold text-yellow-600 dark:text-yellow-500">{selectedAuditForView.vulns} rủi ro</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-cyber-text-muted">Danh sách hiểm họa an ninh</h3>

                {isLoadingVulns ? (
                  <div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" /></div>
                ) : vulnsData.length === 0 ? (
                  <div className="text-center p-10 bg-cyber-card-light/40 border border-dashed border-cyber-border rounded-xl">
                    <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-mono text-cyber-text-muted">Website an toàn, không phát hiện lỗ hổng.</span>
                  </div>
                ) : (
                  vulnsData.map(vuln => {
                    let levelBadgeClass = '';
                    switch (vuln.level) {
                      case 'CRITICAL':
                        levelBadgeClass = 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400';
                        break;
                      case 'HIGH':
                        levelBadgeClass = 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400';
                        break;
                      case 'MEDIUM':
                        levelBadgeClass = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400';
                        break;
                      case 'LOW':
                        levelBadgeClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                        break;
                    }
                    return (
                      <div key={vuln.id} className="p-5 border border-cyber-border/80 bg-cyber-card-light/30 rounded-xl space-y-3 shadow-sm hover:scale-[1.005] duration-200 transition-transform">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-cyber-text-main text-sm">{vuln.type}</h4>
                          <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-full font-black ${levelBadgeClass}`}>
                            {vulnerability_severities[vuln.level as keyof typeof vulnerability_severities]?.label || vuln.level}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-cyber-text-main space-y-1 bg-cyber-input-bg p-2.5 rounded-lg border border-cyber-border/40">
                          <p className="break-all" title={vuln.url}>URL: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{vuln.url}</span></p>
                          <p className="truncate">Tham số: <span className="text-yellow-600 dark:text-yellow-500 font-semibold">{vuln.parameter}</span></p>
                          <p className="truncate">Mã kiểm thử: <span className="text-rose-600 dark:text-rose-400 font-semibold">{vuln.payload}</span></p>
                        </div>
                        <div className="space-y-1 p-3 bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-xl shadow-inner mt-2">
                          <h4 className="text-[10px] font-bold uppercase font-mono tracking-wider text-red-500 flex items-center gap-1.5">
                            Bằng chứng rà quét (Scanner proof)
                          </h4>
                          <p className="text-[10px] font-mono text-cyber-text-main break-all leading-relaxed whitespace-pre-wrap">
                            {vuln.evidence || 'Phát hiện lỗ hổng dựa trên kết quả HTTP Response.'}
                          </p>
                        </div>
                        <div className="text-xs text-cyber-text-muted leading-relaxed pt-1.5">
                          <span className="font-bold text-cyber-text-main block mb-1">Khuyến nghị điều chỉnh:</span>
                          {vuln.recommendation}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 border-t border-cyber-border bg-cyber-card-light/40 flex justify-end">
              <button
                onClick={() => setSelectedAuditForView(null)}
                className="px-5 py-2.5 bg-cyber-card border border-cyber-border text-cyber-text-main hover:bg-cyber-card-light rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer font-bold shadow-sm"
              >
                Đóng Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm glass-panel shadow-2xl rounded-2xl p-6 border border-red-500/30 animate-scaleIn">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyber-text-main">Xác nhận xóa</h3>
                <p className="text-sm text-cyber-text-muted mt-2">
                  Bạn có chắc chắn muốn xóa bản ghi <span className="font-mono font-bold text-red-400">{itemToDelete.id}</span> này không? Dữ liệu này sẽ không thể khôi phục.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-cyber-border text-cyber-text-main hover:bg-cyber-card-light transition-all cursor-pointer font-semibold text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer font-bold text-sm shadow-lg shadow-red-500/20"
                >
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[70] p-4 rounded-xl border flex items-center gap-3 animate-slideUp shadow-2xl ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400 cyber-glow-success' 
            : 'bg-red-950/90 border-red-500/50 text-red-400 cyber-glow-error'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm font-semibold pr-2">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
