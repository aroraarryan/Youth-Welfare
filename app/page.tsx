import Link from 'next/link';
// Refreshed to resolve hydration mismatch
import Image from 'next/image';
import Carousel from '@/components/Carousel';
import FloatingSearchUI from '@/components/FloatingSearchUI';
import FaqSection from '@/components/FaqSection';
import SocialMediaSection from '@/components/SocialMediaSection';
import NewsNotificationsSection from '@/components/NewsNotificationsSection';
import { getInfraStats } from '@/lib/api/infrastructure';
import { 
  Building2, 
  LandPlot, 
  Home, 
  Lightbulb, 
  Dumbbell, 
  Trees, 
  Activity,
  Trophy,
  Handshake,
  Wrench,
  Flag,
  Users,
  PersonStanding,
  GraduationCap,
  Briefcase,
  Settings,
  UserCheck,
  ShieldCheck,
  Coins,
  BarChart3,
  Hospital,
  Microscope
} from 'lucide-react';

// ── Infrastructure cards ────────────────────────────────────
const infraCards = [
  { icon: Building2, title: 'Multipurpose Halls',          href: '/multipurpose-halls' },
  { icon: LandPlot,  title: 'Mini Stadiums',               href: '/mini-stadiums' },
  { icon: Home,      title: 'Youth Hostel',                 href: '/youth-hostels' },
  { icon: Lightbulb, title: 'Vocational Training Centers',  href: '/vocational-training-centers' },
  { icon: Dumbbell,  title: 'Indoor Gym',                 href: '/indoor-gym' },
  { icon: Trees,     title: 'Open Gym',                   href: '/open-gym' },
  { icon: Activity,  title: 'Khel Maidaan',               href: '/khel-maidaan' },
];

// ── Registration cards ──────────────────────────────────────
const registrationCards = [
  { icon: Trophy,    title: 'Sports (Khel Mahakumbh)',  desc: 'Register for sports programs and competitions',      href: '/khel-mahakumbh' },
  { icon: Handshake, title: 'Youth Volunteering',         desc: 'Join volunteer programs and community service',       href: '/youth-volunteering' },
  { icon: Wrench,    title: 'Vocational Training',         desc: 'Enroll in skill development and training programs',   href: '/vocational-training' },
  { icon: Flag,      title: 'Adventure Training Program',  desc: 'Join us for an exciting adventure training program.', href: '/adventure-training' },
];

// ── Schemes cards ───────────────────────────────────────────
const schemeCards = [
  { badge: '23 Schemes', icon: GraduationCap, title: 'Education &\nScholarship' },
  { badge: '14 Schemes', icon: Briefcase,     title: 'Business &\nEntrepreneurship' },
  { badge: '12 Schemes', icon: Settings,      title: 'Skill Development' },
  { badge: '3 Schemes',  icon: Activity,      title: 'Sport & Culture' },
  { badge: '22 Schemes', icon: UserCheck,     title: 'Employment' },
  { badge: '8 Schemes',  icon: ShieldCheck,   title: 'Empowerment' },
  { badge: '3 Schemes',  icon: Home,          title: 'Housing & Shelter' },
  { badge: '6 Schemes',  icon: Coins,         title: 'Financial Services' },
  { badge: '17 Schemes', icon: BarChart3,     title: 'Socio-economic' },
  { badge: '5 Schemes',  icon: Hospital,      title: 'Health & Wellness' },
  { badge: '5 Schemes',  icon: Microscope,    title: 'Technology &\nScience' },
];

