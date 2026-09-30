import Link from 'next/link';
import Image from 'next/image';
import { assets } from '@/public/assets/assets';

const sections = [
  {
    title: '1. About Prajapatt',
    paragraphs: [
      'Prajapatt provides conversational AI features, including access to different model providers and related tools. This Privacy Policy explains how we collect, use, share and protect personal information when you use our website and services.',
      'This policy applies to the Prajapatt service. A third-party model provider or service that you connect to may process information under its own privacy policy and terms.',
    ],
  },
  {
    title: '2. Personal information we collect',
    paragraphs: [
      'Account information may include your name, email address, authentication details and profile information received from a sign-in provider such as Google or Firebase. We collect only the information needed to create and operate your account.',
      'Service content may include prompts, chat messages, uploaded images, voice input, generated responses, feedback and files that you choose to submit. Please do not include passwords, payment card details or sensitive personal information in prompts unless a feature specifically requires it.',
      'Technical information may include IP address, browser and device type, operating system, approximate location derived from IP address, timestamps, error logs and information about how you use the service.',
      'If paid features are introduced, payment details will be handled by the relevant payment provider. We do not need to store your full payment card number to provide the service.',
    ],
  },
  {
    title: '3. How we use personal information',
    paragraphs: [
      'We use information to provide, maintain and secure Prajapatt; authenticate users; respond to prompts; save and display chats; provide voice and image features; troubleshoot errors; communicate service updates; prevent misuse; and comply with legal obligations.',
      'We may use aggregated, de-identified or pseudonymised information to understand usage, measure performance, improve features and conduct product or safety research. We do not use de-identified information to try to identify you again except where permitted or required by law.',
    ],
  },
  {
    title: '4. AI models and model improvement',
    paragraphs: [
      'To generate a response, your prompt and relevant context may be sent to the model provider selected for that request. The provider may process that information under its own terms and privacy policy.',
      'We may review or process chats and feedback for safety, abuse prevention, support, debugging and service improvement, subject to applicable law and your available settings. We do not promise that AI output is accurate or that every response is unique.',
    ],
  },
  {
    title: '5. How we share personal information',
    paragraphs: [
      'We may share information with hosting, database, authentication, analytics, security, customer-support and other technology providers that process it on our behalf. We may also share information with the model provider required to deliver a model or feature you select.',
      'We may disclose information when required by law, legal process or a valid governmental request; to protect users, the service or our rights; to investigate fraud or security incidents; or as part of a merger, acquisition, financing or transfer of assets.',
      'When you choose to connect or share information with a third-party service, that service receives information directly from you or through the requested integration and its own policy applies.',
    ],
  },
  {
    title: '6. Data retention and deletion',
    paragraphs: [
      'We retain account and chat information for as long as needed to provide the service, meet legal and accounting requirements, resolve disputes, enforce our terms, maintain security and support legitimate business operations.',
      'You may delete chats or request deletion of your account and associated personal information through available account controls or by contacting us. Deletion may take time to complete and some information may be retained where required for legal, safety, security or fraud-prevention reasons.',
    ],
  },
  {
    title: '7. Security',
    paragraphs: [
      'We use reasonable technical and organisational safeguards designed to protect personal information against loss, misuse and unauthorised access, alteration or disclosure. No internet transmission or storage system can be guaranteed to be completely secure.',
      'You are responsible for protecting your account credentials, using a secure device and notifying us if you believe your account has been compromised.',
    ],
  },
  {
    title: '8. Cookies and similar technologies',
    paragraphs: [
      'Prajapatt and its service providers may use cookies, local storage and similar technologies to keep you signed in, remember preferences, maintain security, understand performance and improve the service. You can control cookies through your browser settings, although some features may not work correctly if they are disabled.',
    ],
  },
  {
    title: '9. Children',
    paragraphs: [
      'Prajapatt is not directed to children below the minimum age required by applicable law. We do not knowingly collect personal information from children who are not permitted to use the service. If you believe a child has provided personal information, please contact us so that we can investigate and take appropriate action.',
    ],
  },
  {
    title: '10. Your privacy rights and choices',
    paragraphs: [
      'Depending on where you live, you may have rights to request access to, correction of, deletion of or a copy of your personal information. You may also have the right to object to or restrict certain processing, withdraw consent where processing is based on consent, or appeal a decision about a privacy request.',
      'To protect your information, we may need to verify your identity before completing a request. We will respond within the period required by applicable law. Some rights have legal exceptions, including where information must be retained for security, legal or fraud-prevention purposes.',
    ],
  },
  {
    title: '11. International processing and changes',
    paragraphs: [
      'Prajapatt and its providers may process information in countries other than the country where you live. Where required, we use appropriate safeguards for international transfers and comply with applicable data protection law.',
      'We may update this policy from time to time. When we make a material change, we will update the effective date and provide additional notice where required. Your continued use after an update means that the revised policy applies to your use of the service.',
    ],
  },
  {
    title: '12. Contact us',
    paragraphs: [
      'For privacy questions, requests or concerns, please contact the Prajapatt team through the contact details provided on our website. Please include enough information for us to understand and verify your request.',
    ],
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-[#666]">
              Last updated: 5 September 2026
            </p>
          </header>

          <div className="space-y-10 text-[15px] leading-7 text-[#333]">
            <p>
              We value your privacy and aim to be clear about how information is
              handled when you use Prajapatt. Please read this policy alongside
              our{' '}
              <Link
                href="/legal/terms"
                className="underline underline-offset-4 hover:text-black"
              >
                Terms of Use
              </Link>
              .
            </p>

            <nav
              aria-label="Privacy Policy contents"
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
