'use client';
import 'regenerator-runtime/runtime';
import toast from 'react-hot-toast';
import { assets } from '@/public/assets/assets';
import { useFirebaseAuth } from '@/context/AuthContext';
import { useAIModelsContext } from '@/context/AIModelsContext';
import { useChatsContext } from '@/context/ChatsContext';
import { useRouter } from 'next/navigation';
import axios, { type AxiosResponse } from 'axios';
import type { StaticImageData } from 'next/image';
import { convertTextToSpeechAPI } from '@/lib/voiceUtils';
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
  useRef,
  type ReactNode,
  type FormEvent,
  type MouseEvent,
} from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  getTempChats,
  saveTempChat,
  deleteTempChat,
  clearTempChats,
  getSelectedChatId,
  setSelectedChatId,
} from '@/lib/localStorageUtils';
import {
  type Chat,
  type ChatMessage as Message,
} from '@/store/slice/chatSlice';

const isBrowserChatId = (chatId: string): boolean =>
  chatId.startsWith('temp_') ||
  chatId.startsWith('local_') ||
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    chatId,
  );

export interface CustomAIModel {
  id: string;
  provider: 'anthropic' | 'deepseek' | 'openai' | 'gemini';
  name: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AppContextValue {
  user: any;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  fetchUserChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newName: string) => Promise<void>;
  generateChatTitle: (chatId: string, userQuery: string) => Promise<void>;
  renamingChatId: string | null;
  setRenamingChatId: React.Dispatch<React.SetStateAction<string | null>>;
  isWriting: boolean;
  setIsWriting: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  textUpdateTimeouts: NodeJS.Timeout[];
  setTextUpdateTimeouts: React.Dispatch<React.SetStateAction<NodeJS.Timeout[]>>;
  editAndResendMessage: (
    messageIndex: number,
    newContent: string,
  ) => Promise<void>;
  handleEditMessage: (messageId: string, newContent: string) => void;
  requestMicrophonePermission: () => Promise<boolean>;
  sendPrompt: (
    e?: FormEvent<HTMLFormElement> | MouseEvent | null,
    customPrompt?: string,
  ) => Promise<void>;
  speak: (text: string) => void;
  speakWithPriority: (text: string) => void;
  playNotificationSound: () => Promise<void>;
  toggleContinuousListening: () => Promise<void>;
  processTranscript: (currentTranscript: string) => void;
  isFixedResponse: (text: string) => boolean;
  stopTextGeneration: () => void;
  isSpeaking: boolean;
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>;
  isContinuousListening: boolean;
  setIsContinuousListening: React.Dispatch<React.SetStateAction<boolean>>;
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: React.Dispatch<
    React.SetStateAction<SpeechSynthesisVoice | null>
  >;
  voices: SpeechSynthesisVoice[];
  hasInteracted: boolean;
  setHasInteracted: React.Dispatch<React.SetStateAction<boolean>>;
  isClient: boolean;
  transcript: string;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  availableModels: Array<{
    id: string;
    name: string;
    image: StaticImageData | string;
  }>;
  customModels: CustomAIModel[];
  addCustomModel: (model: Omit<CustomAIModel, 'id'>) => Promise<void>;
  removeCustomModel: (modelId: string) => Promise<void>;
  detectedLang: string;
  setDetectedLang: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const { user: firebaseUser, getIdToken, isAuthenticated } = useFirebaseAuth();
  const router = useRouter();
  const {
    chats,
    selectedChat,
    renamingChatId,
    isWriting,
    setChats,
    setSelectedChat,
    setRenamingChatId,
    setIsWriting,
    isLoading,
    setIsLoading,
    textUpdateTimeouts,
    setTextUpdateTimeouts,
    fetchUserChats,
    createNewChat,
    deleteChat,
    renameChat,
    generateChatTitle,
    editAndResendMessage,
    handleEditMessage,
    sendPrompt,
    stopTextGeneration,
  } = useChatsContext();
  const {
    selectedModel,
    setSelectedModel,
    availableModels,
    customModels,
    addCustomModel,
    removeCustomModel,
  } = useAIModelsContext();
  const [textUpdateTimeoutsLocal, setTextUpdateTimeoutsLocal] = useState<
    NodeJS.Timeout[]
  >([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isContinuousListening, setIsContinuousListening] =
    useState<boolean>(false);
  const [alwaysListening, setAlwaysListening] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [detectedLang, setDetectedLang] = useState<string>('en-US');

  useEffect(() => {
    if (!isClient) return;

    chats.forEach((chat) => {
      if (isBrowserChatId(chat._id) && chat.messages?.length > 0) {
        saveTempChat(chat);
      }
    });
  }, [chats, isClient]);

  const addCustomModelFromApp = async (
    model: Omit<CustomAIModel, 'id'>,
  ): Promise<void> => {
    await addCustomModel(model);
  };

  const removeCustomModelFromApp = async (modelId: string): Promise<void> => {
    await removeCustomModel(modelId);
  };

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const soundDetectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const welcomeSpokenRef = useRef<boolean>(false);
  const fixedResponsesRef = useRef<{
    greetings: string[];
  }>({
    greetings: [
      `Hey ${firebaseUser?.displayName || 'there'}, I'm OMEGA, how can I help you today?`,
      `What's up ${
        firebaseUser?.displayName || 'there'
      }! I'm OMEGA. Let's create something amazing!`,
      `Hey ${firebaseUser?.displayName || 'there'}, OMEGA here! What's on your mind?`,
      `${
        firebaseUser?.displayName || 'there'
      }! I'm OMEGA. Ready to build something incredible?`,
      `Welcome ${
        firebaseUser?.displayName || 'there'
      }! I'm OMEGA, your AI assistant. What can I do for you?`,
      `Hey there ${
        firebaseUser?.displayName || 'friend'
      }! It's OMEGA. Let's turn your ideas into reality!`,
      `${
        firebaseUser?.displayName || 'Developer'
      }, meet OMEGA! How can I assist you today?`,
      `What's happening ${
        firebaseUser?.displayName || 'there'
      }? I'm OMEGA. Let's collaborate!`,
    ],
  });

  useEffect(() => {
    if (transcript) {
      processTranscript(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!isContinuousListening) {
      return;
    }

    try {
      SpeechRecognition.startListening({ continuous: true });
    } catch (e) {
      console.error('Error starting continuous listening:', e);
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [isContinuousListening]);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      speechSynthRef.current = window.speechSynthesis;

      const browserLang = navigator.language || 'en-US';
      setDetectedLang(browserLang);
    }

    const handleBeforeUnload = () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }

      textUpdateTimeouts.forEach((timeout) => clearTimeout(timeout));

      if (microphoneStreamRef.current) {
        microphoneStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (soundDetectionTimerRef.current) {
        clearInterval(soundDetectionTimerRef.current);
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [textUpdateTimeouts]);

  useEffect(() => {
    if (!isClient || !alwaysListening || isContinuousListening) return;

    const restartListeningTimer = setInterval(() => {
      if (alwaysListening && !isContinuousListening) {
        const isCurrentlySpeaking =
          isSpeakingRef.current ||
          isLoadingRef.current ||
          (speechSynthRef.current && speechSynthRef.current.speaking);

        if (!isCurrentlySpeaking) {
          try {
            SpeechRecognition.startListening({ continuous: true });
          } catch (e) {
            console.error('Error restarting background listening:', e);
          }
        }
      }
    }, 5000);

    return () => clearInterval(restartListeningTimer);
  }, [alwaysListening, isContinuousListening, isClient]);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    const loadVoices = () => {
      if (!speechSynthRef.current) return;

      const allVoices = speechSynthRef.current.getVoices();
      if (allVoices.length === 0) {
        setTimeout(loadVoices, 150);
        return;
      }

      console.log('Voices loaded:', allVoices.length);
      setVoices(allVoices);

      const femaleVoices = allVoices.filter((v) => {
        const voiceName = v.name.toLowerCase();
        return (
          voiceName.includes('female') ||
          voiceName.includes('woman') ||
          voiceName.includes('girl')
        );
      });

      const selectedCuteVoice =
        femaleVoices.find((v) => v.name.toLowerCase().includes('joanna')) ||
        femaleVoices.find((v) => v.localService && v.lang.startsWith('en')) ||
        femaleVoices.find((v) => v.lang.startsWith('en')) ||
        allVoices.find((v) => v.lang.startsWith('en') && v.localService) ||
        allVoices.find((v) => v.lang.startsWith('en')) ||
        allVoices[0];

      console.log('Selected cute female voice:', selectedCuteVoice?.name);
      setSelectedVoice(selectedCuteVoice || allVoices[0]);
    };

    loadVoices();

    if (speechSynthRef.current) {
      speechSynthRef.current.onvoiceschanged = loadVoices;
    }
  }, [isClient]);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      return true;
    } catch (error: unknown) {
      console.error('Microphone access denied:', error);
      toast.error(
        'Please allow microphone access in your browser settings to use voice features',
      );
      return false;
    }
  };

  const playNotificationSound = async (): Promise<void> => {
    if (!isClient) return Promise.resolve();

    try {
      const audio = new Audio('/sounds/ms_notification.mp3');
      await audio.play();
      return new Promise((resolve) => {
        audio.onended = () => resolve();
      });
    } catch (error: unknown) {
      console.error('Audio playback failed:', error);
      return Promise.resolve();
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    if (!text) return '';

    const cleanedText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/[#*_`~\[\](){}]/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedText.length < 5) {
      return 'Response received.';
    }

    return cleanedText;
  };

  const detectLanguage = (text: string): string => {
    const hindiWords =
      /\b(है|हैं|का|की|के|में|से|को|पर|और|या|यह|वह|जो|कि|तो|न|नहीं|क्या|कैसे|कहाँ|कब|क्यों)\b/;
    const hindiPattern = /[\u0900-\u097F]/;

    const arabicWords =
      /\b(في|من|إلى|على|هذا|هذه|التي|الذي|لا|نعم|كيف|أين|متى|لماذا)\b/;
    const arabicPattern = /[\u0600-\u06FF]/;

    const chinesePattern = /[\u4e00-\u9fff]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7af]/;

    if (hindiPattern.test(text) || hindiWords.test(text)) {
      return 'hi-IN';
    }

    if (arabicPattern.test(text) || arabicWords.test(text)) {
      return 'ar-SA';
    }

    if (chinesePattern.test(text)) return 'zh-CN';
    if (japanesePattern.test(text)) return 'ja-JP';
    if (koreanPattern.test(text)) return 'ko-KR';

    return 'en-US';
  };

  const getBestVoiceForLanguage = (
    targetLang: string,
    availableVoices: SpeechSynthesisVoice[],
  ): SpeechSynthesisVoice | null => {
    if (!availableVoices || availableVoices.length === 0) return null;

    const langCode = targetLang.split('-')[0];
    let voice = availableVoices.find((v) => v.lang === targetLang);

    if (voice) return voice;

    voice = availableVoices.find((v) => v.lang.startsWith(langCode));

    if (voice) return voice;

    if (langCode === 'hi') {
      voice = availableVoices.find((v) => v.lang === 'en-IN');
      if (voice) return voice;
    }

    voice = availableVoices.find(
      (v) => v.lang.startsWith(langCode) && v.localService,
    );
    if (voice) return voice;
    return (
      availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0]
    );
  };

  const speakWithPriority = (text: string, forceBrowserVoice = false): void => {
    if (!isClient || !speechSynthRef.current) {
      console.error('Speech synthesis not available or not client');
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Speech synthesis API not available');
      return;
    }

    const cleanedText = cleanTextForSpeech(text);
    console.log('🔊 TTS: Original text length:', text.length);
    console.log('🔊 TTS: Cleaned text length:', cleanedText.length);
    console.log('🔊 TTS: Cleaned text:', cleanedText.substring(0, 100));

    if (!cleanedText || cleanedText.length < 5) {
      console.warn('🔊 TTS: Text too short, skipping');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    if (/^[\s\n\r]*$/.test(cleanedText)) {
      console.warn('🔊 TTS: Text is only whitespace, skipping');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    const codeKeywords = [
      'function',
      'const ',
      'let ',
      'var ',
      'import ',
      'export ',
      'class ',
      'interface ',
      'type ',
    ];
    const hasCode = codeKeywords.some((keyword) =>
      cleanedText.includes(keyword),
    );
    if (hasCode && cleanedText.split(' ').length < 10) {
      console.warn('🔊 TTS: Text appears to be code, skipping');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    if (
      !forceBrowserVoice &&
      isAuthenticated &&
      (process.env.NEXT_PUBLIC_TTS_PROVIDER === 'voicebox' ||
        process.env.NEXT_PUBLIC_TTS_PROVIDER === 'openai')
    ) {
      void (async () => {
        try {
          const token = await getIdToken();
          const provider =
            process.env.NEXT_PUBLIC_TTS_PROVIDER === 'voicebox'
              ? 'voicebox'
              : 'openai';
          const result = await convertTextToSpeechAPI(
            cleanedText,
            detectedLang || 'en-US',
            process.env.NEXT_PUBLIC_VOICEBOX_PROFILE_ID || undefined,
            provider,
            token,
          );
          if (!result.audio) throw new Error(result.error || 'TTS failed');

          const audioUrl = URL.createObjectURL(result.audio);
          const audio = new Audio(audioUrl);
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          audio.onended = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            URL.revokeObjectURL(audioUrl);
            speakWithPriority(cleanedText, true);
          };
          await audio.play();
        } catch (error) {
          console.warn(
            'Voicebox/OpenAI TTS unavailable, using browser voice:',
            error,
          );
          speakWithPriority(cleanedText, true);
        }
      })();
      return;
    }

    try {
      if (speechSynthRef.current && speechSynthRef.current.speaking) {
        speechSynthRef.current.cancel();
        console.log('🔊 TTS: Cancelled previous speech');
      }

      const speechLang = detectLanguage(cleanedText) || detectedLang || 'en-US';
      const maxChunkLength = 200;
      const textChunks: string[] = [];

      for (let i = 0; i < cleanedText.length; i += maxChunkLength) {
        textChunks.push(cleanedText.substring(i, i + maxChunkLength));
      }

      console.log('🔊 TTS: Split into', textChunks.length, 'chunks');
      console.log('🔊 TTS: Detected language:', speechLang);
      console.log('🔊 TTS: Starting speech synthesis');

      setIsSpeaking(true);
      isSpeakingRef.current = true;

      const speakNextChunk = (index: number): void => {
        if (index >= textChunks.length) {
          console.log('🔊 TTS: All chunks spoken, completed');
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          return;
        }

        try {
          const chunk = textChunks[index];
          console.log(
            `🔊 TTS: Speaking chunk ${index + 1}/${textChunks.length}: "${chunk.substring(0, 50)}..."`,
          );

          const utterance = new SpeechSynthesisUtterance(chunk);

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          } else {
            const availableVoices = speechSynthRef.current?.getVoices() || [];
            const bestVoice = getBestVoiceForLanguage(
              speechLang,
              availableVoices,
            );
            if (bestVoice) {
              utterance.voice = bestVoice;
              console.log('🔊 TTS: Selected voice:', bestVoice.name);
            }
          }

          utterance.lang = speechLang;
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          utterance.onstart = () => {
            console.log(`🔊 TTS: Started chunk ${index + 1}`);
          };

          utterance.onend = () => {
            console.log(`🔊 TTS: Ended chunk ${index + 1}`);
            setTimeout(() => speakNextChunk(index + 1), 100);
          };

          utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            if (e.error === 'interrupted') {
              console.log(`🔊 TTS: Chunk ${index + 1} interrupted (barge-in)`);
              return;
            }
            console.error(`🔊 TTS: Error in chunk ${index + 1}:`, e.error);
            setTimeout(() => speakNextChunk(index + 1), 200);
          };

          speechSynthRef.current?.speak(utterance);
        } catch (chunkError) {
          console.error(`🔊 TTS: Exception in chunk ${index + 1}:`, chunkError);
          setTimeout(() => speakNextChunk(index + 1), 200);
        }
      };

      speakNextChunk(0);
    } catch (error: unknown) {
      console.error('🔊 TTS: Critical error:', error);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  };

  const speak = (text: string): void => {
    if (!text || text.trim().length === 0) {
      console.warn('🔊 TTS: Empty text provided');
      return;
    }
    console.log('🔊 TTS: speak() called with text length:', text.length);
    speakWithPriority(text);
  };

  const isFixedResponse = (text: string): boolean => {
    if (!text) return false;

    const lowerText = text.toLowerCase().trim();

    if (
      fixedResponsesRef.current.greetings.some(
        (greeting) =>
          lowerText === greeting.toLowerCase() ||
          lowerText.includes('i am here how can i help you') ||
          lowerText.includes('how can i help you'),
      )
    ) {
      return true;
    }

    return false;
  };

  const getRandomGreeting = (): string => {
    const greetings = fixedResponsesRef.current.greetings;
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const toggleContinuousListening = async (): Promise<void> => {
    if (!isClient) return;

    if (!browserSupportsSpeechRecognition) {
      toast.error('Speech recognition not available in this browser');
      return;
    }

    try {
      if (!isContinuousListening) {
        const hasMicAccess = await requestMicrophonePermission();
        if (!hasMicAccess) return;
      }

      if (isContinuousListening) {
        SpeechRecognition.stopListening();
        SpeechRecognition.abortListening();

        if (microphoneStreamRef.current) {
          microphoneStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          microphoneStreamRef.current = null;
        }

        setIsContinuousListening(false);
        setAlwaysListening(false);
        resetTranscript();

        if (speechSynthRef.current && speechSynthRef.current.speaking) {
          speechSynthRef.current.cancel();
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          console.log(
            '🔊 TTS: Speech cancelled (isContinuousListening = false)',
          );
        }
      } else {
        setAlwaysListening(true);
        setIsContinuousListening(true);
        setHasInteracted(true);
        resetTranscript();

        setTimeout(() => {
          try {
            SpeechRecognition.startListening({ continuous: true });
            console.log('Speech recognition started');
          } catch (e) {
            console.error('Error starting speech recognition:', e);
          }
        }, 100);

        playNotificationSound().then(() => {
          if (isContinuousListening) {
            speakWithPriority(getRandomGreeting());
          }
        });
      }
    } catch (error: unknown) {
      console.error('Failed to toggle continuous listening:', error);
      toast.error('Failed to toggle speech recognition');
    }
  };

  const processTranscript = (currentTranscript: string): void => {
    if (!isClient) return;
    if (!currentTranscript) return;
    if (isLoadingRef.current) return;
    if (isSpeaking) {
      console.log('🔊 Ignoring transcript (AI is speaking - system voice)');
      return;
    }

    const newPart = currentTranscript
      .slice(lastTranscriptRef.current.length)
      .trim()
      .toLowerCase();

    if (
      !isContinuousListening &&
      (newPart.includes('hey omega') ||
        newPart.includes('hii omega') ||
        newPart.includes('hello omega') ||
        newPart.includes('hey baby'))
    ) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsContinuousListening(true);
      setHasInteracted(true);
      lastTranscriptRef.current = '';
      welcomeSpokenRef.current = true;

      playNotificationSound().then(() => {
        speakWithPriority(getRandomGreeting());
      });
      return;
    }

    if (isContinuousListening) {
      if (
        newPart.includes('hey omega') ||
        newPart.includes('hii omega') ||
        newPart.includes('hello omega') ||
        newPart.includes('hey baby')
      ) {
        if (!welcomeSpokenRef.current) {
          playNotificationSound().then(() => {
            speakWithPriority(getRandomGreeting());
          });
          welcomeSpokenRef.current = true;
        }

        resetTranscript();
        lastTranscriptRef.current = '';
        return;
      }

      if (currentTranscript !== lastTranscriptRef.current) {
        if (isSpeaking) {
          console.log(
            '🎤 BARGE-IN: User spoke while AI speaking - cancelling speech',
          );
          if (speechSynthRef.current && speechSynthRef.current.speaking) {
            speechSynthRef.current.cancel();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
          }
        }

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        const transcriptToProcess = currentTranscript;

        silenceTimerRef.current = setTimeout(() => {
          if (transcriptToProcess.trim() && !isLoadingRef.current) {
            console.log(
              'Silence detected, processing command:',
              transcriptToProcess,
            );

            if (isFixedResponse(transcriptToProcess)) {
              console.log('Fixed response detected, not sending to backend');
              resetTranscript();
              lastTranscriptRef.current = '';

              if (isContinuousListening) {
                setTimeout(() => {
                  try {
                    SpeechRecognition.startListening({ continuous: true });
                  } catch (e) {
                    console.error('Error restarting listening:', e);
                  }
                }, 50);
              }
            } else {
              lastTranscriptRef.current = '';
              resetTranscript();

              if (isContinuousListening) {
                setTimeout(() => {
                  try {
                    SpeechRecognition.startListening({ continuous: true });
                  } catch (e) {
                    console.error('Error restarting listening:', e);
                  }
                }, 50);
              }

              sendPrompt(null, transcriptToProcess);
            }
          }
        }, 2500);

        lastTranscriptRef.current = currentTranscript;
      }
    }
  };

  useEffect(() => {
    if (firebaseUser || !isAuthenticated) {
      fetchUserChats();
    }
  }, [firebaseUser, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      chats.forEach((chat) => {
        saveTempChat(chat);
      });
      console.log('Saved chats to localStorage:', chats.length);
    }
  }, [chats, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      if (selectedChat) {
        setSelectedChatId(selectedChat._id);
      } else {
        setSelectedChatId(null);
      }
    }
  }, [selectedChat, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && firebaseUser) {
      clearTempChats();
    }
  }, [isAuthenticated, firebaseUser]);

  const value: AppContextValue = {
    user: firebaseUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUserChats,
    createNewChat,
    deleteChat,
    renameChat,
    generateChatTitle,
    renamingChatId,
    setRenamingChatId,
    isWriting,
    setIsWriting,
    isLoading,
    setIsLoading,
    textUpdateTimeouts,
    setTextUpdateTimeouts,
    editAndResendMessage,
    handleEditMessage,
    requestMicrophonePermission,
    sendPrompt,
    speak,
    speakWithPriority,
    playNotificationSound,
    toggleContinuousListening,
    processTranscript,
    isFixedResponse,
    stopTextGeneration,
    isSpeaking,
    setIsSpeaking,
    isContinuousListening,
    setIsContinuousListening,
    selectedVoice,
    setSelectedVoice,
    voices,
    hasInteracted,
    setHasInteracted,
    isClient,
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    selectedModel,
    setSelectedModel,
    availableModels,
    customModels,
    addCustomModel,
    removeCustomModel,
    detectedLang,
    setDetectedLang,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
