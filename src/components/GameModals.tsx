import { Check, Copy, Globe, HelpCircle, Server, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesAndDeployModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'FREE_HOST'>('RULES');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-...';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentOrigin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-[#14161c] border-2 border-zinc-700/80 flex flex-col cartoon-card-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-zinc-100">
              คู่มือกติกา & วิธีเล่นฟรีไม่ต้องเสียเงิน
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="px-5 pt-3">
          <div className="flex items-center gap-1 p-1 bg-[#101216] rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('RULES')}
              className={`flex-1 min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cartoon-btn-shadow ${
                activeTab === 'RULES'
                  ? 'bg-amber-500 text-zinc-950 font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              กติกา & บทบาททั้ง 8 โรล
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FREE_HOST')}
              className={`flex-1 min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cartoon-btn-shadow ${
                activeTab === 'FREE_HOST'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              เล่นฟรี 100% ไม่ต้องผูกบัตร
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          {activeTab === 'RULES' ? (
            <>
              <div className="rounded-xl bg-[#101216] border border-zinc-800 p-4 space-y-2">
                <h3 className="text-sm font-bold text-amber-400">
                  บทบาททั้งหมด 8 โรล (หัวหน้าห้องปรับแต่งได้ 4–12 ผู้เล่น)
                </h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>
                    <strong className="text-rose-400">🐺 มนุษย์หมาป่า (Werewolf):</strong>{' '}
                    ตื่นยามวิกาลช่วงที่ 1 เพื่อเลือกสังหารเหยื่อคืนละ 1 คน ชนะเมื่อจำนวนหมาป่าที่รอดชีวิตเท่ากับหรือมากกว่าผู้เล่นที่เหลือ
                  </li>
                  <li>
                    <strong className="text-rose-300">🗡️ ลูกสมุนหมาป่า (Minion):</strong>{' '}
                    อยู่ฝ่ายรัตติกาล รู้ว่าใครคือหมาป่าตั้งแต่เริ่มเกม หากแม่หมอส่องจะเห็นเป็นฝ่ายชาวบ้าน
                  </li>
                  <li>
                    <strong className="text-emerald-300">🛡️ บอดี้การ์ด (Bodyguard):</strong>{' '}
                    ตื่นยามวิกาลช่วงที่ 2 เลือกกางโล่คุ้มครองผู้เล่น 1 คนจากการถูกหมาป่ากัด (ห้ามปกป้องคนเดิมซ้ำ 2 คืนติดกัน)
                  </li>
                  <li>
                    <strong className="text-amber-300">👁️ ผู้หยั่งรู้ / แม่หมอ (Seer):</strong>{' '}
                    ตื่นยามวิกาลช่วงที่ 3 เพื่อตรวจสอบผู้เล่น 1 คนว่าเป็นมนุษย์หมาป่าหรือไม่
                  </li>
                  <li>
                    <strong className="text-emerald-400">🧪 แม่มด (Witch):</strong>{' '}
                    ตื่นยามวิกาลช่วงที่ 4 มียาชุบชีวิต 1 ขวดสำหรับช่วยเหยื่อที่ถูกกัด และยาพิษ 1 ขวดสำหรับสังหารผู้ต้องสงสัย (ใช้ได้ขวดละ 1 ครั้งต่อเกม)
                  </li>
                  <li>
                    <strong className="text-teal-300">🎯 นายพราน (Hunter):</strong>{' '}
                    ตั้งศูนย์เล็งปืนลูกซองไว้ที่ผู้ต้องสงสัยได้ตลอดเวลา หากนายพรานถูกสังหารหรือถูกโหวตประหาร จะลั่นไกยิงเป้าหมายตายตามทันที!
                  </li>
                  <li>
                    <strong className="text-amber-400">🃏 คนบ้า / โจ๊กเกอร์ (Fool):</strong>{' '}
                    ฝ่ายอิสระ! ชนะเดี่ยวทันทีหากหลอกล่อให้หมู่บ้านโหวตประหารตัวเองในตอนกลางวันสำเร็จ
                  </li>
                  <li>
                    <strong className="text-sky-300">🏮 ชาวบ้าน (Villager):</strong>{' '}
                    ไม่มีพลังยามค่ำคืน ใช้ตรรกะจับพิรุธและลงคะแนนโหวตขับไล่หมาป่าในตอนกลางวัน
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-[#101216] border border-zinc-800 p-4 space-y-2">
                <h3 className="text-sm font-bold text-amber-400">
                  ลำดับการดำเนินเกมอัตโนมัติ (แยกช่วงเวลากลางคืน)
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>
                    <strong>ตั้งค่าห้อง (4–12 คน):</strong> หัวหน้าห้องเลือกจำนวนผู้เล่น ใช้ปุ่มแนะนำสัดส่วนโรลอัตโนมัติ (สมดุล / ปาร์ตี้ / พลังพิเศษ) หรือปรับจำนวนแต่ละโรลเองได้
                  </li>
                  <li>
                    <strong>ยามราตรีแยกช่วงเวลาชัดเจน:</strong> ระบบจะเรียกตื่นทีละบทบาทตามที่มีในห้อง ได้แก่ หมาป่า → บอดี้การ์ด → แม่หมอ → แม่มด
                  </li>
                  <li>
                    <strong>รุ่งอรุณและโหวตขับไล่:</strong> ประกาศผลเมื่อคืน อภิปรายหาคนร้าย และโหวตประหาร (มีระบบโหวตตัดเชือกเมื่อคะแนนเท่ากัน)
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-950/60 border border-emerald-600/60 p-4 space-y-2 text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ไม่ต้องใช้ Google Cloud ไม่ต้องผูกบัตรเครดิต!</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  คุณไม่ต้องสมัคร Google Cloud หรือกังวลเรื่องการคิดเงินเลยครับ เพราะเว็บแอปเกม Moonwolf นี้สามารถเล่นและแชร์ได้ฟรีแบบ 100%:
                </p>
              </div>

              {/* Method 1: AI Studio Link */}
              <div className="rounded-xl bg-[#101216] border border-zinc-800 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Globe className="w-4 h-4" />
                  <span>วิธีที่ 1: เล่นผ่าน AI Studio ได้เลย (ฟรีตลอด ไม่เสียเงิน)</span>
                </div>
                <p className="text-xs text-zinc-300">
                  หน้าเว็บที่คุณกำลังเปิดอยู่นี้ทำงานได้สมบูรณ์แบบ แค่กดปุ่ม <strong>Share (แชร์)</strong> ที่มุมบนของหน้าจอ AI Studio แล้วส่งลิงก์หรือสแกน QR Code ให้เพื่อน ก็เข้าเล่นด้วยกันได้ทันที ไม่ต้องติดตั้งอะไรเพิ่ม
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center gap-1.5 text-xs cartoon-btn-shadow transition-transform active:scale-95"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>คัดลอกลิงก์ห้องแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกลิงก์เกมส่งให้เพื่อน</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Method 2: Render.com */}
              <div className="rounded-xl bg-[#101216] border border-zinc-800 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Server className="w-4 h-4" />
                  <span>วิธีที่ 2: รันบน Render.com (ฟรีถาวร ไม่ต้องผูกบัตรเครดิต)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  หากต้องการนำโค้ดไปรันเซิร์ฟเวอร์ส่วนตัวฟรีตลอดชีพ แนะนำ <strong>Render.com</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-300 pl-1">
                  <li>นำโค้ดขึ้น GitHub ของคุณ</li>
                  <li>เข้า render.com สมัครด้วย GitHub (ฟรี 100% ไม่ต้องกรอกบัตร)</li>
                  <li>เลือก <strong>New Web Service</strong> แล้วเลือก Repository นี้</li>
                  <li>ในช่อง Build Command ใส่ <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-400">npm install && npm run build</code></li>
                  <li>ในช่อง Start Command ใส่ <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-400">npm start</code></li>
                  <li>เลือก Plan เป็น <strong>Free</strong> แล้วกด Deploy ได้ทันที!</li>
                </ol>
              </div>

              {/* Method 3: Mobile Fullscreen PWA */}
              <div className="rounded-xl bg-[#101216] border border-zinc-800 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>วิธีเล่นแบบเต็มจอ 100% ไม่มีแถบค้นหาบนมือถือ</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  ทั้งคุณและเพื่อนๆ สามารถแตะปุ่ม <strong>&ldquo;ติดตั้งเต็มจอ&rdquo;</strong> หรือทำตามคำแนะนำ &ldquo;เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)&rdquo; ในเบราว์เซอร์ เมื่อเปิดจากไอคอนบนมือถือ จะแสดงผลเต็มจอไร้แถบ URL เสมือนแอปแท้ทันทีครับ!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#101216] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-zinc-100 cartoon-btn-shadow transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
