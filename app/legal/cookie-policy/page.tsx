import Link from 'next/link';
import Image from 'next/image';
import { assets } from '@/public/assets/assets';

const sections = [
  {
    title: '1. How Prajapatt uses cookies',
    paragraphs: [
      'Prajapatt uses cookies, local storage and similar technologies to keep the service secure, remember preferences, maintain sign-in sessions, understand how the service is used and improve your experience.',
      'Some technologies are placed by service providers that help us with authentication, hosting, analytics, security and other service operations.',
    ],
  },
  {
    title: '2. Cookie categories',
    paragraphs: [
      'Necessary cookies support essential functions such as security, authentication and basic service operation. These cookies cannot be switched off through our preference controls.',
      'Analytics cookies help us understand general usage, performance and errors so that we can improve Prajapatt. They are used only when you allow analytics preferences.',
      'Marketing cookies may be used to measure promotional activity or personalise marketing. They are used only when you allow marketing preferences.',
    ],
  },
  {
    title: '3. Managing your choices',
    paragraphs: [
      'You can accept all cookies, reject optional cookies or customise analytics and marketing preferences through the cookie settings panel. You can reopen your choices at any time using the Your privacy choices link.',
      'Most browsers also allow you to remove cookies or change cookie settings. Disabling necessary cookies may affect sign-in and core features, while disabling optional cookies should not prevent basic use of the service.',
    ],
  },
  {
    title: '4. Do Not Track',
    paragraphs: [
      'Some browsers offer a Do Not Track setting. There is no consistent industry standard for interpreting that signal, so Prajapatt may not respond to it automatically. You can use the cookie preference controls to manage optional cookies.',
    ],
  },
  {
    title: '5. Changes to this policy',
    paragraphs: [
      'We may update this Cookie Policy when our technologies, services or legal obligations change. We will update the effective date when appropriate and encourage you to review this page periodically.',
    ],
  },
  {
    title: '6. Contact us',
    paragraphs: [
      'If you have questions about cookies or your preferences, please contact the Prajapatt team through the contact details provided on our website.',
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#171717]">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
        <aside className="lg:fixed lg:left-10 lg:top-8 lg:z-10">
          <Link href="/" className="flex items-center gap-2 text-[#171717]">
            <Image
              src={assets.pai_logo}
              alt="Prajapatt"
              width={60}
              height={60}
            />
            <span className="text-3xl font-serif font-black">
              Prajapatt
            </span>
          </Link>
        </aside>
        <div>
          <Link
            href="/"
            className="mb-12 inline-block text-sm text-[#555] underline underline-offset-4 hover:text-black"
          >
            Back to Prajapatt
          </Link>

          <header className="mb-12 border-b border-[#d7d4cc] pb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#777]">
              Prajapatt
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Cookie Policy
            </h1>
            <p className="mt-4 text-sm text-[#666]">
              Effective: 5 September 2026
            </p>
          </header>

          <div className="space-y-10 text-[15px] leading-7 text-[#333]">
            <p>
              This Cookie Policy explains how Prajapatt and its service
              providers use cookies and similar technologies. For information
              about broader data handling, please read our{' '}
              <Link
                href="/legal/privacy"
                className="underline underline-offset-4 hover:text-black"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <nav
              aria-label="Cookie Policy contents"
              className="border-y border-[#d7d4cc] py-6"
            >
              <h2 className="mb-3 text-lg font-semibold text-[#171717]">
                Contents
              </h2>
              <ol className="grid gap-1 text-sm sm:grid-cols-2">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#section-${index + 1}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {sections.map((section, index) => (
              <section
                key={section.title}
                id={`section-${index + 1}`}
                className="scroll-mt-6"
              >
                <h2 className="mb-3 text-lg font-semibold text-[#171717]">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-16 border-t border-[#d7d4cc] pt-6 text-sm text-[#777]">
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-black"
            >
              Return to Prajapatt
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
