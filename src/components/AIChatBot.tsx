"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
}

export function AIChatBot() {
  const { t, dir, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          history: messages // Send raw history, API will map it
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...newMessages, { role: "model", text: data.message }]);
      } else {
        const errorText = data.error || (language === 'ar' ? "حدث خطأ في النظام." : "System error occurred.");
        setMessages([...newMessages, { role: "model", text: `❌ ${errorText}` }]);
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: "model", text: "❌ Connection failed. Check your internet." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" dir={dir}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-card border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-primary/20"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{t("ai.name")}</h3>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">AI Powered</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary/5 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
                    <Bot size={32} />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed px-4">
                    {language === 'ar' 
                      ? "مرحباً! كيف يمكنني مساعدتك اليوم؟" 
                      : "Hi! How can I help you today?"}
                  </p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={cn("flex items-start gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'model' ? "bg-primary text-white" : "bg-secondary text-foreground"
                  )}>
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed",
                    msg.role === 'model' ? "bg-white border text-foreground" : "bg-primary text-white"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="bg-white border p-4 rounded-2xl">
                     <span className="flex gap-1">
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                     </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-background border-t">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'ar' ? "اكتب رسالتك..." : "Type your message..."}
                  className={cn(
                    "w-full py-4 rounded-2xl border bg-secondary/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium pr-12 pl-4 transition-all",
                    dir === 'rtl' ? "pr-4 pl-12" : "pl-4 pr-12"
                  )}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20",
                    dir === 'rtl' ? "left-2" : "right-2"
                  )}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center relative z-50"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
