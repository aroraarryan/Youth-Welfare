'use client';

import { useState } from 'react';

const faqs = [
  { q: 'What is Youth Welfare Department of Uttarkhand?' },
  { q: 'What are the categories of information Youth Welfare Department of Uttarkhand providing?' },
  { q: 'Is it necessary to register in the portal to avail the advantages and other functionalities?' },
  { q: 'How to register in the portal?' },
  { q: 'In case of forgetting the password of the portal, how to reset password?' },
  { q: 'What is the Scheme/service profiles?' },
  { q: 'Where to contact for any assistance and support?' },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);

  return (
    <section className="max-w-[900px] mx-auto my-15 px-5 text-center">
      <h2 className="text-[30px] text-[#0b173d] font-bold mb-1">FAQ</h2>
      <p className="mt-0 text-[#4a4a4a] text-sm mb-10">Get answers of yours frequently asked questions</p>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className={`accordion-header w-full px-5 py-5 text-sm font-semibold text-left border-none outline-none bg-white text-[#2a2a2a] cursor-pointer relative pr-12 ${openIndex === i ? 'active' : ''}`}
            >
              {faq.q}
            </button>
            <div
              className="overflow-hidden bg-[#f6f6f6] transition-all duration-300 px-5"
              style={{ maxHeight: openIndex === i ? '200px' : '0' }}
            >
              <p className="py-5 m-0 text-[#444] text-base">
                Answer goes here...
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
