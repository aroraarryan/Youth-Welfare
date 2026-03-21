import Link from 'next/link';
import Image from 'next/image';
import Carousel from '@/components/Carousel';
import FloatingSearchUI from '@/components/FloatingSearchUI';
import FaqSection from '@/components/FaqSection';

// ── Infrastructure cards ────────────────────────────────────
const infraCards = [
  { icon: '🏢', title: 'Multipurpose Halls',          href: '/multipurpose-halls' },
  { icon: '🏟️', title: 'Mini Stadiums',               href: '/mini-stadiums' },
  { icon: '🏠', title: 'Youth hostel',                 href: '#' },
  { icon: '🏃', title: 'Vocational Training Centers',  href: '#' },
];

// ── Registration cards ──────────────────────────────────────
const registrationCards = [
  { icon: '🏃‍♂️', title: 'Sports (Khel Mahakumbh)',  desc: 'Register for sports programs and competitions',      href: '/khel-mahakumbh' },
  { icon: '🤝',   title: 'Youth Volunteering',         desc: 'Join volunteer programs and community service',       href: '/youth-volunteering' },
  { icon: '🔧',   title: 'Vocational Training',         desc: 'Enroll in skill development and training programs',   href: '/vocational-training' },
  { icon: '🏁',   title: 'Adventure Training Program',  desc: 'Join us for an exciting adventure training program.', href: '/adventure-training' },
];

