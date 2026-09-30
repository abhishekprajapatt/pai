'use client';

import Image from 'next/image';
import Link from 'next/link';

import { assets } from '@/public/assets/assets';

export default function Navbar() {
  return (
    <header className="border-b border-white/10 bg-[#09090b]">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Image
            src={assets.logo_icon as string}
            alt="Prajapatt Logo"
            width={40}
            height={40}
            className="h-8 w-8 rounded-full"
          />
          <span className="text-xl font-semibold tracking-tight text-white sm:text-4xl">
            Prajapatt
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {[
            { label: 'Prajapatt Company', href: '/company' },
            { label: 'Product', href: '#' },
            { label: 'Developers', href: '#' },
            { label: 'Enterprise', href: '#' },
            { label: 'Pricing', href: '#' },
            { label: 'About Us', href: '/about' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white hover:bg-white/5"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