export default async function HomePage() {
  const stats = await getInfraStats();

  return (
    <>
      {/* ── Carousel ─────────────────────────────────────────── */}
      <div className="w-full">
        <Carousel />
      </div>

      {/* ── Floating Search UI ───────────────────────────────── */}
      <FloatingSearchUI stats={stats} />

      {/* ── News & Notifications Section ─────────────────────── */}
      <NewsNotificationsSection />

      {/* ── Government Schemes Section ───────────────────────── */}
      <section className="pb-0 bg-white mt-[60px] sm:mt-[100px]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Video - Compact Size as per image */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.1)] bg-black">
                <iframe
                  src="https://www.youtube.com/embed/aunnzhuQgLY?autoplay=0&loop=1&playlist=aunnzhuQgLY&mute=1"
                  title="Youth Welfare Schemes"
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Content & Filters Beside Video */}
            <div className="flex-1 w-full">
              <h2 className="text-[24px] sm:text-[32px] font-bold text-[#1e3a8a] mt-0 mb-3 leading-tight tracking-tight">
                Government Department Schemes for youth
              </h2>
              <p className="text-lg text-gray-500 mt-0 mb-10 font-medium">
                Explore the government schemes/services
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr,1fr,1fr,auto] gap-4 items-end">
                {[
                  { label: 'Scheme Category', placeholder: 'Select Scheme Category' },
                  { label: 'By Government', placeholder: 'Select Government' },
                  { label: 'Department', placeholder: 'Select Department' },
                ].map(f => (
                  <div key={f.label} className="w-full">
                    <label className="block text-[10px] font-black text-[#1e293b] mb-3 uppercase tracking-widest">
                      {f.label}
                    </label>
                    <div className="relative group">
                      <select className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a] appearance-none shadow-sm transition-all group-hover:border-gray-300">
                        <option>{f.placeholder}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <i className="fas fa-chevron-down text-[10px]" />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="bg-[#10b981] hover:bg-[#059669] text-white border-none px-8 h-[48px] rounded-xl text-base font-bold cursor-pointer flex items-center gap-2 transition-all hover:shadow-[0_8px_20px_rgba(16,185,129,0.2)] active:scale-95">
                  <i className="fas fa-search" /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Infrastructure Section ───────────────────────────── */}
      <section className="gradient-section text-center py-10 lg:py-20 px-5 max-w-[1400px] mx-auto my-[40px] sm:my-[60px] lg:my-[100px] rounded-2xl sm:rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
        <h2 className="text-3xl lg:text-[42px] font-bold text-white mb-5 tracking-tight leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          Infrastructure
        </h2>
        <p className="text-lg text-white font-medium mb-[50px] max-w-[600px] mx-auto leading-relaxed">
          Explore the government infrastructure initiatives on Yuva Sathi !
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-9 justify-center max-w-[1200px] mx-auto">
          {infraCards.map(card => (
            <div
              key={card.title}
              className="infra-card relative bg-white/95 rounded-3xl px-4 py-7 shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-center transition-all duration-300 border border-white/80 backdrop-blur-sm overflow-hidden hover:-translate-y-3 hover:scale-[1.02] flex flex-col items-center"
            >
              <div className="premium-icon-container icon-glow-blue w-20 h-20 mb-6">
                <card.icon size={40} strokeWidth={1.5} />
              </div>
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
          <h2 className="text-2xl lg:text-[36px] font-bold text-[#1e3a8a] mb-5">
            Know about your Mahila Mangal Dal and Yuwa Mangal Dal
          </h2>
          <p className="text-lg text-[#64748b] mb-[50px] max-w-[800px] mx-auto">
            Empowering the youth and women of Uttarakhand through community initiatives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[900px] mx-auto">
            {[
              { icon: Users,          title: 'Mahila Mangal Dal', href: '/mahila-mangal-dal', glow: 'icon-glow-rose' },
              { icon: PersonStanding, title: 'Yuvak Mangal Dal',  href: '/yuvak-mangal-dal',  glow: 'icon-glow-blue' },
            ].map(card => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 border border-[#e2e8f0] flex flex-col items-center hover:-translate-y-2.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group"
              >
                <div className={`premium-icon-container ${card.glow} w-24 h-24 mb-8`}>
                  <card.icon size={48} strokeWidth={1.5} />
                </div>
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
      <section className="text-center py-12 sm:py-16 px-5 w-full">
        <h2 className="text-[28px] sm:text-[36px] font-bold text-[#0b173d] mb-2">Registration</h2>
        <p className="text-base sm:text-lg text-[#2c3e50] mb-10">Register for various youth programs and services</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 justify-center max-w-[1200px] mx-auto">
            {registrationCards.map(card => (
            <div
              key={card.title}
              className="bg-white rounded-2xl px-5 py-8 shadow-[0_6px_25px_rgba(0,0,0,0.08)] text-center transition-all duration-300 border border-[#f0f0f0] flex flex-col items-center hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)]"
            >
              <div className="premium-icon-container icon-glow-emerald w-16 h-16 mb-5">
                <card.icon size={32} strokeWidth={2} />
              </div>
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
      <section className="gradient-section text-center py-12 lg:py-20 px-5 max-w-[1400px] mx-auto my-[60px] lg:my-[100px] rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
        <h2 className="text-3xl lg:text-[42px] font-bold text-white mb-5 tracking-tight leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          Get government <span className="font-extrabold">Schemes/Services</span>
        </h2>
        <p className="text-lg text-white font-medium mb-[50px] max-w-[600px] mx-auto leading-relaxed">
          Explore the government schemes/services domain-wise on Yuva Sathi !
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 justify-center max-w-[1200px] mx-auto">
            {schemeCards.map((card, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl px-5 pt-10 pb-6 shadow-[0_6px_25px_rgba(0,0,0,0.08)] text-center transition-all duration-300 border border-[#f0f0f0] hover:-translate-y-1.5 cursor-pointer flex flex-col items-center"
            >
              <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 bg-[#C0CFE6] text-black text-xs font-semibold px-3 py-1.5 rounded-2xl whitespace-nowrap">
                {card.badge}
              </span>
              <div className="premium-icon-container icon-glow-blue w-14 h-14 my-5">
                <card.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-[#2c3e50] m-0 leading-snug whitespace-pre-line">
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Media Section ─────────────────────────────── */}
      <SocialMediaSection />

      {/* ── FAQ Section ─────────────────────────────────────── */}
      <FaqSection />

      {/* ── Support Section ──────────────────────────────────── */}
      <section className="py-12 lg:py-16 px-5 flex justify-center items-center">
        <div className="bg-white rounded-[30px] p-6 lg:p-10 flex flex-col lg:flex-row justify-between items-center max-w-[1100px] w-full shadow-[0_8px_30px_rgba(0,0,0,0.1)] gap-10">
          <div className="max-w-[700px] text-center lg:text-left">
            <h2 className="text-2xl lg:text-[30px] font-bold text-[#141f3d] mt-0 mb-5">
              We&apos;re always available for your support!
            </h2>
            <p className="text-lg lg:text-2xl text-[#141f3d] mt-0 mb-8">
              Contact Us to get detailed information about schemes.
            </p>
            <button className="bg-[#C0CFE6] text-black border-none px-6 lg:px-10 py-3 lg:py-5 text-lg lg:text-2xl font-bold rounded-lg cursor-pointer w-full lg:w-auto">
              Help Desk Number +91 93687 76459
            </button>
          </div>
          <div className="w-full lg:w-auto">
            <Image
              src="/images/help.png"
              alt="Support Illustration"
              width={400}
              height={300}
              className="max-w-[300px] lg:max-w-[400px] w-full h-auto rounded-xl mx-auto"
            />
          </div>
        </div>
      </section>
    </>
  );
}
