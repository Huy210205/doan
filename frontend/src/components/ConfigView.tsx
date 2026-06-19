import React, { useState } from 'react';
import { Settings, Cpu, Mail, Save, Loader2, Info } from 'lucide-react';
import { SystemConfig } from '../types';
import contentData from '../data/contentData.json';

interface ConfigViewProps {
  initialConfig: SystemConfig;
  onSaveConfig: (updatedConfig: SystemConfig) => void;
}

export default function ConfigView({ initialConfig, onSaveConfig }: ConfigViewProps) {
  const { system_config } = contentData;

  const [maxDepth, setMaxDepth] = useState(initialConfig.crawler.max_depth);
  const [delayMs, setDelayMs] = useState(initialConfig.crawler.delay_ms);
  const [selectedModelId, setSelectedModelId] = useState(initialConfig.selected_model_id);
  const [retrainOnNewData, setRetrainOnNewData] = useState(initialConfig.retrain_on_new_data);
  const [email, setEmail] = useState(initialConfig.pdf_report_email);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessToast(false);

    // Simulate saving credentials
    setTimeout(() => {
      onSaveConfig({
        crawler: {
          max_depth: Number(maxDepth),
          delay_ms: Number(delayMs)
        },
        selected_model_id: selectedModelId,
        retrain_on_new_data: retrainOnNewData,
        pdf_report_email: email
      });
      setIsSaving(false);
      setSuccessToast(true);

      // Dismiss success toast automatically
      setTimeout(() => {
        setSuccessToast(false);
      }, 3500);
    }, 1000);
  };

  return (
    <div id="config-view" className="space-y-6 animate-fadeIn py-6 px-8 max-w-4xl mx-auto w-full">
      {/* Top Header Panel */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-cyber-text-main">
            Cấu hình Hệ thống & AI
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            Thiết lập chiều sâu thu thập dữ liệu và tinh chỉnh bộ phân loại trí tuệ nhân tạo.
          </p>
        </div>
      </div>

      {/* Save Success Toast */}
      {successToast && (
        <div id="save-success-toast" className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-305 text-sm flex items-center gap-3 animate-fadeIn cyber-glow-success font-semibold">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>Lưu cấu hình hệ thống và tham số bộ phân loại trí tuệ nhân tạo thành công!</span>
        </div>
      )}

      {/* Main Settings Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Cấu hình Crawler */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyber-border/40 text-cyber-blue font-semibold">
            <span className="text-sm font-mono tracking-wider">1. Cấu hình Crawler</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cyber-text-muted block font-mono">
                Độ sâu tối đa (Max Depth)
              </label>
              <input
                id="crawler-depth-input"
                type="number"
                min="1"
                max="10"
                required
                className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm font-mono rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-cyber-border/80 transition-all"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
              />
            </div>
 
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cyber-text-muted block font-mono">
                Delay giữa các request (ms)
              </label>
              <input
                id="crawler-delay-input"
                type="number"
                min="0"
                max="5000"
                required
                className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm font-mono rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-cyber-border/80 transition-all"
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
 
        {/* Section 2: Mô hình Trí tuệ Nhân tạo (AI) */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyber-border/40 text-cyber-blue font-semibold">
            <span className="text-sm font-mono tracking-wider">2. Mô hình Trí tuệ Nhân tạo (AI)</span>
          </div>
 
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cyber-text-muted block font-mono">
                Chọn Mô hình Phân loại
              </label>
              <select
                id="ai-model-select"
                className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyber-blue hover:border-cyber-border/80 transition-all cursor-pointer"
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
              >
                {system_config.ai_models.map((model) => (
                  <option key={model.id} value={model.id} className="bg-cyber-card text-cyber-text-main">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
 
            {/* Model short breakdown notes */}
            <div className="p-4 bg-cyber-card-light/40 border border-cyber-border rounded-xl flex gap-3 text-xs text-cyber-text-main leading-relaxed shadow-sm">
              <Cpu className="w-5 h-5 text-cyber-blue shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyber-text-main block mb-0.5 font-bold">Mô tả đặc điểm mô hình:</strong>
                {system_config.ai_models.find(m => m.id === selectedModelId)?.description}
              </div>
            </div>
 
            {/* Retrain checkbox */}
            <label className="flex items-start gap-3 select-none cursor-pointer group">
              <input
                id="retrain-checkbox"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-cyber-border text-cyber-blue focus:ring-1 focus:ring-cyber-blue bg-black/40 cursor-pointer"
                checked={retrainOnNewData}
                onChange={(e) => setRetrainOnNewData(e.target.checked)}
              />
              <div className="text-xs">
                <span className="text-cyber-text-main font-semibold group-hover:text-cyber-blue transition-colors block">
                  Tự động học lại (Retrain) khi có dữ liệu mới
                </span>
                <span className="text-cyber-text-muted block mt-0.5">
                  Tải dữ liệu quét an toàn lên bộ nhớ đệm an toàn để huấn luyện bổ sung, nâng cao độ chính xác theo thời gian.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Thông báo & Báo cáo */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyber-border/40 text-purple-650 dark:text-purple-400 font-semibold">
            <span className="text-sm font-mono tracking-wider">3. Thông báo & Báo cáo</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cyber-text-muted block font-mono">
              Email nhận báo cáo PDF tự động
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                id="report-email-input"
                type="email"
                required
                className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm font-mono rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-cyber-border/80 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />
            </div>
          </div>
        </div>

        {/* Bottom save button CTA right aligned */}
        <div className="flex justify-end pt-2">
          <button
            id="save-config-btn"
            type="submit"
            disabled={isSaving}
            className="bg-cyber-blue hover:bg-blue-600 border border-blue-500/20 text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl flex items-center gap-2.5 cursor-pointer shadow-lg hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] duration-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Cấu hình</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
