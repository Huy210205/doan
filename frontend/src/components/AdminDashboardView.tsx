import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield, AlertTriangle, ChevronDown, User, FileText, Calendar, Eye } from 'lucide-react';
import { UserProfile, UserSession } from '../types';
import api from '../api';

interface DashboardStats {
  totalUsers: number;
  totalScans: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  monthlyScans: { name: string; scans: number; details?: { email: string; count: number }[] }[];
}

interface UserVuln {
  id: number;
  user_email: string;
  vuln_type: string;
  severity: string;
  url: string;
  parameter_name: string;
  payload?: string;
  evidence?: string;
  confidence?: number;
  target_url: string;
  scan_date: string;
}

export default function AdminDashboardView({ session }: { session: UserSession }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [userVulns, setUserVulns] = useState<UserVuln[]>([]);
  const [isLoadingVulns, setIsLoadingVulns] = useState(false);
  const [selectedVuln, setSelectedVuln] = useState<UserVuln | null>(null);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/admin/overview?month=${selectedMonth}&year=${selectedYear}`, { 
          headers: { Authorization: `Bearer ${session.token}` } 
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    if (session.token) fetchStats();
  }, [session.token, selectedMonth, selectedYear]);

  // Fetch Users List for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users', { headers: { Authorization: `Bearer ${session.token}` } });
        setUsersList(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    if (session.token) fetchUsers();
  }, [session.token]);

  // Fetch vulnerabilities
  const fetchUserVulns = async (currentPage: number, reset: boolean = false) => {
    setIsLoadingVulns(true);
    try {
      const params: any = { skip: currentPage * 15, limit: 15 };
      if (selectedUserId) params.user_id = selectedUserId;
      if (selectedSeverity) params.severity = selectedSeverity;

      const res = await api.get('/admin/vulnerabilities', { 
        params,
        headers: { Authorization: `Bearer ${session.token}` } 
      });
      
      setHasMore(res.data.length === 15);

      if (reset) {
        setUserVulns(res.data);
      } else {
        setUserVulns(prev => [...prev, ...res.data]);
      }
    } catch (err) {
      console.error('Error fetching user vulnerabilities:', err);
    } finally {
      setIsLoadingVulns(false);
    }
  };

  useEffect(() => {
    setPage(0);
    if (session.token) {
      fetchUserVulns(0, true);
    }
  }, [selectedUserId, selectedSeverity, session.token]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUserVulns(nextPage, false);
  };


  const data = stats || {
    totalUsers: 0,
    totalScans: 0,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    monthlyScans: []
  };

  const maxScans = Math.max(...data.monthlyScans.map(w => w.scans), 1);
  
  const getSeverityColor = (sev: string) => {
    if (sev === 'Critical') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (sev === 'High') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (sev === 'Medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Overview Cards */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-cyber-text-main flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyber-purple" />
          Trung tâm Giám sát
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div 
          onClick={() => { setSelectedUserId(''); setSelectedSeverity(''); }}
          className="glass-panel p-5 rounded-2xl col-span-2 lg:col-span-1 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-cyber-blue/50"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-cyber-blue/10 rounded-xl text-cyber-blue"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-cyber-text-muted">User</p>
              <h3 className="text-2xl font-bold text-cyber-text-main">{data.totalUsers.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div 
          onClick={() => { setSelectedUserId(''); setSelectedSeverity(''); }}
          className="glass-panel p-5 rounded-2xl col-span-2 lg:col-span-1 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/50"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Shield className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-cyber-text-muted">Quét</p>
              <h3 className="text-2xl font-bold text-cyber-text-main">{data.totalScans.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedSeverity(selectedSeverity === 'Critical' ? '' : 'Critical')}
          className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${selectedSeverity === 'Critical' ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-red-500/30 bg-red-500/5 hover:border-red-500/60'}`}
        >
          <p className="text-xs font-medium text-cyber-text-muted mb-1 text-center">Nghiêm trọng</p>
          <h3 className="text-xl font-bold text-red-500 text-center">{data.vulnerabilities.critical.toLocaleString()}</h3>
        </div>
        
        <div 
          onClick={() => setSelectedSeverity(selectedSeverity === 'High' ? '' : 'High')}
          className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${selectedSeverity === 'High' ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60'}`}
        >
          <p className="text-xs font-medium text-cyber-text-muted mb-1 text-center">Rủi ro Cao</p>
          <h3 className="text-xl font-bold text-orange-500 text-center">{data.vulnerabilities.high.toLocaleString()}</h3>
        </div>
        
        <div 
          onClick={() => setSelectedSeverity(selectedSeverity === 'Medium' ? '' : 'Medium')}
          className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${selectedSeverity === 'Medium' ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60'}`}
        >
          <p className="text-xs font-medium text-cyber-text-muted mb-1 text-center">Trung bình</p>
          <h3 className="text-xl font-bold text-yellow-500 text-center">{data.vulnerabilities.medium.toLocaleString()}</h3>
        </div>
        
        <div 
          onClick={() => setSelectedSeverity(selectedSeverity === 'Low' ? '' : 'Low')}
          className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${selectedSeverity === 'Low' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60'}`}
        >
          <p className="text-xs font-medium text-cyber-text-muted mb-1 text-center">Rủi ro Thấp</p>
          <h3 className="text-xl font-bold text-blue-500 text-center">{data.vulnerabilities.low.toLocaleString()}</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">Biểu đồ Lượt quét trong tháng</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-cyber-input-bg border border-cyber-border rounded-lg px-3 py-1.5">
              <Calendar className="w-4 h-4 text-cyber-text-muted" />
              <select 
                className="bg-transparent text-sm text-cyber-text-main outline-none cursor-pointer appearance-none pr-2"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-white">Tháng {m}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-cyber-input-bg border border-cyber-border rounded-lg px-3 py-1.5">
              <select 
                className="bg-transparent text-sm text-cyber-text-main outline-none cursor-pointer appearance-none pr-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y} className="bg-slate-900 text-white">Năm {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="h-72 flex items-end justify-between mt-8 relative pb-6">
          {data.monthlyScans.map((day, i) => {
            const heightPercent = (day.scans / maxScans) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group px-[1px] sm:px-[2px]">
                <div className="w-full flex justify-center h-full items-end relative">
                  {day.scans > 0 && (
                    <div className="absolute bottom-full mb-1 text-[10px] sm:text-xs font-bold text-cyber-blue font-mono transition-transform duration-300 group-hover:-translate-y-1">
                      {day.scans}
                    </div>
                  )}
                  <div 
                    className="w-full max-w-[16px] bg-gradient-to-t from-cyber-blue/20 to-cyber-blue/50 rounded-t-sm transition-all duration-300 group-hover:from-cyber-blue/40 group-hover:to-cyber-blue group-hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] cursor-pointer" 
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  >
                    <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-2 px-3 rounded shadow-lg border border-slate-600 z-10 pointer-events-none min-w-[160px]">
                      <div className="font-bold border-b border-slate-600 pb-1 mb-1 whitespace-nowrap text-cyber-blue">Ngày {i + 1}: Tổng {day.scans} quét</div>
                      {(!day.details || day.details.length === 0) ? (
                        <div className="text-gray-400 italic">Không có dữ liệu</div>
                      ) : (
                        <ul className="space-y-1">
                          {day.details.map(d => (
                            <li key={d.email} className="flex justify-between gap-4">
                              <span className="text-gray-300 truncate max-w-[120px]">{d.email}</span>
                              <span className="font-mono text-emerald-400">{d.count}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] sm:text-xs text-cyber-text-muted font-mono">
                  {(i + 1) % 2 !== 0 ? i + 1 : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Tracking Section */}
      <div className="glass-panel rounded-2xl border border-cyber-border overflow-hidden">
        <div className="p-6 border-b border-cyber-border/50 bg-cyber-card-light/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-display font-bold flex items-center gap-2 text-cyber-text-main">
              <FileText className="w-5 h-5 text-cyber-purple" />
              Giám sát Lỗ hổng theo Người dùng
            </h2>
            <div className="flex items-center gap-4">
              {selectedSeverity && (
                <span className="text-xs font-medium px-2 py-1 bg-cyber-border/30 rounded text-cyber-text-muted">
                  Lọc: {selectedSeverity}
                </span>
              )}
              <div className="flex items-center gap-2 bg-cyber-input-bg border border-cyber-border rounded-lg px-3 py-2 w-full sm:w-72">
                <User className="w-4 h-4 text-cyber-text-muted" />
                <select 
                  className="bg-transparent text-sm text-cyber-text-main outline-none cursor-pointer w-full"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="" className="bg-slate-900 text-white">Tất cả Người dùng</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">{u.email}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-0">
          {isLoadingVulns ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userVulns.length === 0 ? (
            <div className="p-12 text-center text-emerald-500/70">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Người dùng này chưa phát hiện lỗ hổng nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyber-border bg-cyber-card-light/20">
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted">Thời gian</th>
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted">Người dùng</th>
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted">Mục tiêu</th>
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted">Loại lỗi</th>
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted">Tham số</th>
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted">Mức độ</th>
                    <th className="p-4 text-sm font-semibold text-cyber-text-muted text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/30">
                  {userVulns.map(v => (
                    <tr key={v.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-cyber-text-muted whitespace-nowrap">{v.scan_date}</td>
                      <td className="p-4 text-sm text-cyber-text-main font-semibold">{v.user_email}</td>
                      <td className="p-4 text-sm text-cyber-text-main font-mono">{v.target_url}</td>
                      <td className="p-4 text-sm text-cyber-text-main font-bold whitespace-nowrap">{v.vuln_type}</td>
                      <td className="p-4 text-sm text-cyber-text-muted font-mono">{v.parameter_name || '-'}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(v.severity)}`}>
                          {v.severity}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedVuln(v)}
                          className="p-1.5 bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue hover:text-white rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMore && (
                <div className="p-4 flex justify-center border-t border-cyber-border/30">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingVulns}
                    className="px-6 py-2 bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue font-semibold rounded-lg border border-cyber-blue/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoadingVulns ? (
                      <div className="w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                    ) : null}
                    Hiển thị thêm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedVuln(null)}>
          <div className="glass-panel rounded-2xl border border-cyber-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-cyber-border/50 sticky top-0 bg-cyber-card-light/30 backdrop-blur z-10">
              <h2 className="text-xl font-bold flex items-center gap-2 text-cyber-text-main">
                <AlertTriangle className={`w-6 h-6 ${
                  selectedVuln.severity === 'Critical' ? 'text-red-500' :
                  selectedVuln.severity === 'High' ? 'text-orange-500' :
                  selectedVuln.severity === 'Medium' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                Chi tiết lỗ hổng
              </h2>
              <button 
                onClick={() => setSelectedVuln(null)}
                className="text-cyber-text-muted hover:text-cyber-text-main p-1 hover:bg-cyber-border/30 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-cyber-border/50">
                <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${getSeverityColor(selectedVuln.severity)}`}>
                  {selectedVuln.severity}
                </span>
                <span className="px-4 py-1.5 bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 rounded-md text-sm font-mono font-bold">
                  {selectedVuln.vuln_type}
                </span>
                <span className="px-4 py-1.5 bg-cyber-input-bg text-cyber-text-muted border border-cyber-border rounded-md text-sm font-medium ml-auto">
                  {selectedVuln.scan_date}
                </span>
              </div>

              <div>
                <h3 className="text-sm text-cyber-text-muted mb-2 font-bold uppercase tracking-wide">
                  URL Mục tiêu
                </h3>
                <div className="bg-cyber-input-bg border border-cyber-border p-4 rounded-lg font-mono text-sm break-all text-cyber-text-main">
                  {selectedVuln.url}
                </div>
              </div>

              {selectedVuln.parameter_name && (
                <div>
                  <h3 className="text-sm text-cyber-text-muted mb-2 font-bold uppercase tracking-wide">
                    Tham số (Parameter)
                  </h3>
                  <div className="bg-cyber-input-bg border border-cyber-border p-4 rounded-lg font-mono text-sm text-cyber-text-main">
                    {selectedVuln.parameter_name}
                  </div>
                </div>
              )}

              {selectedVuln.payload && (
                <div>
                  <h3 className="text-sm text-cyber-text-muted mb-2 font-bold uppercase tracking-wide">
                    Payload tấn công
                  </h3>
                  <div className="bg-cyber-input-bg border border-cyber-border p-4 rounded-lg font-mono text-sm text-cyber-text-main break-all">
                    {selectedVuln.payload}
                  </div>
                </div>
              )}

              {selectedVuln.evidence && (
                <div>
                  <h3 className="text-sm text-cyber-text-muted mb-2 font-bold uppercase tracking-wide">
                    Bằng chứng (Evidence)
                  </h3>
                  <div className="bg-cyber-input-bg border border-cyber-border p-4 rounded-lg font-mono text-[13px] leading-relaxed text-cyber-text-main whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                    {selectedVuln.evidence}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
