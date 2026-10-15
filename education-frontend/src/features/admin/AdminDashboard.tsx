"use client";

import React, { useState } from "react";
import { User, MediaAsset, AuditLog } from "@/types";
import { MOCK_MEDIA_ASSETS, MOCK_AUDIT_LOGS, MOCK_USERS } from "@/lib/mock-data";
import { 
  Users, 
  Video, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Upload, 
  FileVideo, 
  Cpu, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Database,
  Search,
  DollarSign,
  Bot,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: User;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'curriculum' | 'rbac' | 'audit' | 'ai'>('overview');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Giả lập Upload qua S3 Presigned URL (Mục 8.2 & 7 trong PDF)
  const handleSimulatePresignedUpload = () => {
    setUploadStatus("Đang yêu cầu Spring Boot cấp S3 Presigned Upload URL...");
    setUploadProgress(15);

    setTimeout(() => {
      setUploadStatus("Đã nhận Presigned URL! Đang tải thẳng lên Object Storage (Bỏ qua Spring Boot)...");
      setUploadProgress(65);

      setTimeout(() => {
        setUploadStatus("Upload S3 hoàn tất! Worker đang kích hoạt chuyển mã (Transcoding HLS multi-bitrate)...");
        setUploadProgress(100);

        setTimeout(() => {
          setUploadProgress(null);
          setUploadStatus("Video đã được đưa vào hàng đợi HLS thành công!");
        }, 2000);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-[#0B2147] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-[#14BF96] text-white uppercase tracking-wider">
              Cổng Quản Trị Hệ Thống (CMS)
            </span>
            <span className="text-xs text-slate-300">Modular Monolith Architecture</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Trung Tâm Vận Hành & Quản Lý K–12
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Quản trị nội dung, media streaming HLS, phân quyền RBAC và kiểm soát chi phí AI.
          </p>
        </div>

        <button
          onClick={onExitAdmin}
          className="khan-btn-secondary text-xs self-start md:self-auto cursor-pointer"
        >
          Quay lại giao diện Học sinh
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 no-scrollbar text-xs font-bold">
        {[
          { key: 'overview', label: 'Tổng Quan Hệ Thống', icon: Activity },
          { key: 'media', label: 'Quản Lý Media & Video HLS', icon: Video },
          { key: 'curriculum', label: 'Chương Trình Học (K-12)', icon: BookOpen },
          { key: 'rbac', label: 'Người Dùng & Phân Quyền', icon: Users },
          { key: 'audit', label: 'Nhật Ký Kiểm Toán (Audit)', icon: ShieldCheck },
          { key: 'ai', label: 'Trợ Lý AI Quản Trị', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#0B2147] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#14BF96]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Tab Tổng Quan (Overview KPIs) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Học sinh hoạt động</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">12,480</p>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% so với tuần trước
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Video HLS trên CDN</span>
                <Video className="w-4 h-4 text-[#14BF96]" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">1,240</p>
              <div className="text-[11px] text-slate-500 font-medium">
                100% Adaptive Bitrate (480p-1080p)
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Chi phí AI OpenAI</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">$14.20 / $50.00</p>
              <div className="text-[11px] text-emerald-600 font-bold">
                Dưới hạn mức ngân sách tháng
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Trạng thái Hạ tầng</span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">Ổn định</p>
              <div className="text-[11px] text-slate-500 font-medium">
                HikariCP: 4/15 kết nối · PostgreSQL
              </div>
            </div>
          </div>

          {/* Infrastructure & Architecture Health Monitor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#14BF96]" />
              Giám Sát Hạ Tầng Sản Xuất (Theo Mục 12 trong Tài Liệu Kiến Trúc)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Ứng dụng Spring Boot</p>
                <div className="flex justify-between text-slate-500">
                  <span>JVM Heap Memory:</span>
                  <span className="font-bold text-slate-800">420 MB / 2048 MB</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>P95 Response Latency:</span>
                  <span className="font-bold text-emerald-600">42 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Cơ sở dữ liệu PostgreSQL</p>
                <div className="flex justify-between text-slate-500">
                  <span>Flyway Migration:</span>
                  <span className="font-bold text-emerald-600">V1 (Áp dụng đầy đủ)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>pgvector Extension:</span>
                  <span className="font-bold text-emerald-600">Sẵn sàng (Indexed)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Object Storage & CDN</p>
                <div className="flex justify-between text-slate-500">
                  <span>Tỉ lệ CDN Cache Hit:</span>
                  <span className="font-bold text-emerald-600">96.8%</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Dung lượng lưu trữ:</span>
                  <span className="font-bold text-slate-800">48.5 GB / 500 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab Quản Lý Media & Video */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Direct Presigned URL Upload Mockup */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#14BF96]" />
                  Tải Lên Video Bài Giảng Mới (Luồng Presigned URL Trực Tiếp S3)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo Mục 8.2: Trình duyệt tải thẳng lên Object Storage, Spring Boot không nghẽn băng thông.
                </p>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 hover:border-[#14BF96] rounded-2xl text-center space-y-3 bg-slate-50/50 transition">
              <FileVideo className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Kéo thả file video bài giảng (.mp4, .mov) vào đây
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Dung lượng tối đa: 2 GB · Tự động đóng gói đa độ phân giải HLS (480p, 720p, 1080p)
                </p>
              </div>

              {uploadProgress !== null ? (
                <div className="max-w-md mx-auto space-y-2 pt-2">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#14BF96] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">{uploadStatus}</p>
                </div>
              ) : (
                <button
                  onClick={handleSimulatePresignedUpload}
                  className="khan-btn-primary text-xs px-6 py-2.5 cursor-pointer mt-2"
                >
                  Thử nghiệm tải video giả lập
                </button>
              )}
            </div>
          </div>

          {/* Media Assets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Danh Sách Video Assets & Trạng Thái Transcoding
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Tên File Gốc</th>
                    <th className="p-3.5">Storage Key (S3)</th>
                    <th className="p-3.5">Dung Lượng</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5">CDN HLS Endpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {MOCK_MEDIA_ASSETS.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">{m.originalFilename}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{m.storageKey}</td>
                      <td className="p-3.5">{Math.round(m.fileSizeBytes / (1024 * 1024))} MB</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'READY' ? 'bg-emerald-100 text-emerald-700' :
                          m.status === 'TRANSCODING' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {m.status === 'READY' ? 'Sẵn Sàng (Ready)' : 'Đang chuyển mã HLS...'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-blue-600">
                        {m.hlsUrl || "Chờ xử lý..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab Người Dùng & Phân Quyền (RBAC) */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Phân Quyền Vai Trò (RBAC) & Bảo Mật Dữ Liệu Học Sinh
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Theo Mục 4 & Mục 10: Backend kiểm tra quyền từng tài nguyên, kiểm tra quyền sở hữu dữ liệu (ngăn chặn tấn công IDOR).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Vai Trò (Role)</th>
                  <th className="p-3">Phạm Vi Quyền Dữ Liệu (Scope)</th>
                  <th className="p-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-900">Nguyễn Minh An</td>
                  <td className="p-3">minhan@student.k12.edu.vn</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">STUDENT</span>
                  </td>
                  <td className="p-3 text-slate-500">Chỉ xem tiến độ & bài thi của chính mình</td>
                  <td className="p-3 text-emerald-600 font-bold">Đang học</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Thầy Trần Nam</td>
                  <td className="p-3">trannam@school.edu.vn</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">TEACHER</span>
                  </td>
                  <td className="p-3 text-slate-500">Quản lý bài học, bài tập các lớp phụ trách</td>
                  <td className="p-3 text-emerald-600 font-bold">Hoạt động</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Ban Quản Trị Hệ Thống</td>
                  <td className="p-3">admin@k12.edu.vn</td>
                  <td className="p-3">
                    <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">SUPER_ADMIN</span>
                  </td>
                  <td className="p-3 text-slate-500">Toàn quyền hệ thống, cấu hình quota AI & hạ tầng</td>
                  <td className="p-3 text-emerald-600 font-bold">Hoạt động</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab Nhật Ký Kiểm Toán (Audit Logs) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#14BF96]" />
              Nhật Ký Kiểm Toán Hệ Thống (Audit Logs - Mục 5 & 10.1)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ghi lại mọi thay đổi quyền, hạn mức và thao tác quản trị nhằm đảm bảo khả năng truy vết và bảo vệ dữ liệu.
            </p>
          </div>

          <div className="space-y-3">
            {MOCK_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-500">bởi</span>
                    <span className="font-bold text-blue-700">{log.userName}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{log.details}</p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono self-end sm:self-auto">
                  {log.createdAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tab Trợ Lý AI Quản Trị (Admin AI) */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Trợ Lý AI Quản Trị (Admin Assistant - Mục 9.2)
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ tra cứu tài liệu vận hành và hướng dẫn cấu hình hệ thống (Không tự ý thực thi SQL).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3 text-xs text-purple-900">
            <p className="font-bold">Các câu hỏi mẫu dành cho quản trị viên:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800">
                "Làm thế nào để tăng hạn mức token OpenAI cho kỳ thi?"
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800">
                "Quy trình thu hồi quyền của tài khoản giáo viên đã nghỉ việc?"
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800">
                "Hướng dẫn kiểm tra log truy vấn chậm qua PostgreSQL EXPLAIN"
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Chương Trình Học (Curriculum) */}
      {activeTab === 'curriculum' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-base text-slate-900">
            Cấu Trúc Chương Trình Học Toàn Diện K–12
          </h3>
          <p className="text-slate-500">
            Quản lý cây danh mục 12 khối lớp theo đúng quy chuẩn Bộ GD&ĐT.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
              <div key={g} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-bold text-slate-800 hover:border-[#14BF96] transition cursor-pointer">
                Lớp {g}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
