import Link from 'next/link';
import Image from 'next/image';
import { assets } from '@/public/assets/assets';

const sections = [
  {
    title: '1. Acceptance of these terms',
    paragraphs: [
      'These Terms of Use govern your access to and use of Prajapatt, including its website, applications, features and AI-powered services. By accessing or using Prajapatt, you agree to be bound by these terms. If you do not agree, please do not use the service.',
    ],
  },
  {
    title: '2. Eligibility and accounts',
    paragraphs: [
      'You must be legally able to enter into these terms to use Prajapatt. You are responsible for keeping your account details and sign-in credentials secure and for all activity that takes place through your account.',
      'Please provide accurate information and notify us promptly if you believe your account has been accessed without permission.',
    ],
  },
  {
    title: '3. Acceptable use',
    paragraphs: [
      'You may use Prajapatt for lawful personal or business purposes in accordance with these terms. You must not misuse the service, interfere with its operation, attempt to access it without authorisation, or use it to violate any applicable law or the rights of others.',
      'You must not use Prajapatt to generate, upload or share content that is unlawful, abusive, threatening, discriminatory, deceptive, invasive of privacy, or that infringes intellectual property or other rights.',
    ],
  },
  {
    title: '4. User content',
    paragraphs: [
      'You retain ownership of content that you submit to Prajapatt. You grant us the limited rights needed to host, process, transmit and display that content so that we can provide and improve the service.',
      'You are responsible for ensuring that you have the necessary rights to submit your content and that it does not breach these terms or applicable law.',
    ],
  },
  {
    title: '5. AI-generated responses and model providers',
    paragraphs: [
      'Prajapatt uses third-party and proprietary AI models to generate responses. Responses may be incomplete, inaccurate, outdated or unsuitable for your circumstances and should not be treated as professional advice.',
      'You are responsible for reviewing responses and checking important information before relying on it or acting on it. Do not use Prajapatt as a substitute for qualified legal, medical, financial or other professional advice.',
    ],
  },
  {
    title: '6. Third-party services and models',
    paragraphs: [
      'Prajapatt may connect to or use third-party services, models and content. Those services may have their own terms and privacy policies, and we are not responsible for their independent availability, content or practices.',
    ],
  },
  {
    title: '7. Privacy and data security',
    paragraphs: [
      'Our Privacy Policy explains how we collect, use and protect personal information. By using Prajapatt, you acknowledge that information may be processed by Prajapatt and the model providers needed to deliver the features you choose.',
      'No online service can guarantee absolute security. You should avoid submitting passwords, payment details, confidential business information or other sensitive material unless the relevant feature is designed to receive it.',
    ],
  },
  {
    title: '8. Intellectual property',
    paragraphs: [
      'Prajapatt and its software, design, branding and underlying technology are owned by or licensed to us and are protected by applicable intellectual property laws. These terms do not transfer ownership of those rights to you.',
    ],
  },
  {
    title: '9. Paid features',
    paragraphs: [
      'If paid plans or features are introduced, pricing, billing intervals, renewal, cancellation and refund terms will be shown before purchase. You authorise the selected payment provider to charge valid fees and applicable taxes.',
      'We may change prices with reasonable notice. Unless applicable law requires otherwise, payments already made are non-refundable.',
    ],
  },
  {
    title: '10. Availability and changes',
    paragraphs: [
      'We may modify, suspend or discontinue part or all of the service, including individual models or features, at any time. We may also update these terms from time to time. Continued use of Prajapatt after an update means that you accept the revised terms.',
    ],
  },
  {
    title: '11. Suspension and termination',
    paragraphs: [
      'We may suspend or terminate access where we reasonably believe that you have breached these terms, created risk for the service or other users, or used Prajapatt unlawfully. You may stop using the service at any time.',
    ],
  },
  {
    title: '12. Disclaimer of warranties',
    paragraphs: [
      'To the extent permitted by law, Prajapatt is provided on an "as available" and "as is" basis without warranties that it will always be accurate, uninterrupted, secure or error-free.',
      'You use the service at your own risk. AI output may contain errors, omissions or content that is unsuitable for your situation. Nothing in these terms excludes a warranty or liability that cannot lawfully be excluded.',
    ],
  },
  {
    title: '13. Indemnity and limitation of liability',
    paragraphs: [
      'To the extent permitted by law, you agree to protect Prajapatt and its service providers from claims, losses and reasonable costs arising from your unlawful use of the service, your content, or your breach of these terms.',
      'To the extent permitted by law, Prajapatt will not be liable for indirect, incidental, special or consequential loss arising from your use of the service. Nothing in these terms limits liability that cannot lawfully be limited or excluded.',
    ],
  },
  {
    title: '14. Content removal and safety',
    paragraphs: [
      'We may remove content, restrict a feature or take other appropriate action where content appears to breach these terms, applicable law, intellectual property rights or the safety of users and the service.',
    ],
  },
  {
    title: '15. Disputes and general provisions',
    paragraphs: [
      'We encourage you to contact us first so that we can try to resolve a concern. These terms are governed by the laws that apply where Prajapatt operates, subject to any mandatory rights you have in your place of residence.',
      'If any provision is found unenforceable, the remaining provisions will continue to apply. Our failure to enforce a provision is not a waiver of our right to enforce it later. You may not transfer your rights under these terms without our written consent.',
    ],
  },
  {
    title: '16. Contact',
    paragraphs: [
      'If you have questions about these Terms of Use, please contact the Prajapatt team through the contact details provided on our website.',
    ],
  },
];

export default function TermsPage() {
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
              Terms of Use
            </h1>
            <p className="mt-4 text-sm text-[#666]">
              Last updated: 5 September 2026
            </p>
          </header>

          <div className="space-y-10 text-[15px] leading-7 text-[#333]">
            <p>
              These terms explain the rules for using Prajapatt and its
              AI-powered features. Please read them carefully before using the
              service.
            </p>
            <nav
              aria-label="Terms contents"
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
