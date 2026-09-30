'use client';

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed?: () => boolean;
              isSkippedMoment?: () => boolean;
              isDismissedMoment?: () => boolean;
              getNotDisplayedReason?: () => string;
              getSkippedReason?: () => string;
              getDismissedReason?: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function useGoogleOneTap(options?: {
  clientId?: string;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
  useFedCmForPrompt?: boolean;
  enabled?: boolean;
  onCredential?: (credential: string) => Promise<void> | void;
}) {
  const googleClientId =
    options?.clientId ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleOneTapInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!options?.enabled && options?.enabled !== undefined) {
      return;
    }

    if (!googleClientId || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const handleGoogleCredential = async (response: {
      credential?: string;
    }) => {
      if (cancelled || !response?.credential) {
        return;
      }

      try {
        if (options?.onCredential) {
          await options.onCredential(response.credential);
        }
      } catch (error) {
        console.error('Google One Tap sign-in error:', error);
        toast.error(
          error instanceof Error ? error.message : 'Google sign-in failed',
        );
      }
    };

    const initializeGoogleOneTap = () => {
      if (cancelled) {
        return;
      }

      const google = window.google;

      if (!google?.accounts?.id) {
        return;
      }

      if (googleOneTapInitialized.current) {
        return;
      }

      googleOneTapInitialized.current = true;
      setIsReady(true);

      google.accounts.id.initialize({
        client_id: googleClientId,
        auto_select: options?.autoSelect ?? false,
        cancel_on_tap_outside: options?.cancelOnTapOutside ?? true,
        use_fedcm_for_prompt: options?.useFedCmForPrompt ?? true,
        callback: handleGoogleCredential,
      });

      google.accounts.id.prompt((notification) => {
        if (notification?.isNotDisplayed?.()) {
          console.log(
            'Google One Tap not displayed:',
            notification.getNotDisplayedReason?.(),
          );
        }

        if (notification?.isSkippedMoment?.()) {
          console.log(
            'Google One Tap skipped:',
            notification.getSkippedReason?.(),
          );
        }

        if (notification?.isDismissedMoment?.()) {
          console.log(
            'Google One Tap dismissed:',
            notification.getDismissedReason?.(),
          );
        }
      });
    };

    const existingScript = document.getElementById(
      'google-identity-script',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogleOneTap();
      } else {
        existingScript.addEventListener('load', initializeGoogleOneTap, {
          once: true,
        });
      }

      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', initializeGoogleOneTap);
        try {
          window.google?.accounts?.id?.cancel();
        } catch {
          // Ignore cleanup errors
        }
        googleOneTapInitialized.current = false;
        setIsReady(false);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-identity-script';
    script.onload = initializeGoogleOneTap;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.onload = null;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // Ignore cleanup errors
      }
      googleOneTapInitialized.current = false;
      setIsReady(false);
    };
  }, [
    googleClientId,
    options?.autoSelect,
    options?.cancelOnTapOutside,
    options?.enabled,
    options?.onCredential,
    options?.useFedCmForPrompt,
  ]);

  return { isReady };
}

export function useAuth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setLoading(true);

      try {
        const googleCredential = GoogleAuthProvider.credential(credential);

        if (!googleCredential) {
          throw new Error('Google credential is missing');
        }

        await signInWithCredential(auth, googleCredential);
        toast.success('Signed in with Google!');
        router.push('/');
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        toast.error(error?.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useGoogleOneTap({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    enabled: true,
    onCredential: handleGoogleCredential,
  });

  const handleEmailAuth = useCallback(
    async (
      input?:
        | FormEvent<HTMLFormElement>
        | { email?: string; password?: string },
    ) => {
      const hasCredentialPayload =
        typeof input === 'object' && input !== null && 'email' in input;

      const nextEmail = hasCredentialPayload
        ? (input.email ?? email).trim()
        : email.trim();
      const nextPassword = hasCredentialPayload
        ? (input.password ?? password)
        : password;

      if (
        typeof input === 'object' &&
        input !== null &&
        'preventDefault' in input
      ) {
        input.preventDefault();
      }

      if (!nextEmail || !nextPassword) {
        toast.error('Please enter email and password.');
        return;
      }

      setEmail(nextEmail);
      setPassword(nextPassword);
      setLoading(true);

      try {
        try {
          await signInWithEmailAndPassword(auth, nextEmail, nextPassword);
          toast.success('Logged in successfully!');
          router.push('/');
        } catch (err: any) {
          if (
            err?.code === 'auth/user-not-found' ||
            /user not found/i.test(err?.message || '')
          ) {
            const result = await createUserWithEmailAndPassword(
              auth,
              nextEmail,
              nextPassword,
            );

            const derivedName = nextEmail.split('@')[0] || '';

            if (derivedName) {
              await updateProfile(result.user, {
                displayName: derivedName,
              });
            }

            toast.success('Account created and signed in!');
            router.push('/');
          } else {
            throw err;
          }
        }
      } catch (error: any) {
        const errorMessage = error?.message || 'Authentication failed';
        toast.error(errorMessage);
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  const handleOAuthSignIn = useCallback(
    async (provider: any, providerName: string) => {
      if (loading) {
        return;
      }

      setLoading(true);

      try {
        await signInWithPopup(auth, provider);
        toast.success(`Signed in with ${providerName}!`);
        router.push('/');
      } catch (error: any) {
        console.error(`${providerName} OAuth error:`, error);
        const errorMessage =
          error?.message || `Failed to sign in with ${providerName}`;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loading, router],
  );

  const googleProvider = useMemo(() => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    return provider;
  }, []);

  const prajapattProvider = useMemo(
    () => new OAuthProvider('prajapatt.com'),
    [],
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    showEmailForm,
    setShowEmailForm,
    handleEmailAuth,
    handleOAuthSignIn,
    googleProvider,
    prajapattProvider,
  };
}
