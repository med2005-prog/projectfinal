"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, MoreVertical, Phone, Mic, ShieldAlert, CheckCircle2, Video, Loader2, MessageSquare, Trash2, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { CallInterface } from "@/components/CallInterface";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, dir, language } = useLanguage();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [callMode, setCallMode] = useState<"audio" | "video">("audio");
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/messages");
    }
  }, [user, authLoading, router]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
          if (data.data.length > 0 && !activeChat) {
            setActiveChat(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch messages for active chat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isFetching = false;

    const fetchMessages = async (isFirstLoad = false) => {
      if (!activeChat || isFetching) return;
      isFetching = true;
      if (isFirstLoad) setMsgLoading(true);
      try {
        const res = await fetch(`/api/messages/${activeChat._id}`);
        const data = await res.json();
        if (data.success) {
          // Compare with current messages to avoid unnecessary state updates
          setMessages(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.data)) {
              return data.data;
            }
            return prev;
          });
          
          // Mark as read 
          await fetch("/api/messages/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: activeChat._id })
          });
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        if (isFirstLoad) setMsgLoading(false);
        isFetching = false;
      }
    };

    fetchMessages(true);
    interval = setInterval(() => fetchMessages(false), 3000);

    return () => clearInterval(interval);
  }, [activeChat]);

  const handleDeleteConversation = async () => {
    if (!activeChat || !confirm(t("msg.deleteConfirm"))) return;
    
    try {
      const res = await fetch(`/api/conversations?id=${activeChat._id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setConversations(conversations.filter(c => c._id !== activeChat._id));
        setActiveChat(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-scroll to bottom only if user is already near bottom or it's a new message from them
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      if (isNearBottom || messages[messages.length - 1]?.sender === user?._id) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages, user?._id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat) return;
    
    const receiver = activeChat.participants.find((p: any) => p._id !== user?._id);
    const tempId = Date.now().toString();
    const tempMsg = {
      _id: tempId,
      sender: user?._id,
      content: inputMessage,
      type: "text",
      createdAt: new Date().toISOString(),
      sending: true
    };

    setMessages(prev => [...prev, tempMsg]);
    const contentToSend = inputMessage;
    setInputMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeChat._id,
          receiverId: receiver?._id,
          postId: activeChat.item?._id,
          content: contentToSend,
          type: "text"
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m._id === tempId ? data.data : m));
        setConversations(prev => prev.map(c => 
          c._id === activeChat._id 
            ? { ...c, lastMessage: contentToSend, lastMessageAt: new Date().toISOString() }
            : c
        ));
      } else {
        setMessages(prev => prev.map(m => m._id === tempId ? { ...m, error: true, sending: false } : m));
      }
    } catch (err) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, error: true, sending: false } : m));
    }
  };

  const handleSendVoice = async (blob: Blob) => {
    if (!activeChat) return;
    setIsRecording(false);
    
    const receiver = activeChat.participants.find((p: any) => p._id !== user?._id);
    const tempId = Date.now().toString();
    const tempMsg = {
      _id: tempId,
      sender: user?._id,
      content: language === 'ar' ? "رسالة صوتية..." : "Sending voice message...",
      type: "text", // Temporary show as text while uploading
      createdAt: new Date().toISOString(),
      sending: true
    };

    setMessages(prev => [...prev, tempMsg]);
    
    try {
      const formData = new FormData();
      formData.append("image", blob, "voice.webm"); 
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) {
        setMessages(prev => prev.filter(m => m._id !== tempId));
        alert("Failed to upload voice message");
        return;
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeChat._id,
          receiverId: receiver?._id,
          postId: activeChat.item?._id,
          type: "audio",
          audioUrl: uploadData.url,
          transcription: language === 'ar' ? "رسالة صوتية" : "Voice Message"
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m._id === tempId ? data.data : m));
        setConversations(prev => prev.map(c => 
          c._id === activeChat._id 
            ? { ...c, lastMessage: "Voice message 🎙️", lastMessageAt: new Date().toISOString() }
            : c
        ));
      } else {
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      console.error("Voice send error:", err);
    }
  };


  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  const handleStartCall = async (mode: "audio" | "video") => {
    if (!activeChat || !user) return;
    const receiver = activeChat.participants.find((p: any) => p._id !== user?._id);
    
    try {
      setCallMode(mode);
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          receiverId: receiver._id, 
          type: mode 
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveCallId(data.data._id);
        setIsCalling(true);
      }
    } catch (err) {
      console.error("Failed to start call", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className={cn("flex bg-card overflow-hidden shadow-sm border-t md:border", 
      "h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] rounded-none md:rounded-3xl relative"
    )} dir={dir}>
      {/* Sidebar */}
      <div className={cn("w-full md:w-80 border-r flex flex-col bg-background/50 transition-all", activeChat ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground", dir === 'rtl' ? 'right-3' : 'left-3')} size={18} />
            <input 
              type="text" 
              placeholder={t("msg.search")} 
              className={cn("w-full bg-secondary border-none rounded-xl py-2 text-sm focus:ring-1 focus:ring-primary/30", 
                dir === 'rtl' ? 'pr-10 pl-3' : 'pl-10 pr-3'
              )} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? conversations.map((chat) => {
            const otherUser = chat.participants.find((p: any) => p._id !== user?._id);
            return (
              <button
                key={chat._id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "w-full p-4 border-b flex items-start gap-3 transition-colors hover:bg-secondary/50",
                  dir === 'rtl' ? 'text-right' : 'text-left',
                  activeChat?._id === chat._id ? "bg-secondary" : ""
                )}
              >
                <div className="relative shrink-0">
                  {otherUser?.avatar ? (
                    <Image src={otherUser.avatar} alt={otherUser.name} width={48} height={48} className="rounded-full object-cover w-12 h-12" />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                       {otherUser?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-semibold text-sm truncate">{otherUser?.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                       {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-primary font-medium mb-1 truncate">Re: {chat.item?.title}</p>
                  <p className="text-sm truncate text-muted-foreground italic">
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            );
          }) : (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
               <MessageSquare size={40} className="opacity-20" />
               <p className="text-sm font-bold">
                 {language === 'ar' ? "لا توجد محادثات بعد" : "Pas encore de conversations"}
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex flex-col bg-background absolute inset-0 z-10 md:relative md:z-0", activeChat ? "flex" : "hidden md:flex")}>
        {activeChat ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveChat(null)}
                  className={cn("md:hidden p-2 -mx-2 hover:bg-secondary rounded-full", dir === 'rtl' ? 'ml-1' : 'mr-1')}
                >
                  <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-primary font-bold">
                  {activeChat.participants.find((p: any) => p._id !== user?._id)?.avatar ? (
                    <img src={activeChat.participants.find((p: any) => p._id !== user?._id)?.avatar} className="w-full h-full object-cover" />
                  ) : (
                    activeChat.participants.find((p: any) => p._id !== user?._id)?.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{activeChat.participants.find((p: any) => p._id !== user?._id)?.name}</h3>
                  <p className="text-xs text-green-500 font-medium">
                    {language === 'ar' ? "متصل" : "En ligne"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleStartCall("audio")} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><Phone size={20} /></button>
                <button onClick={() => handleStartCall("video")} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><Video size={20} /></button>
                <div className="relative">
                  <button 
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 hover:bg-secondary rounded-full text-muted-foreground"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showActions && (
                    <div className={cn(
                      "absolute top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden p-1",
                      dir === 'rtl' ? 'left-0' : 'right-0'
                    )}>
                      <button 
                        onClick={handleDeleteConversation}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-bold"
                      >
                        <Trash2 size={16} />
                        {language === 'ar' ? "حذف المحادثة" : "Delete Conversation"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {msgLoading && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className={cn("flex", msg.sender === user?._id ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] p-3 px-4 rounded-2xl",
                      msg.sender === user?._id 
                        ? "bg-primary text-primary-foreground " + (dir === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none')
                        : "bg-secondary " + (dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none')
                    )}>
                      {msg.type === "text" ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div>
                          <AudioPlayer 
                            src={msg.audioUrl} 
                            isSender={msg.sender === user?._id} 
                            avatar={activeChat.participants.find((p: any) => p._id === msg.sender)?.avatar}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4 mt-1">
                        <span className={cn(
                          "text-[10px] block",
                          msg.sender === user?._id ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {msg.sending && (
                          <div className="flex items-center gap-1">
                             <Loader2 size={10} className="animate-spin" />
                             <span className="text-[10px] opacity-70">
                                {language === 'ar' ? "جاري الإرسال..." : "Sending..."}
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-card/80 backdrop-blur-md sticky bottom-0">
              <div className="flex items-end gap-2 relative">
                {isRecording ? (
                  <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <VoiceRecorder onSend={handleSendVoice} onCancel={() => setIsRecording(false)} />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center bg-secondary/80 rounded-[24px] px-2 py-1.5 min-h-[48px] shadow-sm border border-border/50">
                       <input 
                         type="text" 
                         value={inputMessage}
                         onChange={(e) => setInputMessage(e.target.value)}
                         onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                         placeholder={t("msg.type")} 
                         className={cn("flex-1 bg-transparent border-none py-2 text-[15px] outline-none focus:ring-0", dir === 'rtl' ? 'pr-3 pl-2' : 'pl-3 pr-2')}
                       />
                    </div>
                    
                    <button 
                      onClick={() => inputMessage.trim() ? handleSendMessage() : setIsRecording(true)}
                      className="w-12 h-12 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-md"
                    >
                      {inputMessage.trim() ? (
                         <Send size={20} className={dir === 'rtl' ? 'mr-1 rotate-180' : 'ml-1'} />
                      ) : (
                         <Mic size={22} />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
             <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
                <MessageSquare size={40} />
             </div>
             <div>
                <h3 className="text-xl font-black">
                  {language === 'ar' ? "اختر محادثة للبدء" : "Sélectionnez une conversation"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {language === 'ar' 
                    ? "اختر محادثة من القائمة الجانبية لبدء التحقق من الملكية وتنسيق عملية الاسترجاع." 
                    : "Choisissez une conversation pour commencer à vérifier la propriété et coordonner le retour."}
                </p>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCalling && (
          <CallInterface 
            userName={activeChat?.participants.find((p: any) => p._id !== user?._id)?.name} 
            userAvatar={activeChat?.participants.find((p: any) => p._id !== user?._id)?.avatar} 
            onEnd={() => { setIsCalling(false); setActiveCallId(null); }} 
            mode={callMode}
            callId={activeCallId || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
