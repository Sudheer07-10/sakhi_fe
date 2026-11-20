
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { detectScript } from '@/utils/language';
import { useJourney } from '@/contexts/JourneyContext';
import { useLanguage } from '@/i18n/LanguageProvider';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  lang: string;
  isStreaming?: boolean;
}

interface InteractiveDemoProps {
  onCtaClick?: () => void;
}

const QUICK_PROMPTS = [
  "Find a top Cardiology hospital near me",
  "I'm feeling anxious about my upcoming surgery",
  "I have a fever of 101°F after my procedure",
  "What should my diet be after gastric bypass?"
];

export function InteractiveDemo({ onCtaClick }: InteractiveDemoProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { journey } = useJourney();
  const { t } = useLanguage();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamText = async (botMessageId: string, fullText: string, delay: number = 20) => {
    let displayedText = '';
    for (let i = 0; i < fullText.length; i++) {
      displayedText += fullText[i];
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: displayedText } : msg
        )
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setMessages(prev =>
      prev.map(msg =>
        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
      )
    );
  };

  const sendMessage = async (text: string) => {
    const textToSend = text.trim();
    if (!textToSend || isLoading) return;

    setIsLoading(true);
    const userLang = detectScript(textToSend);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      lang: userLang,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          lang: userLang,
          context: {
            stage: journey?.stage,
            date: journey?.date,
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessageId = (Date.now() + 1).toString();

      const botMessage: Message = {
        id: botMessageId,
        text: '',
        isUser: false,
        lang: userLang,
        isStreaming: true,
      };

      setMessages(prev => [...prev, botMessage]);
      await streamText(botMessageId, data.botResponse);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: t('Sakhi_Landing_Page.Interactive_Demo.sakhi_demo_error'),
        isUser: false,
        lang: userLang,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialPrompts = () => {
    if (!journey) return QUICK_PROMPTS;
    if (journey.stage === 'CONCEPTION_PREP') return ["Find a top Cardiology hospital near me", "Best diet before surgery", "How much will a procedure cost?", "How to prepare my body?"];
    if (journey.stage === 'PREGNANT') return ["I have a fever of 101°F after my procedure", "Common recovery symptoms", "How to manage pain?", "What to pack for hospital?"];
    if (journey.stage === 'PARENT') return ["Post-surgery diet tips", "When can I resume exercise?", "Wound care instructions", "Feeling anxious during recovery"];
    return QUICK_PROMPTS;
  };

  const [activePrompts, setActivePrompts] = useState<string[]>([]);

  // Initially set prompts based on journey
  useEffect(() => {
    setActivePrompts(getInitialPrompts().slice(0, 4));
  }, [journey]);

  // Dynamically change follow-ups after each bot response
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (messages.length > 0 && lastMessage && !lastMessage.isUser && !lastMessage.isStreaming) {
      const allPrompts = getInitialPrompts();
      // Shuffle and pick a new set of 4 prompts to keep it dynamic
      const shuffled = [...allPrompts]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      // Delay slightly for effect
      const timer = setTimeout(() => {
        setActivePrompts(shuffled);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleReset = () => {
    setMessages([]);
    setInputText('');
    setIsLoading(false);
    setActivePrompts(getInitialPrompts().slice(0, 4));
  };

  return (
    <section className="py-12 md:py-20 bg-[#FAFBFF]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Demo Interface */}
        <motion.div
          className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col h-[700px] relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('Sakhi_Landing_Page.Interactive_Demo.sakhi_demo_heading')}</h3>
              <p className="text-gray-500 text-sm font-medium">
                {t('Sakhi_Landing_Page.Interactive_Demo.sakhi_demo_subtitle')}
              </p>
            </div>
            <motion.button
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ rotate: -180 }}
              whileTap={{ scale: 0.9 }}
              title="Reset Conversation"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar bg-white">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center select-none">
                <p className="text-gray-400 text-xl md:text-2xl font-medium">{t('Sakhi_Landing_Page.Interactive_Demo.sakhi_demo_start')}</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3.5 rounded-2xl ${msg.isUser
                      ? 'bg-[#F3F4F6] text-gray-800 rounded-tr-sm shadow-sm'
                      : 'bg-white border border-gray-100 shadow-md text-gray-800 rounded-tl-sm'
                      }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                    {msg.isStreaming && <span className="animate-pulse inline-block ml-1 text-primary">▌</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Area: Prompts & Input */}
          <div className="px-8 py-6 bg-white border-t border-gray-100 space-y-6">
            {/* Quick Prompts */}
            <div className="space-y-4">
              <p className="text-base font-bold text-gray-900">
                {t('Sakhi_Landing_Page.Interactive_Demo.sakhi_demo_prompts')}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {activePrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-5 py-3 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] rounded-2xl text-sm font-medium transition-all shadow-sm active:scale-95"
                    disabled={isLoading}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input Field */}
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                placeholder={t('Sakhi_Landing_Page.Interactive_Demo.sakhi_demo_input')}
                className="w-full px-6 py-4 bg-white border border-gray-200 focus:border-gray-300 rounded-full focus:outline-none transition-all text-gray-700 shadow-sm"
                disabled={isLoading}
              />
              <motion.button
                onClick={() => sendMessage(inputText)}
                disabled={isLoading || !inputText.trim()}
                className="p-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg disabled:opacity-50 transition-all shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Global style for scrollbar in this component context */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.05);
            border-radius: 10px;
          }
        `}} />
      </div>
    </section>
  );
}

