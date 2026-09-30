'use client';

import Image from 'next/image';
import Link from 'next/link';

import { assets } from '@/public/assets/assets';
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [value, setValue] = useState('');
  const [text, setText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // User ne kuch type kiya hai → animation stop
    if (value) return;

    const currentText = texts[textIndex];

    let delay = isDeleting ? 45 : 90;
    
    if (!isDeleting && text === currentText) {
      delay = 1800;
    }
    
    if (isDeleting && text === '') {
      delay = 500;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setText(currentText.substring(0, text.length + 1));

        if (text.length === currentText.length) {
          setIsDeleting(true);
        }
      } else {
        setText(currentText.substring(0, text.length - 1));

        if (text.length === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, textIndex, isDeleting, value]);
  
  return (
    <footer className="border-t border-white/10 bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="space-y-2">
            <div className="mb-4 flex items-center">
              <div className="flex items-center justify-center">
                <Image
                  src={assets.logo_icon as string}
                  alt="Prajapatt logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="text-xl font-semibold text-white">
                  Prajapatt
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                  Company
                </div>
              </div>
            </div>
            <div className="flex items-center justify-start gap-2 px-2">
              {' '}
              {socialLinks.map(({ icon: Icon, href }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white/80"
                >
                  {' '}
                  <Icon size={20} />{' '}
                </Link>
              ))}{' '}
            </div>
            <div className="flex items-center justify-start gap-2">
              <div className="relative w-[220px]">
                <IoIosMail
                  size={18}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/50"
                />

                <input
                  type="email"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-lg border border-transparent bg-[#121212] py-1.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-[#27272a]"
                />

                {!value && (
                  <div className="pointer-events-none absolute inset-y-0 left-9 flex items-center text-sm text-white/40">
                    {text}
                    <span className="ml-[1px] animate-pulse">|</span>
                  </div>
                )}
              </div>

              <button className="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-white/5">
                Subscribe
              </button>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/65">
              Building a connected AI ecosystem for productivity, collaboration,
              operations, and business growth.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
              Product
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              {links.product.map((item) => (
                <li key={item}>
                  <Link href="/company" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              {links.company.map((item) => (
                <li key={item}>
                  <Link href="/company" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
              Developers
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              {links.developers.map((item) => (
                <li key={item}>
                  <Link href="/company" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-3 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Prajapatt</span>
            <div className="flex gap-5">
              <Link href="/legal/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:text-white">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const links = {
  product: [
    'Prajapatt Mail',
    'Prajapatt Cloud',
    'Prajapatt Chat',
    'Prajapatt Meet',
    'Prajapatt POS',
  ],
  company: ['Prajapatt Company', "About AI", 'Careers', 'Privacy', 'Terms'],
  developers: [
    'API Docs',
    'SDKs',
    'Developer Tools',
    'Integrations',
    'Automation',
  ],
};


const socialLinks = [
  { icon: FaInstagram, href: 'https://instagram.com/prajapatt.hq' },
  { icon: FaLinkedin, href: 'https://linkedin.com/in/prajapatt' },
  { icon: FaGithub, href: 'https://github.com/prajapatt' },
  { icon: FaTwitter, href: 'https://twitter.com/prajapatthq' },
];
const texts = [
  'Enter your email address',
  'Subscribe to our newsletter',
  'Get updates in your inbox',
];