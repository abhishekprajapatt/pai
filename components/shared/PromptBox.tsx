import React, {
  useEffect,
  useState,
  ChangeEvent,
  KeyboardEvent,
  FormEvent,
  MouseEvent,
  useCallback,
} from 'react';
import { mirage } from 'ldrs';
import Image from 'next/image';
import { assets } from '@/public/assets/assets';
import type { StaticImageData } from 'next/image';
import { useAppContext } from '@/context/AppContext';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  ArrowUp,
  AudioLines,
  CircleStop,
  ChevronDown,
  Plus,
  X,
} from 'lucide-react';
import VoiceInputModal from '@/components/shared/Voice';
import toast from 'react-hot-toast';

interface AppContextType {
  selectedChat: { messages: Array<{ content: string }> } | null;
  isLoading: boolean;
  isWriting: boolean;
  setIsLoading: (loading: boolean) => void;
  sendPrompt: (e: FormEvent | MouseEvent | undefined, prompt: string) => void;
  toggleContinuousListening: () => Promise<void>;
  isSpeaking: boolean;
  isContinuousListening: boolean;
  user: unknown;
  isClient: boolean;
  stopTextGeneration: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: Array<{
    id: string;
    name: string;
    image: StaticImageData | string;
  }>;
}

interface PromptBoxProps {
  initialPrompt?: string;
}

