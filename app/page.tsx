'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, MouseEvent, useCallback } from 'react';

import { assets } from '@/public/assets/assets';
import { useFirebaseAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';

// Lazy load heavy components for faster initial page load
const Sidebar = dynamic(() => import('@/components/layout/Sidebar'), {
  loading: () => <div className="hidden md:block" />,
  ssr: false,
});

const PromptBox = dynamic(() => import('@/components/shared/PromptBox'), {
  loading: () => <div className="h-16 bg-black" />,
  ssr: false,
});

import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/shared/Navbar';

const Home: React.FC = () => {
  const {
    user: firebaseUser,
    loading: authLoading,
    isAuthenticated,
  } = useFirebaseAuth();

  const [expand, setExpand] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>('');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  const { setSelectedChat } = useAppContext() as any;

  useEffect(() => {
    setInitialLoadDone(true);
  }, []);

  const getGreeting = useCallback((): string => {
    const now = new Date();
    const hours = now.getHours();

    // Morning greetings (5-12)
    const morningGreetings = [
      'Good morning',
      'Ready to build?',
      "Let's make it happen",
      'A fresh start',
      'What will you create?',
      'Good to see you',
      "Let's get started",
      'Ideas are welcome',
      'Your next idea awaits',
      'Start something great',
    ];

    // Afternoon greetings (12-17)
    const afternoonGreetings = [
      'Good afternoon',
      'How is it going?',
      "Let's keep moving",
      'Ready for the next step?',
      'Make progress today',
      "Let's build together",
      "What's the idea?",
      'Keep going',
      "Let's solve it",
      'Your ideas matter',
    ];

    // Evening greetings (17-21)
    const eveningGreetings = [
      'Good evening',
      'How can I help?',
      'Ready when you are',
      "Let's work on it",
      'A good time to create',
      "What's on your mind?",
      "Let's make progress",
      'Take your next step',
      "Let's figure it out",
      'Good to have you here',
    ];

    // Night greetings (21-5)
    const nightGreetings = [
      'Good evening',
      'Still working?',
      "Let's keep it simple",
      'A quiet time to think',
      'What can I help with?',
      "Let's finish strong",
      'Ideas do not sleep',
      'Take your time',
      "I'm here to help",
      'Ready when you are',
    ];

    let greetings = [];
    if (hours >= 5 && hours < 12) {
      greetings = morningGreetings;
    } else if (hours >= 12 && hours < 17) {
      greetings = afternoonGreetings;
    } else if (hours >= 17 && hours < 21) {
      greetings = eveningGreetings;
    } else {
      greetings = nightGreetings;
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }, []);

  const getWelcomeMessage = useCallback((): string => {
    const userWelcomes = [
      'Welcome back, {name}',
      'Good to see you, {name}',
      'Ready when you are, {name}',
      'What are we building, {name}?',
      "Let's get started, {name}",
      'How can I help, {name}?',
      'Your next idea, {name}',
      "Let's make progress, {name}",
      "What's on your mind, {name}?",
      'Good to have you here, {name}',
    ];

    const guestWelcomes = [
      'How can I help?',
      'What are you thinking about?',
      'Ready to get started?',
      'Tell me your idea',
      'What can we build?',
      "Let's work on it",
      'Where should we begin?',
      "I'm here to help",
      'What would you like to do?',
      "Let's create something",
    ];

    const messageArray = firebaseUser ? userWelcomes : guestWelcomes;
    const randomIndex = Math.floor(Math.random() * messageArray.length);
    let message = messageArray[randomIndex];

    if (firebaseUser && firebaseUser.displayName) {
      message = message.replace('{name}', firebaseUser.displayName);
    } else {
      message = message.replace('{name}', 'Developer');
    }

    return message;
  }, [firebaseUser]);

  useEffect(() => {
    setGreeting(getGreeting());
    setWelcomeMessage(getWelcomeMessage());
  }, [getGreeting, getWelcomeMessage]);

  useEffect(() => {
    setSelectedChat(null);
  }, [setSelectedChat]);

  const handleToggleExpand = (e: MouseEvent<HTMLImageElement>): void => {
    e.stopPropagation();
    setExpand((prev) => !prev);
  };

  if (!initialLoadDone) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">
      {!isAuthenticated && <Navbar />}

      <div className="flex flex-1">
        {isAuthenticated ? (
          <Sidebar expand={expand} setExpand={setExpand} />
        ) : null}

        <div className="relative flex flex-1 flex-col items-center justify-center bg-[#09090b] px-2 pb-12 pt-12 text-white sm:px-6 sm:pb-8">
          {isAuthenticated && (
            <div className="absolute left-0 right-0 top-6 flex items-center justify-between px-4 md:hidden">
              <Image
                onClick={handleToggleExpand}
                className="rotate-180 cursor-pointer"
                src={assets.menu_icon as string}
                alt="Menu"
                width={24}
                height={24}
              />
              <Image
                className="opacity-70"
                src={assets.chat_icon as string}
                alt="Chat"
                width={24}
                height={24}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Image
              src={assets.logo_icon as string}
              alt="Prajapatt Logo"
              width={40}
              height={40}
              className="rounded-full select-none sm:h-14 sm:w-14"
            />
            <p className="text-base font-head font-black text-shadow-white select-none sm:text-lg md:text-2xl lg:text-3xl">
              {greeting}
            </p>
          </div>

          <p className="my-2 text-center text-xs font-head text-white/80 md:my-4 md:text-sm">
            {welcomeMessage}
          </p>

          <PromptBox />

          <p className="mt-2 mb-1 max-w-xl px-4 text-center text-[10px] leading-relaxed font-head text-gray-500">
            By using Prajapatt, you agree to our{' '}
            <a href="/legal/terms" className="underline hover:text-gray-300">
              Terms
            </a>{' '}
            &amp;{' '}
            <a href="/legal/privacy" className="underline hover:text-gray-300">
              Privacy Policy
            </a>
            {!isAuthenticated && (
              <>
                {' '}
                <span aria-hidden="true">&middot;</span>{' '}
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new Event('prajapatt:open-privacy-choices'),
                    )
                  }
                  className="underline hover:text-gray-300"
                >
                  Your privacy choices
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
