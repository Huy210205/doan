import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Terminal, AlertOctagon, AlertTriangle, AlertCircle, ShieldCheck, ChevronDown, ChevronUp, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { Vulnerability, ScanHistoryItem, SystemConfig } from '../types';
import contentData from '../data/contentData.json';
import api from '../api';

interface DashboardViewProps {
  onAddHistoryItem: (newItem: ScanHistoryItem) => void;
  systemConfig: SystemConfig;
}

export default function DashboardView({ onAddHistoryItem, systemConfig }: DashboardViewProps) {
  const { vulnerability_severities } = contentData;

  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [activeConsoleLogs, setActiveConsoleLogs] = useState<string[]>([]);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string | null>(null);

  const [activeFindings, setActiveFindings] = useState<Vulnerability[]>([]);
  const [expandedVulnId, setExpandedVulnId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string>('');

  const [pastScans, setPastScans] = useState<any[]>([]);
  const [currentViewScanId, setCurrentViewScanId] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'donut' | 'trend'>('donut');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [critCount, setCritCount] = useState(0);
  const [highCount, setHighCount] = useState(0);
  const [medCount, setMedCount] = useState(0);
  const [lowCount, setLowCount] = useState(0);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConsoleLogs, showConsole]);

  const addLog = (msg: string) => {
    setActiveConsoleLogs(prev => [...prev, `${new Date().toLocaleTimeString()} ${msg}`]);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingHistory(true);
        const res = await api.get('/scans');
        const scans = res.data;
        setPastScans(scans);

        if (scans.length > 0) {
          const savedScanId = localStorage.getItem('lastViewedScanId');
          let scanToLoad = scans[0].raw_id; // Default to newest

          if (savedScanId) {
            const parsedId = parseInt(savedScanId, 10);
            if (scans.some((s: any) => s.raw_id === parsedId)) {
              scanToLoad = parsedId;
            }
          }

          await loadScanData(scanToLoad, scans, false);
        }
      } catch (err) {
        console.error("Failed to load initial scans:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollScanStatus = (scanId: number) => {
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        const nextProgress = prev + Math.floor(Math.random() * 5) + 2;
        return nextProgress >= 90 ? 90 : nextProgress;
      });
    }, 500);

    const checkInterval = setInterval(async () => {
      try {
        const res = await api.get('/scans');
        const scans = res.data;
        setPastScans(scans);

        const currentScan = scans.find((s: any) => s.raw_id === scanId);
        if (currentScan && currentScan.status !== 'running') {
          clearInterval(checkInterval);
          clearInterval(scanInterval);
          setScanProgress(100);

          if (currentScan.status === 'Completed' || currentScan.status === 'Stopped') {
            if (currentScan.status === 'Stopped') {
              addLog(`[WARNING] Đợt quét SCN-${String(scanId).padStart(3, '0')} đã bị DỪNG bởi người dùng. Đang nạp dữ liệu quét được...`);
            } else {
              addLog(`[SUCCESS] Quét hoàn tất. Scan ID: ${scanId}. Bắt đầu nạp dữ liệu lỗ hổng...`);
            }
            const vulnsRes = await api.get(`/scans/${scanId}/vulnerabilities`);
            const vulnsData = vulnsRes.data;
            const { mappedFindings, crit, high, med, low } = processFindings(vulnsData);

            // Update History
            const historyItem: ScanHistoryItem = {
              id: `SCN-${String(scanId).padStart(3, '0')}`,
              target: currentScan.url,
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              errors_found: mappedFindings.length,
              status: currentScan.status,
              severities: { critical: crit, high: high, medium: med, low: low },
              vulnerabilities: mappedFindings.map(v => v.id)
            };
            onAddHistoryItem(historyItem);
          } else {
            setScanError('Quá trình quét thất bại.');
            addLog(`[ERROR] Quá trình quét thất bại.`);
          }

          setCurrentViewScanId(scanId);
          localStorage.setItem('lastViewedScanId', scanId.toString());
          setIsScanning(false);
        }
      } catch (err: any) {
        clearInterval(checkInterval);
        clearInterval(scanInterval);
        setScanError(`Lỗi khi kiểm tra trạng thái: ${err.message}`);
        setIsScanning(false);
      }
    }, 2000);
  };

  const loadScanData = async (scanId: number, scansList = pastScans, updateUrl = true) => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanError('');

      const scanInfo = scansList.find((s: any) => s.raw_id === scanId);
      if (scanInfo && updateUrl) {
        setTargetUrl(scanInfo.url);
      }

      if (scanInfo && scanInfo.status === 'running') {
        addLog(`[INFO] Đang tiếp tục theo dõi quá trình quét SCN-${String(scanId).padStart(3, '0')}...`);
        pollScanStatus(scanId);
        return;
      }

      addLog(`[INFO] Đang nạp dữ liệu từ lịch sử quét SCN-${String(scanId).padStart(3, '0')}...`);

      const vulnsRes = await api.get(`/scans/${scanId}/vulnerabilities`);
      const vulnsData = vulnsRes.data;

      processFindings(vulnsData);

      setCurrentViewScanId(scanId);
      localStorage.setItem('lastViewedScanId', scanId.toString());
      setScanProgress(100);
      setIsScanning(false);

    } catch (err: any) {
      setScanError(`Lỗi nạp dữ liệu: ${err.message}`);
      addLog(`[ERROR] Nạp dữ liệu thất bại: ${err.message}`);
      setIsScanning(false);
    }
  };

  const processFindings = (vulnsData: any[]) => {
    const mappedFindings: Vulnerability[] = vulnsData.map((v: any) => ({
      id: `vuln-${v.id}`,
      type: v.type,
      url: v.url || 'N/A',
      level: v.severity.toUpperCase(),
      confidence: `${Math.round(v.confidence * 100)}%`,
      description: v.description || 'Hệ thống AI phát hiện bất thường dựa trên heuristics.',
      parameter: v.param,
      payload: v.payload,
      evidence: v.evidence,
      recommendation: v.recommendation,
      code_block: v.code_snippet || '// Liên hệ admin để xem code hướng dẫn'
    }));

    setActiveFindings(mappedFindings);
    addLog(`[INFO] Phân tích hoàn tất. Đã nạp ${mappedFindings.length} lỗ hổng lên giao diện.`);

    // Compute severities
    let crit = 0, high = 0, med = 0, low = 0;
    mappedFindings.forEach(v => {
      if (v.level === 'CRITICAL') crit++;
      if (v.level === 'HIGH') high++;
      if (v.level === 'MEDIUM') med++;
      if (v.level === 'LOW') low++;
    });

    setCritCount(crit);
    setHighCount(high);
    setMedCount(med);
    setLowCount(low);

    if (mappedFindings.length > 0) {
      setExpandedVulnId(mappedFindings[0].id);
    } else {
      setExpandedVulnId(null);
    }

    return { mappedFindings, crit, high, med, low };
  };

  const handleStartScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl) return;

    setIsScanning(true);
    setScanProgress(0);
    setShowConsole(true);
    setActiveConsoleLogs([]);
    setScanError('');

    setCritCount(0);
    setHighCount(0);
    setMedCount(0);
    setLowCount(0);
    setActiveFindings([]);
    setExpandedVulnId(null);

    try {
      addLog(`[INFO] Khởi tạo quá trình quét mục tiêu: ${targetUrl}`);

      // 1. Gửi yêu cầu Scan
      addLog(`[INFO] Gửi request đến /api/scan...`);
      const scanRes = await api.post('/scan', {
        url: targetUrl,
        delay_ms: systemConfig.crawler.delay_ms,
        max_depth: systemConfig.crawler.max_depth,
        auth_header: systemConfig.auth_header || ""
      });
      const scanId = scanRes.data.scan_id;

      addLog(`[INFO] Quá trình quét đang chạy ngầm. Scan ID: ${scanId}. Đang chờ kết quả...`);
      setCurrentViewScanId(scanId);
      localStorage.setItem('lastViewedScanId', scanId.toString());

      pollScanStatus(scanId);

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message;
      setScanError(`Scan failed: ${errorMsg}`);
      addLog(`[CRITICAL] Error: ${errorMsg}`);
      setScanProgress(0);
      setIsScanning(false);
    }
  };

  const handleStopScan = async () => {
    if (!currentViewScanId) return;
    try {
      addLog(`[WARNING] Đang gửi yêu cầu dừng quét (Scan ID: ${currentViewScanId})...`);
      await api.post(`/scans/${currentViewScanId}/stop`);
      addLog(`[WARNING] Đã nhận lệnh dừng. Đang chờ hệ thống xử lý hủy các tác vụ ngầm...`);
    } catch (err: any) {
      addLog(`[ERROR] Không thể dừng quét: ${err.message}`);
    }
  };

  const filteredFindings = selectedSeverityFilter
    ? activeFindings.filter(v => v.level === selectedSeverityFilter)
    : activeFindings;

  const getDonutChartData = () => {
    const total = critCount + highCount + medCount + lowCount;
    if (total === 0) return { empty: true };

    const sizes = [
      { name: 'CRITICAL', count: critCount, color: '#ef4444' },
      { name: 'HIGH', count: highCount, color: '#f97316' },
      { name: 'MEDIUM', count: medCount, color: '#eab308' },
      { name: 'LOW', count: lowCount, color: '#10b981' }
    ];

    let accumulatedAngle = 0;
    const slices = sizes.map((item) => {
      const percentage = item.count / total;
      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      // If a single slice covers 100%, we shift endAngle slightly to prevent overlapping coordinates which breaks SVG path rendering.
      const endAngle = accumulatedAngle + (percentage === 1 ? 359.99 : angle);
      accumulatedAngle = accumulatedAngle + angle;

      const radius = 35;
      const cx = 50;
      const cy = 50;

      const x1 = cx + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = cy + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = cx + radius * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = cy + radius * Math.sin((endAngle - 90) * Math.PI / 180);

      const largeArc = (percentage === 1 || angle > 180) ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const midAngle = startAngle + (angle / 2);
      const isSelected = selectedSeverityFilter === item.name;
      const explodeOffset = isSelected ? 4 : 0;
      const explodeX = explodeOffset * Math.cos((midAngle - 90) * Math.PI / 180);
      const explodeY = explodeOffset * Math.sin((midAngle - 90) * Math.PI / 180);

      return {
        ...item,
        pathData,
        percentage: Math.round(percentage * 100),
        explodeX,
        explodeY,
        isSelected
      };
    }).filter(s => s.count > 0);

    return { empty: false, slices };
  };

  const getTrendData = () => {
    const currentScan = pastScans.find(s => s.raw_id === currentViewScanId);
    const filterUrl = currentScan ? currentScan.url : targetUrl;

    const relevantScans = pastScans
      .filter(s => s.url === filterUrl)
      .slice(0, 7)
      .reverse();

    const maxVulns = relevantScans.length > 0
      ? Math.max(...relevantScans.map(s => s.vulns), 1)
      : 1;
    return { relevantScans, maxVulns };
  };

  const donut = getDonutChartData();
  const trend = getTrendData();

  return (
    <div id="dashboard-view" className="space-y-6 animate-fadeIn py-6 px-8 max-w-7xl mx-auto w-full">
      {/* Upper View Dashboard Bar */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-cyber-text-main">
            Dashboard Quét AI
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            Quét và phát hiện lỗ hổng ứng dụng thông qua dịch vụ AI học phân loại (ML Classifier).
          </p>
        </div>
      </div>

      {/* Target URL Selector Input and Console Controls Section */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-4">
            <div className="flex items-center gap-3.5">
              <span className="p-2 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue">
                <RefreshCw className={`w-5 h-5 ${isScanning || isLoadingHistory ? 'animate-spin' : ''}`} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-cyber-text-main">Khởi chạy AI Scanner</h3>
                <p className="text-xs text-cyber-text-muted">Phân tích sâu mã nguồn và cấu hình máy chủ để tìm ra lỗ hổng bảo mật.</p>
              </div>
            </div>

            {/* History Dropdown */}
            {pastScans.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-cyber-text-muted">Lịch sử URL:</span>
                <select
                  value={currentViewScanId || ''}
                  onChange={(e) => loadScanData(Number(e.target.value))}
                  className="bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-cyber-blue hover:border-cyber-blue/50 cursor-pointer shadow-sm transition-all"
                  disabled={isScanning || isLoadingHistory}
                >
                  {pastScans.filter(s => s.url === targetUrl).map(s => (
                    <option key={s.raw_id} value={s.raw_id}>
                      {s.id} - {s.date.split(' ')[0]} ({s.vulns} lỗi)
                    </option>
                  ))}
                  {pastScans.filter(s => s.url !== targetUrl).length > 0 && (
                    <optgroup label="URLs khác">
                      {pastScans.filter(s => s.url !== targetUrl).map(s => (
                        <option key={s.raw_id} value={s.raw_id}>
                          {s.id} - {s.url.substring(0, 20)}...
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}
          </div>

          {scanError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {scanError}
            </div>
          )}

          <form onSubmit={handleStartScan} className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                id="target-url-input"
                type="text"
                required
                className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm font-mono rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-cyber-border/80 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Nhập URL mục tiêu"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={isScanning}
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                id="toggle-logs-btn"
                type="button"
                onClick={() => setShowConsole(!showConsole)}
                className={`px-5 py-4 rounded-xl border font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${showConsole
                  ? 'bg-purple-500/10 dark:bg-purple-950/20 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 dark:hover:bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-cyber-card-light border-cyber-border text-cyber-text-muted hover:text-cyber-text-main hover:border-cyber-blue/40'
                  }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Logs {isScanning && `(${scanProgress}%)`}</span>
              </button>

              {isScanning ? (
                <button
                  id="stop-scan-btn"
                  type="button"
                  onClick={handleStopScan}
                  className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-7 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-400/20 shadow-md duration-300 transition-all shrink-0"
                >
                  <AlertOctagon className="w-4 h-4 stroke-[3]" />
                  <span>Dừng Quét</span>
                </button>
              ) : (
                <button
                  id="scan-now-btn"
                  type="submit"
                  disabled={isScanning}
                  className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-7 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-450/10 shadow-md duration-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Play className="w-4 h-4 stroke-[3]" />
                  <span>Quét Ngay</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Floating Console Window Overlay inside panel */}
        {showConsole && (
          <div id="logs-console" className="mt-5 border border-cyber-border rounded-xl overflow-hidden bg-black/95 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d16] border-b border-cyber-border/75">
              <span className="text-cyan-400 font-bold tracking-widest text-[10px] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                CONSOLE TERMINAL :: ACTIVE
              </span>
              <button
                id="clear-logs-btn"
                onClick={() => setActiveConsoleLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-350 underline uppercase cursor-pointer"
              >
                Xóa Log
              </button>
            </div>
            <div className="p-4 h-48 overflow-y-auto space-y-1.5 scroll-smooth text-slate-300 select-all">
              {activeConsoleLogs.length === 0 ? (
                <div className="text-slate-650 flex flex-col items-center justify-center h-full gap-2 font-semibold">
                  <Terminal className="w-6 h-6 stroke-1 text-slate-600" />
                  <span>Terminal sẵn sàng. Nhấn quét để hiển thị tiến trình.</span>
                </div>
              ) : (
                activeConsoleLogs.map((log, index) => {
                  let textClass = 'text-slate-300';
                  if (log.includes('[WARNING]')) textClass = 'text-yellow-400';
                  if (log.includes('[CRITICAL]')) textClass = 'text-red-400 font-bold';
                  if (log.includes('✅') || log.includes('[SUCCESS]')) textClass = 'text-emerald-400 font-bold';
                  return (
                    <div key={index} className={`leading-relaxed whitespace-pre-wrap ${textClass}`}>
                      {log}
                    </div>
                  );
                })
              )}
              {isScanning && (
                <div className="text-cyan-400 animate-pulse flex items-center gap-2 font-bold mt-1">
                  <span>█ Đang tiến hành phân tích mô-đun... ({scanProgress}%)</span>
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bars for Scan under active scan */}
      {isScanning && (
        <div className="w-full glass-panel rounded-xl p-4 flex items-center gap-4 animate-fadeIn shadow-md">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono text-cyber-text-muted mb-1.5 font-semibold">
              <span>Đang kết nối API quét mục tiêu và chạy mô hình {systemConfig.selected_model_id === 'xgb' ? 'XGBoost' : 'Random Forest Classifier'}...</span>
              <span className="text-cyber-blue font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full bg-cyber-border/40 rounded-full h-1.5 overflow-hidden">
              <div className="animate-shimmer h-1.5 rounded-full transition-all duration-150" style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Metrics severity count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical */}
        <button
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'CRITICAL' ? null : 'CRITICAL')}
          className={`glass-panel rounded-2xl p-6 text-left transition-all duration-300 group cursor-pointer relative shadow-md hover:scale-[1.03] active:scale-[0.98] ${selectedSeverityFilter === 'CRITICAL'
            ? 'border-red-500/50 bg-red-500/5 dark:bg-red-950/15 cyber-glow-error translate-y-[-2px]'
            : 'border-cyber-border hover:border-red-500/25 hover:bg-red-500/5 dark:hover:bg-red-950/5'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold tracking-wider text-red-500/80 uppercase">
              {vulnerability_severities.CRITICAL?.label || 'CRITICAL'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/15 dark:bg-red-500/10 flex items-center justify-center group-hover:scale-110 duration-200 transition-all">
              <AlertOctagon className="w-4.5 h-4.5 text-red-500" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-cyber-text-main tracking-tight leading-none">
            {critCount}
          </span>
          {critCount > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping absolute top-4 right-4" />
          )}
        </button>

        {/* High */}
        <button
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'HIGH' ? null : 'HIGH')}
          className={`glass-panel rounded-2xl p-6 text-left transition-all duration-300 group cursor-pointer shadow-md hover:scale-[1.03] active:scale-[0.98] ${selectedSeverityFilter === 'HIGH'
            ? 'border-orange-500/50 bg-orange-500/5 dark:bg-orange-950/15 cyber-glow-warn translate-y-[-2px]'
            : 'border-cyber-border hover:border-orange-500/25 hover:bg-orange-500/5 dark:hover:bg-orange-950/5'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold tracking-wider text-orange-500/80 uppercase">
              {vulnerability_severities.HIGH?.label || 'HIGH'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 dark:bg-orange-500/10 flex items-center justify-center group-hover:scale-110 duration-200 transition-all">
              <AlertTriangle className="w-4.5 h-4.5 text-orange-500" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-cyber-text-main tracking-tight leading-none">
            {highCount}
          </span>
        </button>

        {/* Medium */}
        <button
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'MEDIUM' ? null : 'MEDIUM')}
          className={`glass-panel rounded-2xl p-6 text-left transition-all duration-300 group cursor-pointer shadow-md hover:scale-[1.03] active:scale-[0.98] ${selectedSeverityFilter === 'MEDIUM'
            ? 'border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-950/15 cyber-glow-warn translate-y-[-2px]'
            : 'border-cyber-border hover:border-yellow-500/25 hover:bg-yellow-500/5 dark:hover:bg-yellow-950/5'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold tracking-wider text-yellow-500/80 uppercase">
              {vulnerability_severities.MEDIUM?.label || 'MEDIUM'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/15 dark:bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 duration-200 transition-all">
              <AlertCircle className="w-4.5 h-4.5 text-yellow-500" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-cyber-text-main tracking-tight leading-none">
            {medCount}
          </span>
        </button>

        {/* Low */}
        <button
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'LOW' ? null : 'LOW')}
          className={`glass-panel rounded-2xl p-6 text-left transition-all duration-300 group cursor-pointer relative shadow-md hover:scale-[1.03] active:scale-[0.98] ${selectedSeverityFilter === 'LOW'
            ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/15 cyber-glow-success translate-y-[-2px]'
            : 'border-cyber-border hover:border-emerald-500/10 hover:bg-emerald-500/5 dark:hover:bg-[#10192e]'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-500/80 uppercase">
              {vulnerability_severities.LOW?.label || 'LOW'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 duration-200 transition-all">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-cyber-text-main tracking-tight leading-none">
            {lowCount}
          </span>
        </button>
      </div>

      {selectedSeverityFilter && (
        <div className="flex items-center justify-between bg-cyber-blue/5 border border-cyber-blue/20 rounded-xl p-3 px-4 shadow-sm animate-fadeIn">
          <span className="text-xs text-cyber-text-muted">
            Đang lọc theo mức độ rủi ro: <strong className="text-cyber-blue uppercase font-mono">{selectedSeverityFilter}</strong>
          </span>
          <button
            onClick={() => setSelectedSeverityFilter(null)}
            className="text-[10px] uppercase font-mono font-bold text-cyber-text-muted hover:text-cyber-text-main transition-colors cursor-pointer"
          >
            Hủy lọc [X]
          </button>
        </div>
      )}

      {/* Main Bottom Assessment area: Pie + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left item: Donut chart of vulns distribution (4 columns on lg) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-xl relative min-h-[400px] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-cyber-text-main mb-1.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyber-blue" />
                {chartMode === 'donut' ? 'Phân bổ Lỗ hổng' : 'Xu hướng Rủi ro'}
              </h3>
              <p className="text-xs text-cyber-text-muted mb-6">
                {chartMode === 'donut' ? 'Tỉ lệ phân bố mức độ bảo mật phát hiện.' : 'So sánh lượng lỗi qua các lần quét gần nhất.'}
              </p>
            </div>

            <div className="flex bg-cyber-input-bg border border-cyber-border rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setChartMode('donut')}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-colors ${chartMode === 'donut' ? 'bg-cyber-blue text-white shadow-sm' : 'text-cyber-text-muted hover:text-cyber-text-main hover:bg-cyber-card-light'}`}
              >
                Tỷ lệ
              </button>
              <button
                onClick={() => setChartMode('trend')}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-colors ${chartMode === 'trend' ? 'bg-cyber-blue text-white shadow-sm' : 'text-cyber-text-muted hover:text-cyber-text-main hover:bg-cyber-card-light'}`}
              >
                Xu hướng
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center my-6 relative flex-1">
            {chartMode === 'donut' ? (
              <div className="relative w-52 h-52 flex items-center justify-center animate-fadeIn group/donut">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                  {/* Decorative outer ring */}
                  <circle cx="50" cy="50" r="44" fill="transparent" strokeWidth="0.5" className="stroke-cyber-blue/30" strokeDasharray="1 3" />

                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    strokeWidth="12"
                    className={donut.empty ? "stroke-emerald-500/20 dark:stroke-emerald-500/10" : "stroke-cyber-border"}
                  />
                  {!donut.empty && donut.slices?.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === slice.name ? null : slice.name)}
                      style={{ transform: `translate(${slice.explodeX}px, ${slice.explodeY}px)` }}
                      className={`cursor-pointer transition-all duration-500 filter drop-shadow-md ${slice.isSelected ? 'opacity-100 stroke-white stroke-[2]' : 'opacity-70 hover:opacity-100 hover:stroke-white hover:stroke-[1]'}`}
                    />
                  ))}
                  {/* Center cutout to make it a donut */}
                  <circle cx="50" cy="50" r="28" className="fill-cyber-bg transition-colors duration-300 shadow-inner" />

                  {/* Radar Spinner - 4 rotating spokes */}
                  <g style={{ transformOrigin: '50px 50px', animation: 'radarSpin 4s linear infinite' }}>
                    <line x1="50" y1="50" x2="50" y2="30" stroke="rgba(59,130,246,0.4)" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="50" y1="50" x2="67" y2="50" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" strokeLinecap="round" />
                    <line x1="50" y1="50" x2="50" y2="70" stroke="rgba(59,130,246,0.1)" strokeWidth="0.3" strokeLinecap="round" />
                    <circle cx="50" cy="30" r="1.2" fill="rgba(99,220,255,0.8)" />
                  </g>
                  <style dangerouslySetInnerHTML={{ __html: '@keyframes radarSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' }} />
                </svg>
                {/* Text overlay in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-cyber-text-main leading-none">
                    {critCount + highCount + medCount + lowCount}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyber-text-muted mt-1 font-bold">
                    {donut.empty ? 'An toàn' : 'Tổng số lỗi'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-52 relative animate-fadeIn overflow-hidden">
                {trend.relevantScans.length === 0 ? (
                  <div className="text-xs text-cyber-text-muted font-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    Chưa có dữ liệu lịch sử cho URL này.
                  </div>
                ) : (() => {
                  const W = 240;
                  const H = 160;
                  const pad = 16;
                  const scans = trend.relevantScans;
                  const maxV = trend.maxVulns;
                  const pts = scans.map((s, i) => ({
                    x: pad + (i / Math.max(scans.length - 1, 1)) * (W - pad * 2),
                    y: H - pad - (s.vulns / maxV) * (H - pad * 2),
                    s
                  }));

                  // Build smooth cubic bezier path
                  if (pts.length === 0) return null;
                  const pathD = pts.reduce((acc, pt, i) => {
                    if (i === 0) return `M ${pt.x},${pt.y}`;
                    const prev = pts[i - 1];
                    const cpx = (prev.x + pt.x) / 2;
                    return acc + ` C ${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`;
                  }, '');

                  // Fill area under curve
                  const areaD = pts.length > 1
                    ? pathD + ` L ${pts[pts.length - 1].x},${H - pad} L ${pts[0].x},${H - pad} Z`
                    : '';

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      {/* Grid lines */}
                      {[0.25, 0.5, 0.75].map(t => (
                        <line key={t} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)}
                          stroke="rgba(99,130,246,0.1)" strokeWidth="0.5" strokeDasharray="3 4" />
                      ))}
                      {/* Fill area */}
                      <path d={areaD} fill="url(#waveGrad)" />
                      {/* Neon Spline */}
                      <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Data points */}
                      {pts.map((pt, i) => {
                        const isCurrent = pt.s.raw_id === currentViewScanId;
                        return (
                          <g key={i} className="cursor-pointer" onClick={() => loadScanData(pt.s.raw_id)}>
                            <circle cx={pt.x} cy={pt.y} r="5" fill="transparent" />
                            <circle cx={pt.x} cy={pt.y} r={isCurrent ? 4 : 2.5}
                              fill={isCurrent ? '#22d3ee' : '#0ea5e9'}
                              stroke={isCurrent ? 'white' : '#38bdf8'}
                              strokeWidth={isCurrent ? 1.5 : 0.8}
                              filter={isCurrent ? 'url(#glow)' : undefined}
                            />
                            <text x={pt.x} y={H - 2} textAnchor="middle"
                              fontSize="7" fill={isCurrent ? '#38bdf8' : 'rgba(150,170,200,0.7)'}
                              fontFamily="monospace" fontWeight={isCurrent ? 'bold' : 'normal'}>
                              {pt.s.id.split('-')[1]}
                            </text>
                            {/* Tooltip label above point */}
                            <text x={pt.x} y={pt.y - 6} textAnchor="middle"
                              fontSize="6.5" fill="#94a3b8" fontFamily="monospace">
                              {pt.s.vulns}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Slices legend table */}
          {chartMode === 'donut' && !donut.empty && donut.slices && (
            <div className="space-y-1.5 pt-4 border-t border-cyber-border/50 animate-fadeIn">
              {donut.slices.map((slice, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg transition-all border border-transparent hover:border-cyber-border hover:bg-cyber-card-light/50 ${slice.isSelected ? 'bg-cyber-card-light border-cyber-border shadow-sm' : ''}`}
                  onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === slice.name ? null : slice.name)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: slice.color, boxShadow: slice.isSelected ? `0 0 10px ${slice.color}` : 'none' }} />
                    <span className={`font-medium capitalize transition-colors ${slice.isSelected ? 'text-cyber-text-main font-bold' : 'text-cyber-text-muted'}`}>
                      {vulnerability_severities[slice.name as keyof typeof vulnerability_severities]?.label || slice.name}
                    </span>
                  </div>
                  <span className={`font-mono transition-colors ${slice.isSelected ? 'text-cyber-text-main font-bold' : 'text-cyber-text-muted'}`}>
                    {slice.count} ({slice.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right item: Findings Table detail accordion list (8 columns on lg) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 shadow-xl min-h-[400px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-cyber-text-main">Báo cáo Chi tiết & Gợi ý AI</h3>
              <p className="text-xs text-cyber-text-muted mt-1">Dữ liệu kiểm thử chứng minh lỗ hổng kết hợp mã sửa đổi an toàn.</p>
            </div>

            <span className="text-xs font-mono text-cyber-text-muted font-medium">
              Tìm thấy: <strong className="text-cyber-text-main font-bold">{filteredFindings.length}</strong> rủi ro
            </span>
          </div>

          {filteredFindings.length === 0 ? (
            <div id="no-findings" className="flex flex-col items-center justify-center py-20 text-center text-cyber-text-muted gap-3 border border-dashed border-cyber-border/80 rounded-xl">
              <CheckCircle className="w-10 h-10 text-emerald-500/80 stroke-[1.5]" />
              <div>
                <p className="text-cyber-text-main font-semibold">Hệ thống của bạn an toàn!</p>
                <p className="text-xs text-cyber-text-muted mt-1">Không phát hiện lỗ hổng rủi ro nào ở cấp độ lọc này.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => {
                const isExpanded = expandedVulnId === finding.id;

                let levelBadgeClass = '';
                let levelTextClass = '';

                switch (finding.level) {
                  case 'CRITICAL':
                    levelBadgeClass = 'bg-red-500/10 border-red-500/30 text-red-650 dark:text-red-400';
                    levelTextClass = 'text-red-500';
                    break;
                  case 'HIGH':
                    levelBadgeClass = 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400';
                    levelTextClass = 'text-orange-500';
                    break;
                  case 'MEDIUM':
                    levelBadgeClass = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400';
                    levelTextClass = 'text-yellow-500';
                    break;
                  case 'LOW':
                    levelBadgeClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
                    levelTextClass = 'text-emerald-500';
                    break;
                }

                return (
                  <div
                    key={finding.id}
                    className={`border rounded-xl transition-all duration-350 overflow-hidden ${isExpanded
                      ? 'border-cyber-blue bg-cyber-blue/5 shadow-[0_4px_20px_rgba(59,130,246,0.05)] backdrop-blur-sm'
                      : 'border-cyber-border hover:border-cyber-blue/30 dark:hover:border-slate-700 bg-transparent hover:scale-[1.005]'
                      }`}
                  >
                    {/* Accordion Row Header */}
                    <button
                      id={`finding-row-${finding.id}`}
                      onClick={() => setExpandedVulnId(isExpanded ? null : finding.id)}
                      className="w-full text-left px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-cyber-text-main/[0.01] transition-all"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-bold text-cyber-text-main text-sm">
                            {finding.type}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full font-bold uppercase ${levelBadgeClass}`}>
                            {vulnerability_severities[finding.level as keyof typeof vulnerability_severities]?.label || finding.level}
                          </span>
                          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5" title="Độ tin cậy của AI">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            Độ tin cậy: <b className="font-bold text-cyan-700 dark:text-cyan-305">{finding.confidence}</b>
                          </span>
                        </div>

                        <div className="flex flex-col gap-y-1.5 text-xs text-cyber-text-muted font-mono mb-2">
                          <span className="break-all" title={finding.url}>
                            URL: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{finding.url}</span>
                          </span>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="truncate">
                              Tham số: <span className="bg-cyber-input-bg border border-cyber-border/40 px-1.5 py-0.5 rounded text-yellow-600 dark:text-yellow-400 font-bold">{finding.parameter || 'N/A'}</span>
                            </span>
                            <span className="truncate max-w-sm">
                              Payload: <span className="text-rose-600 dark:text-rose-455 font-bold">{finding.payload}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-cyber-text-muted">
                        <span className="text-xs font-mono text-cyber-text-muted font-medium">
                          {isExpanded ? 'Đóng chi tiết' : 'Xem gợi ý khắc phục'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-cyber-text-main" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyber-text-main" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Row Content Dropdown */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-cyber-border/60 bg-cyber-card-light/20 animate-slideDown max-w-full">
                        <div className="space-y-4">
                          {/* Overview vulnerability metadata info */}
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-cyber-text-main">
                              Mô tả chi tiết
                            </h4>
                            <p className="text-xs text-cyber-text-muted leading-relaxed">
                              {finding.description}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-cyber-text-main">
                              Khuyến nghị khắc phục từ AI
                            </h4>
                            <p className="text-xs text-cyber-text-muted leading-relaxed">
                              {finding.recommendation}
                            </p>
                          </div>

                          {/* Proof of Evidence block */}
                          <div className="space-y-1 p-3.5 bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-xl shadow-inner">
                            <h4 className="text-[11px] font-bold uppercase font-mono tracking-wider text-red-500 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Bằng chứng rà quét (Scanner proof)
                            </h4>
                            <p className="text-[11px] font-mono text-cyber-text-main break-all leading-relaxed whitespace-pre-wrap">
                              {finding.evidence || 'Phát hiện lỗ hổng dựa trên kết quả HTTP Response.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