const PromptBox: React.FC<PromptBoxProps> = ({ initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [isModelOpen, setIsModelOpen] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const {
    selectedChat,
    isLoading,
    isWriting,
    setIsLoading,
    sendPrompt,
    toggleContinuousListening: toggleContinuousListeningContext,
    isSpeaking,
    isContinuousListening,
    user,
    isClient,
    stopTextGeneration,
    selectedModel,
    setSelectedModel,
    availableModels,
  } = useAppContext() as AppContextType;

  const { listening } = useSpeechRecognition();

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-model-selector]')) {
        setIsModelOpen(false);
      }
    };

    if (isModelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelOpen]);

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>): void => {
      setPrompt(e.target.value);
    },
    [],
  );

  const handleImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setUploadedImages((prev) => [...prev, base64String]);
        };
        reader.readAsDataURL(file);
      });

      if (e.target) e.target.value = '';
    },
    [],
  );

  const removeImage = (index: number): void => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const prajapattModel = availableModels.find(
    (model) => model.id === 'prajapatt',
  );
  const orderedModels = prajapattModel
    ? [
        prajapattModel,
        ...availableModels.filter((model) => model.id !== 'prajapatt'),
      ]
    : availableModels;
  const visibleModels = orderedModels.filter((model) =>
    model.name.toLowerCase().includes(modelSearch.toLowerCase()),
  );
  const selectedModelDetails =
    orderedModels.find((model) => model.id === selectedModel) ||
    orderedModels[0];
  const showModelSelector = Boolean(user && availableModels.length > 1);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSendPrompt = useCallback(
    (e?: FormEvent<HTMLFormElement> | MouseEvent): void => {
      if (e) e.preventDefault();
      if (!prompt.trim() && uploadedImages.length === 0) return;

      const data = {
        prompt,
        images: uploadedImages,
      };

      sendPrompt(e, JSON.stringify(data));
      setPrompt('');
      setUploadedImages([]);
    },
    [prompt, uploadedImages, sendPrompt],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendPrompt();
      }
    },
    [handleSendPrompt],
  );

  const handleToggleContinuousListening =
    useCallback(async (): Promise<void> => {
      if (!isContinuousListening) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          await toggleContinuousListeningContext();
        } catch (error: unknown) {
          const errorName =
            error instanceof DOMException ? error.name : undefined;
          if (errorName === 'NotAllowedError') {
            toast.error(
              'Microphone permission denied. Please enable it in settings.',
            );
          } else if (errorName === 'NotFoundError') {
            toast.error('No microphone found on your device.');
          } else {
            toast.error('Unable to access microphone.');
          }
          console.error('Microphone access error:', error);
        }
      } else {
        await toggleContinuousListeningContext();
      }
    }, [toggleContinuousListeningContext, isContinuousListening]);

  useEffect(() => {
    if (!isClient) return;

    if (isContinuousListening && !listening) {
      console.log('Listening stopped unexpectedly, restarting...');
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [listening, isContinuousListening, isClient]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      mirage.register();
    }
  }, []);

  if (!isClient) {
    return (
      <form
        className={`w-full ${
          (selectedChat?.messages?.length ?? 0) > 0 ? 'max-w-3xl' : 'max-w-2xl'
        } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
      >
        <textarea
          className="outline-none w-full resize-none overflow-hidden wrap-break-word bg-transparent text-white"
          rows={2}
          placeholder="Loading voice recognition..."
          disabled
        />
        <div className="flex items-center justify-between text-sm mt-2">
          <p className="flex items-center sm:gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full">
            <span className="sm:h-5 h-4 w-4 bg-transparent"></span>
            Prajapatt - AI
          </p>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSendPrompt}
      className={`w-full ${
        (selectedChat?.messages?.length ?? 0) > 0 ? 'max-w-3xl' : 'max-w-2xl'
      } bg-[#121212] p-4 border border-white/10 rounded-2xl mt-4 transition-all  shadow-xl shadow-gray-800`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden wrap-break-word bg-transparent text-white min-h-12.5"
        rows={2}
        placeholder="What's on your mind?"
        onChange={handlePromptChange}
        value={prompt}
      />

      {uploadedImages.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="relative">
              <Image
                src={img}
                alt="preview"
                className="w-20 h-20 rounded-lg object-cover border border-white/20"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <label
            title="Upload image"
            aria-label="Attach files"
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-[#242424] text-white/90 transition hover:bg-[#303030] focus-within:ring-2 focus-within:ring-white/30"
            htmlFor="image-upload"
          >
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              title="Upload images"
            />
            <Plus size={24} strokeWidth={1.8} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-4 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black p-2 font-serif text-sm text-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
              Attach
              <span className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black" />
            </span>
          </label>
          <div className="relative" data-model-selector>
            <div
              role={showModelSelector ? 'button' : undefined}
              tabIndex={showModelSelector ? 0 : undefined}
              aria-disabled={!showModelSelector}
              onClick={
                showModelSelector
                  ? () => setIsModelOpen(!isModelOpen)
                  : undefined
              }
              className={`flex items-center justify-between gap-2 text-white text-xs sm:w-auto ${
                showModelSelector
                  ? 'w-32 rounded-full border border-gray-300/40 bg-[#09090b] p-1 cursor-pointer hover:bg-gray-500/20 transition'
                  : 'w-auto rounded-md border border-transparent px-1 py-0.5'
              }`}
              title={showModelSelector ? 'Select AI Model' : 'Prajapatt 1'}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={selectedModelDetails?.image || assets.pai_logo}
                  alt="model"
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full"
                />
                <span className="truncate">
                  {selectedModelDetails?.name || 'Prajapatt 1'}
                </span>
              </div>
              {showModelSelector && (
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isModelOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>
            {showModelSelector && isModelOpen && (
              <div className="absolute bottom-full -left-32 md:left-0 mb-2 bg-[#09090b] border border-white/10 rounded-xl shadow-lg z-50 min-w-max w-64">
                <div className="p-3 border-b border-zinc-800">
                  <input
                    type="text"
                    placeholder="Search models..."
                    className="w-full text-white text-sm rounded-lg px-3 outline-none focus:border-zinc-600 placeholder-zinc-500"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  {visibleModels.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-white/50">
                      No saved models found.
                    </p>
                  ) : (
                    visibleModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelOpen(false);
                          setModelSearch('');
                        }}
                        className={`w-full flex items-center cursor-pointer gap-3 px-4 py-2 rounded-md text-left text-sm transition ${
                          selectedModel === model.id
                            ? 'bg-[#27272a] text-white'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <Image
                          src={model.image}
                          alt={model.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{model.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex items-center text-xs bord er border-gray-300/40 md:px-3 py-2.5 px-1.5 rounded-full ${
              isSpeaking && isContinuousListening && 'border bg-gray-500/20'
            }`}
          >
            {isSpeaking &&
              isContinuousListening &&
              React.createElement('l-mirage', {
                size: '20',
                speed: '2.5',
                color: 'white',
              })}
            <VoiceInputModal
              isContinuousListening={isContinuousListening}
              toggleContinuousListening={handleToggleContinuousListening}
              isSpeaking={isSpeaking}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-1 sm:px-auto">
          {isWriting ? (
            <button
              type="button"
              title="Stop text generation"
              onClick={stopTextGeneration}
              className="rounded-full p-2 cursor-pointer bg-primary hover:bg-primary/80"
            >
              <CircleStop size={20} />
            </button>
          ) : prompt.trim() ? (
            <div className="relative group flex items-center justify-center">
              <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition bg-black text-white/90 text-sm p-2 font-serif font-sans rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                Send message
                <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rotate-45"></div>
              </div>
              <button
                type="submit"
                aria-label="Send message"
                className={`${
                  prompt ? 'bg-primary hover:bg-primary/80' : 'bg-[#71717a]'
                } rounded-full p-2 cursor-pointer`}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          ) : user ? (
            <div className="relative group flex items-center justify-center">
              <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition bg-black text-white/90 text-sm p-2 font-serif font-sans rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                Use voice mode
                <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rotate-45"></div>
              </div>
              <button
                type="button"
                title="Toggle voice input"
                onClick={handleToggleContinuousListening}
                className={`rounded-lg p-2 cursor-pointer text-white ${
                  isContinuousListening
                    ? 'bg-slate-500'
                    : 'bg-prim ary hover:bg-primary/80'
                }`}
              >
                <AudioLines size={20} />
              </button>
            </div>
          ) : (
            <div className="relative group flex items-center justify-center">
              <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition bg-black text-white/90 text-sm p-2 font-serif font-sans rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                Send message
                <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rotate-45" />
              </div>
              <button
                type="submit"
                aria-label="Send message"
                disabled={!prompt.trim() && uploadedImages.length === 0}
                className="rounded-full p-2 cursor-pointer bg-primary hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
