import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Check, Copy, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useRef, useState } from 'react';

interface InlineRoomQrCodeProps {
  roomCode: string;
}

export const InlineRoomQrCode: React.FC<InlineRoomQrCodeProps> = ({ roomCode }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?join=${encodeURIComponent(roomCode)}`
      : `/?join=${roomCode}`;

  useEffect(() => {
    let isCurrent = true;
    QRCode.toDataURL(joinUrl, {
      width: 256,
      margin: 1.5,
      color: {
        dark: '#101216',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isCurrent) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [joinUrl]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(joinUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-800 p-4 flex flex-col items-center gap-3 cartoon-card-shadow">
      <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="text-left">
          <p className="text-xs text-zinc-400 font-bold">รหัสห้องหมู่บ้าน (6 หลัก)</p>
          <p className="text-2xl font-mono-num font-black tracking-widest text-amber-400">
            {roomCode}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cartoon-btn-shadow flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap shrink-0"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>คัดลอกรหัสแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>คัดลอกรหัส</span>
            </>
          )}
        </button>
      </div>

      {/* Crisp Inline QR Code */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-1">
        <div className="p-2.5 bg-white rounded-xl shadow-inner shrink-0 border-2 border-zinc-700">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code สำหรับเข้าร่วมห้อง ${roomCode}`}
              referrerPolicy="no-referrer"
              className="w-36 h-36 object-contain rounded-lg"
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center bg-zinc-100 rounded-lg text-zinc-500">
              <QrCode className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            ให้เพื่อนใช้กล้องมือถือสแกน QR Code นี้ หรือกดคัดลอกลิงก์ส่งเข้ากลุ่มแชทเพื่อเข้าห้องทันที
          </p>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs cartoon-btn-shadow flex items-center justify-center sm:justify-start gap-2 transition-transform active:scale-95 whitespace-nowrap"
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4 text-zinc-950 stroke-[3] shrink-0" />
                <span className="truncate">คัดลอกลิงก์ชวนเพื่อนแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-950 stroke-[2.5] shrink-0" />
                <span className="truncate">คัดลอกลิงก์ชวนเข้าห้อง</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanRoomCode: (code: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanRoomCode,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'moonwolf-qr-reader';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          if (!isMounted) return;
          try {
            const url = new URL(decodedText);
            const codeParam = url.searchParams.get('join');
            if (codeParam) {
              onScanRoomCode(codeParam.trim().toUpperCase());
              onClose();
              return;
            }
          } catch {
            // Not a full URL, maybe a raw room code
          }

          const rawCode = decodedText.trim().toUpperCase();
          if (/^[A-Z0-9]{6}$/.test(rawCode)) {
            onScanRoomCode(rawCode);
            onClose();
          } else {
            setErrorMsg(`ตรวจพบโค้ด "${rawCode}" แต่รูปแบบรหัสห้องไม่ถูกต้อง (ต้องมี 6 ตัวอักษร)`);
          }
        },
        () => {
          // Ignore scanning frames without QR
        }
      )
      .catch(() => {
        if (isMounted) {
          setErrorMsg(
            'ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ หรือพิมพ์รหัสห้อง 6 หลักด้วยตนเอง'
          );
        }
      });

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onClose, onScanRoomCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#14161c] border-2 border-zinc-700/80 p-5 space-y-4 cartoon-card-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-zinc-100">
              สแกน QR Code เข้าห้อง
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="ปิดหน้าต่างสแกน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl overflow-hidden bg-black border-2 border-zinc-800 min-h-[250px] flex items-center justify-center relative">
          <div id={containerId} className="w-full" />
          {errorMsg && (
            <div className="p-5 text-center space-y-2">
              <p className="text-xs text-rose-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-zinc-400">
          ส่องกล้องไปยัง QR Code บนหน้าจอมือถือของผู้สร้างห้อง
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-zinc-200 cartoon-btn-shadow transition-colors"
        >
          ยกเลิกและพิมพ์รหัสด้วยตนเอง
        </button>
      </div>
    </div>
  );
};
