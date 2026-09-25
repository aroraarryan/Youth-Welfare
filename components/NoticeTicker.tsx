const REPEAT_COUNT = 2;

const TITLE = 'महत्वपूर्ण सूचना | मुख्यमंत्री चैम्पियनशिप ट्रॉफी';

const MESSAGE = [
  'मुख्यमंत्री चैम्पियनशिप ट्रॉफी के अंतर्गत जिन खेलों की प्रतियोगिताएं सीधे राज्य स्तर पर आयोजित की जानी हैं, उन खेलों हेतु चयन ट्रायल जनपद स्तर पर आयोजित किए जाएंगे।',
  'अतः संबंधित खेलों में प्रतिभाग करने के इच्छुक सभी प्रतिभागी चयन ट्रायल की तिथि, स्थान एवं अन्य आवश्यक जानकारी के लिए अपने संबंधित जनपद के जिला युवा कल्याण एवं प्रांतीय रक्षक दल अधिकारी कार्यालय से संपर्क करें।',
  'सभी प्रतिभागियों से अनुरोध है कि समय से संबंधित कार्यालय से संपर्क कर आवश्यक जानकारी प्राप्त करना सुनिश्चित करें।',
];

const SIGNATURE = 'निदेशालय, युवा कल्याण एवं प्रांतीय रक्षक दल, उत्तराखण्ड';

function NoticeItem() {
  return (
    <span className="flex items-center gap-4 shrink-0 px-10 text-slate-900 text-sm whitespace-nowrap">
      <span className="font-bold">{TITLE}</span>
      <span>»</span>
      {MESSAGE.map((line) => (
        <span key={line} className="font-medium">
          {line}
        </span>
      ))}
      <span className="font-bold">{SIGNATURE}</span>
      <span className="pl-6">•</span>
    </span>
  );
}

export default function NoticeTicker() {
  return (
    <div lang="hi" role="region" aria-label="महत्वपूर्ण सूचना" className="w-full bg-amber-400 overflow-hidden">
      <div className="flex w-max motion-safe:animate-[marquee-scroll_200s_linear_infinite] hover:[animation-play-state:paused] py-2.5 motion-reduce:w-full motion-reduce:flex-wrap">
        <div className="flex shrink-0 motion-reduce:flex-wrap">
          {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
            <NoticeItem key={`a-${i}`} />
          ))}
        </div>
        <div className="flex shrink-0 motion-reduce:hidden" aria-hidden="true">
          {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
            <NoticeItem key={`b-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
