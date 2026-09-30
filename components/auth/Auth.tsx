'use client';

import Image from 'next/image';
import { assets } from '@/public/assets/assets';
import { FaWindows } from 'react-icons/fa6';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm, type AuthFormValues } from '@/components/forms/AuthForm';
import { FcGoogle } from 'react-icons/fc';
import { IoIosMail } from 'react-icons/io';

export default function Auth() {
  const {
    loading,
    showEmailForm,
    setShowEmailForm,
    handleEmailAuth,
    handleOAuthSignIn,
    googleProvider,
    prajapattProvider,
  } = useAuth();

  const handleEmailSubmit = async ({ email, password }: AuthFormValues) => {
    await handleEmailAuth({ email, password });
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-black">
      {/* Home / Logo */}
      <Link
        href="/"
        aria-label="Prajapatt home"
        className="absolute left-5 top-5 z-20 flex items-center gap-2 sm:left-8 sm:top-7"
      >
        <Image
          src={assets.pai_logo}
          alt=""
          width={42}
          height={42}
          className="h-10 w-10 select-none sm:h-11 sm:w-11"
        />

        <span className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
          Prajapatt AI
        </span>
      </Link>

      <div className="mx-auto grid min-h-dvh max-w-[1500px] grid-cols-1 items-center gap-8 px-5 pb-10 pt-28 sm:px-10 md:gap-12 md:px-14 md:pt-24 lg:grid-cols-[minmax(0,0.95fr)_minmax(440px,1.05fr)] lg:gap-16 lg:px-20 lg:pb-12">
        {/* LEFT */}
        <section className="flex w-full flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <div className="mb-8 max-w-xl text-center lg:mb-9">
            <h1 className="font-serif text-[clamp(2.75rem,4vw,4.2rem)] leading-[0.98] tracking-tight text-[#f4f1eb] lg:whitespace-nowrap">
              Question what&apos;s next
            </h1>

            <p className="mt-5 font-serif text-lg text-[#d8d2c9] sm:text-xl">
              Your thinking partner for big ambitions
            </p>
          </div>

          {/* AUTH CARD */}
          <div className="w-full max-w-[500px] rounded-[28px] border border-white/[0.14] bg-white/[0.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:max-w-[530px]">
            {showEmailForm ? (
              <div className="space-y-4">
                <p className="text-center font-serif text-2xl text-[#f4f1eb]">
                  Log in with your email
                </p>
                <AuthForm
                  mode="signin"
                  loading={loading}
                  onSubmit={handleEmailSubmit}
                  onGoogleClick={() =>
                    handleOAuthSignIn(googleProvider, 'Google')
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full py-2 text-sm text-white/55 transition hover:text-white"
                >
                  Back to other options
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.09] py-3 text-base text-white transition hover:bg-white/[0.15]"
                >
                  {' '}
                  <IoIosMail size={20} />
                  Continue with Email
                </button>

                <div
                  className="flex items-center gap-4 py-2"
                  aria-hidden="true"
                >
                  <div className="h-px flex-1 bg-white/[0.16]" />
                  <span className="text-sm text-white/50">OR</span>
                  <div className="h-px flex-1 bg-white/[0.16]" />
                </div>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn(googleProvider, 'Google')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.09] py-3 text-base text-white transition hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FcGoogle size={20} />
                  {loading ? 'Loading...' : 'Continue with Google'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOAuthSignIn(prajapattProvider, 'Prajapatt')
                  }
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.09] py-3 text-base text-white transition hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Image
                    src={assets.logo_icon}
                    alt=""
                    width={22}
                    height={22}
                    aria-hidden="true"
                  />
                  Continue with Prajapatt
                </button>
              </div>
            )}
          </div>

          {/* DESKTOP APP */}
          <button
            type="button"
            className="mt-7 flex items-center justify-center gap-2 self-center rounded-xl bg-white/[0.12] px-6 py-3 text-base text-white transition hover:bg-white/[0.18]"
          >
            <FaWindows size={18} aria-hidden="true" />
            Download desktop app
          </button>
        </section>

        {/* RIGHT VIDEO */}
        <section className="hidden h-[min(82vh,760px)] min-h-[480px] w-full items-center justify-center lg:flex">
          <div className="h-full w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/[0.16] bg-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
            <video
              src="/video/auth_ads.mp4"
              poster="/video/auth_ads.webp"
              className="h-full w-full object-cover"
              playsInline
              autoPlay
              loop
              muted
            />
          </div>
        </section>
      </div>
    </div>
  );
}
