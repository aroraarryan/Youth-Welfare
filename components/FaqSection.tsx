'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'What is Youth Welfare Department of Uttarakhand?',
    a: 'The Yuva Kalyan evam Prantiya Rakshak Dal (Youth Welfare & PRD) is a department of the Government of Uttarakhand dedicated to harnessing the potential of youth for nation-building. It develops and manages sports infrastructure across the state — including mini-stadiums, Khel Maidaans, indoor gyms, open gyms, multipurpose halls, and youth hostels — and conducts programmes such as the Khel Mahakumbh, adventure training, and vocational training. It also oversees community organisations like Yuvak Mangal Dals and Mahila Mangal Dals at the block level.',
  },
  {
    q: 'What are the categories of information Youth Welfare Department of Uttarakhand providing?',
    a: 'The portal provides: latest news and announcements from the department; a photo gallery of events and programmes; details of sports and youth infrastructure across all districts and blocks; information on training programmes (adventure training, vocational training); Khel Mahakumbh event updates; RTI-related documents; downloadable circulars, scheme guidelines, forms, and reports; and department contact details.',
  },
  {
    q: 'Is it necessary to register in the portal to avail the advantages and other functionalities?',
    a: 'No. Most information on this portal — including news, gallery, infrastructure details, downloads, and RTI documents — is freely accessible without registration. However, registering with your Google account unlocks additional features such as submitting photographs to the public gallery for departmental review and approval.',
  },
  {
    q: 'How to register in the portal?',
    a: 'Click the "Login" button in the top navigation bar and select "Public Login". You will be redirected to sign in with your existing Google account — no separate username or password is required. Once signed in, your account is created automatically and you can access registered-user features immediately.',
  },
  {
    q: 'In case of forgetting the password of the portal, how to reset password?',
    a: 'This portal uses Google Sign-In and does not maintain a separate password. There is no portal-specific password to forget. If you cannot access your Google account, please reset it directly at myaccount.google.com. Once your Google account is recovered, you can sign in to this portal as usual.',
  },
  {
    q: 'What is the Scheme/service profiles?',
    a: 'The department runs several schemes and services for the youth of Uttarakhand: (1) Khel Mahakumbh — a state-wide multi-sport competition held at district and state levels to identify and promote sporting talent; (2) Adventure Training — mountaineering, trekking, and outdoor leadership programmes conducted at institutes such as NIM Uttarkashi; (3) Vocational Training — skill development courses for youth at block and district level; (4) Yuvak Mangal Dal & Mahila Mangal Dal — registered community groups for youth and women that receive departmental support; (5) Infrastructure Development — construction and upkeep of sports and recreation facilities across the state.',
  },
  {
    q: 'Where to contact for any assistance and support?',
    a: 'You can reach us through the Contact Us page on this portal, where you can submit a query directly. Alternatively, email the department at youthwelfareuttarakhand@gmail.com. For in-person assistance, visit the Directorate of Youth Welfare & PRD, Uttarakhand. Office hours are Monday to Saturday, 10:00 AM – 5:00 PM (except public holidays).',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);

  return (
    <section className="max-w-[900px] mx-auto my-10 lg:my-15 px-5 text-center">
      <h2 className="text-2xl lg:text-[30px] text-[#0b173d] font-bold mb-1">FAQ</h2>
      <p className="mt-0 text-[#4a4a4a] text-xs lg:text-sm mb-8 lg:mb-10">Get answers of yours frequently asked questions</p>

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
              <p className="py-5 m-0 text-[#444] text-base text-left">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
