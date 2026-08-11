import Link from 'next/link';
import { Clock3 } from 'lucide-react';

interface ComingSoonProps {
  label: string;
}

export default function ComingSoon({ label }: ComingSoonProps) {
  return (
    <div className="px-5 lg:px-10 py-16 lg:py-24">
      <div className="max-w-[600px] mx-auto text-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#eef1ff] flex items-center justify-center mx-auto mb-6">
          <Clock3 className="w-8 h-8 lg:w-10 lg:h-10 text-[#5b5fc7]" strokeWidth={1.75} />
        </div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1a1a3c] mb-3">
          Registration Coming Soon
        </h2>
        <p className="text-[15px] lg:text-base text-gray-500 mb-8">
          {label} registration isn&apos;t open yet. Check back soon — we&apos;ll
          announce dates here as soon as they&apos;re confirmed.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#5b5fc7] hover:bg-[#4a4eb3] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