// ── Schemes cards ───────────────────────────────────────────
const schemeCards = [
  { badge: '23 Schemes', icon: '🎓', title: 'Education &\nScholarship' },
  { badge: '14 Schemes', icon: '💼', title: 'Business &\nEntrepreneurship' },
  { badge: '12 Schemes', icon: '⚙️', title: 'Skill Development' },
  { badge: '3 Schemes',  icon: '🏃', title: 'Sport & Culture' },
  { badge: '22 Schemes', icon: '💼', title: 'Employment' },
  { badge: '8 Schemes',  icon: '✊', title: 'Empowerment' },
  { badge: '3 Schemes',  icon: '🏠', title: 'Housing & Shelter' },
  { badge: '6 Schemes',  icon: '💰', title: 'Financial Services' },
  { badge: '17 Schemes', icon: '📊', title: 'Socio-economic' },
  { badge: '5 Schemes',  icon: '🏥', title: 'Health & Wellness' },
  { badge: '5 Schemes',  icon: '🔬', title: 'Technology &\nScience' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Carousel ─────────────────────────────────────────── */}
      <div className="w-full">
        <Carousel />
      </div>

      {/* ── Floating Search UI ───────────────────────────────── */}
      <FloatingSearchUI />

      {/* ── Government Schemes Section ───────────────────────── */}
      <section className="pb-0 bg-white mt-[100px]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid gap-[60px] items-start" style={{ gridTemplateColumns: '350px 1fr' }}>
            {/* Video */}
            <div className="flex justify-center items-center">
              <div className="w-full h-[240px] rounded-xl overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.1)] bg-[#f8f9fa]">
                <iframe
                  src="https://www.youtube.com/embed/aunnzhuQgLY?autoplay=0&loop=1&playlist=aunnzhuQgLY&mute=1"
                  title="Youth Welfare Schemes"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Filters */}
            <div>
              <h2 className="text-[30px] font-bold text-[#1e3a8a] mt-0 mb-4 leading-tight tracking-tight">
                Government Department Schemes for youth
              </h2>
              <p className="text-lg text-[#6b7280] mt-0 mb-10 font-normal">
                Explore the government schemes/services
              </p>
              <div className="grid gap-5 items-end" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                {[
                  { label: 'Scheme Category', opts: ['Select Scheme Category', 'Education & Scholarship', 'Business & Entrepreneurship', 'Skill Development', 'Employment', 'Health & Wellness'] },
                  { label: 'By Government',   opts: ['Select Government', 'Central Government', 'State Government', 'Local Government'] },
                  { label: 'Department',      opts: ['Select Department', 'Youth Welfare', 'Education', 'Health', 'Employment'] },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-wide">
                      {f.label}
                    </label>
                    <select className="w-full px-5 py-4 border-2 border-[#e5e7eb] rounded-lg text-lg text-[#374151] bg-white cursor-pointer focus:outline-none focus:border-[#1e3a8a] appearance-none">
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <button className="bg-[#10b981] hover:bg-[#059669] text-white border-none px-7 h-14 rounded-lg text-lg font-semibold cursor-pointer flex items-center gap-2 transition-all hover:-translate-y-px min-w-[140px] justify-center">
                  <i className="fas fa-search" /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Infrastructure Section ───────────────────────────── */}
      <section className="gradient-section text-center py-20 px-5 max-w-[1400px] mx-auto my-[100px] rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
        <h2 className="text-[42px] font-bold text-white mb-5 tracking-tight leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          Infrastructure
        </h2>
        <p className="text-lg text-white font-medium mb-[50px] max-w-[600px] mx-auto leading-relaxed">
          Explore the government infrastructure initiatives on Yuva Sathi !
        </p>

        <div className="grid grid-cols-4 gap-9 justify-center max-w-[1200px] mx-auto">
          {infraCards.map(card => (
            <div
              key={card.title}
              className="infra-card relative bg-white/95 rounded-3xl px-4 py-7 shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-center transition-all duration-300 border border-white/80 backdrop-blur-sm overflow-hidden hover:-translate-y-3 hover:scale-[1.02]"
            >
              <span className="text-[56px] mb-6 block drop-shadow-md">{card.icon}</span>
              <h3 className="text-xl font-bold text-[#1e293b] mb-5 leading-snug">{card.title}</h3>
              <Link href={card.href}>
                <button className="moreinfo-btn">More Info</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── MMD / YMD Section ────────────────────────────────── */}
      <section className="text-center py-20 px-5 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[36px] font-bold text-[#1e3a8a] mb-5">
            Know about your Mahila Mangal Dal and Yuwa Mangal Dal
          </h2>
          <p className="text-lg text-[#64748b] mb-[50px] max-w-[800px] mx-auto">
            Empowering the youth and women of Uttarakhand through community initiatives.
          </p>

          <div className="grid grid-cols-2 gap-10 max-w-[900px] mx-auto">
            {[
              { icon: '👩‍👩‍👧', title: 'Mahila Mangal Dal', href: '/mahila-mangal-dal' },
              { icon: '🏃‍♂️',   title: 'Yuvak Mangal Dal',  href: '/yuvak-mangal-dal' },
            ].map(card => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 border border-[#e2e8f0] flex flex-col items-center hover:-translate-y-2.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
              >
                <span className="text-6xl mb-6">{card.icon}</span>
                <h3 className="text-2xl font-bold text-[#1e293b] mb-6">{card.title}</h3>
                <Link href={card.href}>
                  <button className="moreinfo-btn">More Info</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registration Section ─────────────────────────────── */}
      <section className="text-center py-16 px-5 w-full">
        <h2 className="text-[36px] font-bold text-[#0b173d] mb-2">Registration</h2>
        <p className="text-lg text-[#2c3e50] mb-10">Register for various youth programs and services</p>

        <div className="grid grid-cols-4 gap-8 justify-center max-w-[1200px] mx-auto">
          {registrationCards.map(card => (
            <div
              key={card.title}
              className="bg-white rounded-2xl px-5 py-8 shadow-[0_6px_25px_rgba(0,0,0,0.08)] text-center transition-all duration-300 border border-[#f0f0f0] flex flex-col items-center hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)]"
            >
              <span className="text-5xl mb-5 block">{card.icon}</span>
              <h3 className="text-xl font-bold text-[#2c3e50] mt-0 mb-4 leading-snug">{card.title}</h3>
              <p className="text-sm text-[#666] mb-6 leading-relaxed">{card.desc}</p>
              <Link href={card.href}>
                <button className="register-btn">Register Now</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Schemes / Services Section ───────────────────────── */}
      <section className="gradient-section text-center py-20 px-5 max-w-[1400px] mx-auto my-[100px] rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
        <h2 className="text-[42px] font-bold text-white mb-5 tracking-tight leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          Get government <span className="font-extrabold">Schemes/Services</span>
        </h2>
        <p className="text-lg text-white font-medium mb-[50px] max-w-[600px] mx-auto leading-relaxed">
          Explore the government schemes/services domain-wise on Yuva Sathi !
        </p>

        <div
          className="grid gap-6 justify-center max-w-[1200px] mx-auto"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
        >
          {schemeCards.map((card, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl px-5 pt-10 pb-6 shadow-[0_6px_25px_rgba(0,0,0,0.08)] text-center transition-all duration-300 border border-[#f0f0f0] hover:-translate-y-1.5 cursor-pointer"
            >
              <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 bg-[#C0CFE6] text-black text-xs font-semibold px-3 py-1.5 rounded-2xl whitespace-nowrap">
                {card.badge}
              </span>
              <span className="text-[40px] my-5 block">{card.icon}</span>
              <h3 className="text-base font-bold text-[#2c3e50] m-0 leading-snug whitespace-pre-line">
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────── */}
      <FaqSection />

      {/* ── Support Section ──────────────────────────────────── */}
      <section className="py-16 px-5 flex justify-center items-center">
        <div className="bg-white rounded-[30px] p-10 flex justify-between items-center max-w-[1100px] w-full shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
          <div className="max-w-[700px]">
            <h2 className="text-[30px] font-bold text-[#141f3d] mt-0 mb-5">
              We&apos;re always available for your support!
            </h2>
            <p className="text-2xl text-[#141f3d] mt-0 mb-8">
              Contact Us to get detailed information about schemes.
            </p>
            <button className="bg-[#C0CFE6] text-black border-none px-10 py-5 text-2xl font-bold rounded-lg cursor-pointer">
              Help Desk Number +91-9634312465
            </button>
          </div>
          <div>
            <Image
              src="/images/help.png"
              alt="Support Illustration"
              width={400}
              height={300}
              className="max-w-[400px] w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </section>
    </>
  );
}
