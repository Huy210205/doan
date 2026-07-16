import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, Lock, Unlock, Shield, ShieldOff, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { UserProfile, UserSession } from '../types';
import api from '../api';

type Toast = { message: string; type: 'success' | 'error' };

export default function UserManagementView({ session }: { session: UserSession }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{type: 'delete' | 'toggleStatus' | 'toggleRole', user: UserProfile} | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users', { headers: { Authorization: `Bearer ${session.token}` } });
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (session.token) fetchUsers();
  }, [session.token]);

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    setConfirmAction(null);

    if (type === 'delete') {
      try {
        await api.delete(`/auth/users/${user.id}`, { headers: { Authorization: `Bearer ${session.token}` } });
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showToast(`Đã xóa tài khoản ${user.email} thành công.`, 'success');
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Có lỗi xảy ra khi xóa tài khoản.', 'error');
      }
    } else if (type === 'toggleStatus') {
      try {
        await api.put(`/auth/users/${user.id}/status`, {}, { headers: { Authorization: `Bearer ${session.token}` } });
        const wasActive = user.status === 'active';
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: wasActive ? 'blocked' : 'active' } : u));
        showToast(wasActive ? `Đã khóa tài khoản ${user.email} thành công.` : `Đã mở khóa tài khoản ${user.email} thành công.`, 'success');
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Có lỗi xảy ra khi cập nhật trạng thái.', 'error');
      }
    } else if (type === 'toggleRole') {
      try {
        await api.put(`/auth/users/${user.id}/role`, {}, { headers: { Authorization: `Bearer ${session.token}` } });
        const wasAdmin = user.role === 'admin';
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: wasAdmin ? 'user' : 'admin' } : u));
        showToast(wasAdmin ? `Đã hạ quyền ${user.email} xuống User.` : `Đã thăng quyền ${user.email} lên Admin thành công.`, 'success');
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Có lỗi xảy ra khi đổi quyền.', 'error');
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-cyber-text-main flex items-center gap-3">
          <Users className="w-8 h-8 text-cyber-blue" />
          Quản lý Người dùng
        </h1>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-cyber-input-bg border border-cyber-border rounded-xl focus:ring-2 focus:ring-cyber-blue focus:border-transparent outline-none transition-all text-cyber-text-main"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-cyber-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cyber-card-light/50 border-b border-cyber-border text-sm font-medium text-cyber-text-muted">
              <tr>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Vai trò</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Ngày tham gia</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-cyber-text-muted">Đang tải...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-cyber-blue/5 transition-colors">
                  <td className="py-4 px-6 font-medium">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' 
                        ? 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20' 
                        : 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-cyber-text-muted">{user.createdAt}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button 
                      onClick={() => setConfirmAction({ type: 'toggleRole', user })}
                      className="p-2 rounded-lg hover:bg-cyber-purple/10 text-cyber-text-muted hover:text-cyber-purple transition-colors"
                      title={user.role === 'admin' ? "Hạ quyền thành User" : "Thăng quyền Admin"}
                    >
                      {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setConfirmAction({ type: 'toggleStatus', user })}
                      className="p-2 rounded-lg hover:bg-yellow-500/10 text-cyber-text-muted hover:text-yellow-500 transition-colors"
                      title={user.status === 'active' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setConfirmAction({ type: 'delete', user })}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-cyber-text-muted hover:text-red-500 transition-colors"
                      title="Xóa người dùng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-cyber-text-muted">Không tìm thấy người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmAction(null)}>
          <div className="glass-panel rounded-2xl border border-cyber-border max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-cyber-border/50">
              <h3 className="text-xl font-bold flex items-center gap-2 text-cyber-text-main">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Xác nhận thao tác
              </h3>
            </div>
            <div className="p-6">
              <p className="text-cyber-text-main mb-4">
                {confirmAction.type === 'delete'
                  ? 'Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này?'
                  : confirmAction.type === 'toggleStatus'
                    ? (confirmAction.user.status === 'active' ? 'Bạn có chắc chắn muốn khóa tài khoản này?' : 'Bạn có chắc chắn muốn mở khóa tài khoản này?')
                    : (confirmAction.user.role === 'admin' ? 'Bạn có chắc chắn muốn hạ quyền tài khoản này xuống User?' : 'Bạn có chắc chắn muốn thăng quyền tài khoản này lên Admin?')
                }
              </p>
              <div className="flex items-center gap-3 p-3 bg-cyber-input-bg rounded-xl border border-cyber-border/50">
                <div className={`p-2 rounded-lg ${confirmAction.user.role === 'admin' ? 'bg-cyber-purple/20 text-cyber-purple' : 'bg-cyber-blue/20 text-cyber-blue'}`}>
                  {confirmAction.user.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-cyber-text-main truncate">{confirmAction.user.email}</p>
                  <p className="text-xs text-cyber-text-muted">{confirmAction.user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                </div>
              </div>
              
              {confirmAction.type === 'delete' && (
                <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm flex items-start gap-2 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Hành động này không thể hoàn tác. Toàn bộ lịch sử quét và dữ liệu của người dùng này sẽ bị xóa sạch khỏi hệ thống.
                  </p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-cyber-border/50 bg-cyber-card-light/30 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg font-medium text-cyber-text-muted hover:text-cyber-text-main hover:bg-white/5 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeConfirmAction}
                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-lg ${
                  confirmAction.type === 'delete' 
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30' 
                    : confirmAction.type === 'toggleStatus'
                      ? confirmAction.user.status === 'active'
                        ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black border border-yellow-500/30'
                        : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                      : 'bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple hover:text-white border border-cyber-purple/30'
                }`}
              >
                {confirmAction.type === 'delete'
                  ? 'Xóa vĩnh viễn'
                  : confirmAction.type === 'toggleStatus'
                    ? (confirmAction.user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa')
                    : (confirmAction.user.role === 'admin' ? 'Hạ xuống User' : 'Thăng lên Admin')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl animate-slideUp transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/95 border-red-500/40 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 shrink-0" />
            : <XCircle className="w-5 h-5 shrink-0" />
          }
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
