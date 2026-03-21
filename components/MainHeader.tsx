'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/',              label: 'Home' },
  { href: '/about',         label: 'About Us' },
  { href: '/gallery',       label: 'Gallery' },
  { href: '#',              label: 'RTI' },
  { href: '/downloads',     label: 'Downloads' },
  { href: '/contact',       label: 'Contact Us' },
];

export default function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex justify-between items-center py-5 px-10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-full box-border">
      {/* Left: Logos + title */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">
          <Image
            src="/images/gov-logo.png"
            alt="Ashoka Chakra"
            width={70}
            height={70}
            className="object-contain"
          />
          <Image
            src="/images/logo.png"
            alt="Youth Welfare Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] m-0 leading-tight">
            Department of Youth Welfare <br />and PRD
          </h1>
          <p className="text-sm text-[#666] m-0 font-medium">Uttarakhand Government</p>
        </div>
      </div>

      {/* Right: Nav + actions */}
      <div className="flex items-center gap-8">
        {/* Hamburger — mobile only */}
        <button
          id="menuToggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
          className="text-2xl bg-none border-none cursor-pointer lg:hidden"
        >
          &#9776;
        </button>

        {/* Nav */}
        <nav className={`${menuOpen ? 'flex' : 'hidden'} lg:flex`}>
          <ul className="list-none p-0 m-0 flex gap-10 justify-center flex-col lg:flex-row absolute lg:static top-full left-0 w-full lg:w-auto bg-white lg:bg-transparent shadow-lg lg:shadow-none px-5 lg:px-0 pb-4 lg:pb-0 z-50">
            {navLinks.map(({ href, label }) => (
              <li key={href} className="inline-block">
                <Link
                  href={href}
                  className="no-underline text-[#2c3e50] font-medium text-sm py-2 inline-block hover:text-[#0066cc] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/register"
            className="bg-[#1e3a8a] text-white no-underline font-medium text-sm py-2.5 px-5 rounded-md hover:bg-[#1e40af] transition-colors"
          >
            Join the Community
          </Link>
          <button className="bg-none border-none text-lg text-[#666] cursor-pointer p-2 rounded-full hover:bg-[#f0f0f0] hover:text-[#1e3a8a] transition-all">
            <i className="fas fa-search" />
          </button>
        </div>
      </div>
    </header>
  );
}
