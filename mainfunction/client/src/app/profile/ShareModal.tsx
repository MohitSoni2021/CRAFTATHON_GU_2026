import React from 'react';
import { FaShareAlt, FaTimes, FaCheck, FaQrcode } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { User } from './types';

interface ShareModalProps {
  user: User | null;
  onClose: () => void;
  copySuccess: boolean;
  onCopy: () => void;
  showQR: boolean;
  setShowQR: (show: boolean) => void;
}

export default function ShareModal({ user, onClose, copySuccess, onCopy, showQR, setShowQR }: ShareModalProps) {
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${(user as any)?._id || user?.id}` : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/10 shadow-sm">
              <FaShareAlt />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low">
              <FaTimes size={18} />
            </button>
          </div>

          <div className="mb-10 text-center">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Share Your Profile</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Provide external access to your clinical record and vitals.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Identity Link</label>
              <div className="flex gap-2 p-2 bg-surface-container-low rounded-xl border border-outline-variant">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 text-gray-600 text-xs font-bold font-mono focus:outline-none truncate"
                />
                <button
                  onClick={onCopy}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg font-extrabold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {copySuccess ? <FaCheck /> : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-outline-variant flex flex-col items-center">
              {!showQR ? (
                <button
                  onClick={() => setShowQR(true)}
                  className="text-primary font-extrabold text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-3"
                >
                  <FaQrcode size={14} /> Generate QR Identity
                </button>
              ) : (
                <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="p-6 bg-white rounded-xl shadow-2xl border border-outline-variant">
                    <QRCodeCanvas
                      value={shareUrl}
                      size={220}
                      level={"H"}
                    />
                  </div>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Hide QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
