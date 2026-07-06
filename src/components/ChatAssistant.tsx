import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Trash2, Plus, CornerDownLeft, Sparkles, Languages, Mic, Volume2, User, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatSession, ChatMessage, Recommendation } from "../types";

interface ChatAssistantProps {
  initialContext: Recommendation | null;
  onClearContext: () => void;
}

export default function ChatAssistant({ initialContext, onClearContext }: ChatAssistantProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tamilMode, setTamilMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Voice input/output simulation states
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick action farming questions
  const SUGGESTED_QUESTIONS = [
    { label: "Why this fertilizer?", text: "Can you explain in detail why this fertilizer recommendation suits my soil?" },
    { label: "How much to use?", text: "What is the precise dosage calculation and application frequency per acre?" },
    { label: "Best irrigation?", text: "What are the recommended irrigation methods for my target crop to prevent fertilizer leaching?" },
    { label: "Organic options?", text: "Provide detailed organic manure and green compost alternatives for this crop." },
    { label: "Weather advice?", text: "How does the current rainfall and humidity profile affect my soil nutrient application?" },
    { label: "Crop diseases?", text: "What are the major pest risks and leaf diseases associated with this crop, and how do I prevent them?" }
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId]);

  // Load a context-based query when opened from results page
  useEffect(() => {
    if (initialContext) {
      const prompt = tamilMode 
        ? `என் மண் தாதுக்கள்: N=${initialContext.N}, P=${initialContext.P}, K=${initialContext.K}. பயிர்: ${initialContext.crop}. பரிந்துரைக்கப்பட்ட உரம்: ${initialContext.recommendedFertilizer}. இதைப் பற்றி தமிழ் மொழியில் விளக்க முடியுமா?`
        : `My Soil metrics: N=${initialContext.N}, P=${initialContext.P}, K=${initialContext.K}, pH=${initialContext.pH}, Crop=${initialContext.crop}. You recommended ${initialContext.recommendedFertilizer}. Can you explain why and give me organic alternatives?`;
      
      handleSendMessage(prompt);
      onClearContext(); // clear after consumption
    }
  }, [initialContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const createNewSession = () => {
    const newId = `session_${Date.now()}`;
    setActiveSessionId(newId);
    // Add local placeholder, it gets saved on server upon first message
    setSessions(prev => [
      { id: newId, title: "New Conversation", messages: [], updatedAt: new Date().toISOString() },
      ...prev
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    setInputMessage("");
    setLoading(true);

    const tempSessionId = activeSessionId || `session_${Date.now()}`;
    if (!activeSessionId) {
      setActiveSessionId(tempSessionId);
    }

    // Immediately show user message in local state
    setSessions(prev => {
      const sessionExists = prev.some(s => s.id === tempSessionId);
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        text,
        timestamp: new Date().toISOString()
      };

      if (sessionExists) {
        return prev.map(s => {
          if (s.id === tempSessionId) {
            return {
              ...s,
              title: s.title === "New Conversation" ? text.substring(0, 30) + (text.length > 30 ? "..." : "") : s.title,
              messages: [...s.messages, userMsg],
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        });
      } else {
        return [
          { id: tempSessionId, title: text.substring(0, 30) + (text.length > 30 ? "..." : ""), messages: [userMsg], updatedAt: new Date().toISOString() },
          ...prev
        ];
      }
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text + (tamilMode ? " (Please respond in Tamil / தமிழ் மொழியில் பதிலளிக்கவும்)" : ""),
          sessionId: tempSessionId
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Update sessions with official server response (which includes model response)
        setSessions(prev => {
          return prev.map(s => {
            if (s.id === tempSessionId) {
              return {
                ...s,
                title: data.title,
                messages: data.messages,
                updatedAt: data.updatedAt
              };
            }
            return s;
          });
        });
      }
    } catch (err) {
      console.error("Chat sending failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = sessions.filter(s => s.id !== id);
        setSessions(remaining);
        if (activeSessionId === id) {
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : "");
        }
      }
    } catch (err) {
      console.error("Delete session failed:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simulate Mic Voice Input
  const triggerVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    // Simulate transcribing voice in 2 seconds
    setTimeout(() => {
      setInputMessage(tamilMode ? "நிலத்தில் யூரியா உரத்தை எவ்வளவு பயன்படுத்த வேண்டும்?" : "How much urea should I apply to my damp soil?");
      setIsListening(false);
    }, 2000);
  };

  // Simulate Speech Synthesis/Audio Output
  const speakMessage = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      // Stop speaking simulation
      setSpeakingMessageId(null);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    setSpeakingMessageId(messageId);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[\*\#-]/g, ""));
      utterance.lang = tamilMode ? "ta-IN" : "en-US";
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Mock synthesis if unsupported
      setTimeout(() => {
        setSpeakingMessageId(null);
      }, 4000);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[720px] items-stretch pb-12">
      
      {/* Left Sidebar: Session History */}
      <div className="lg:col-span-1 bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-full overflow-hidden">
        <div className="space-y-4 overflow-hidden flex flex-col h-full">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Farming Chats</h3>
            <button
              onClick={createNewSession}
              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-lg active:scale-95 transition-all cursor-pointer"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`flex justify-between items-center p-3 rounded-xl cursor-pointer text-xs transition-all group border ${activeSessionId === s.id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-slate-950/20 border-transparent hover:bg-slate-950/45 text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="truncate font-semibold">{s.title || "New Chat"}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 rounded transition-all cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-[11px]">No chats found.</div>
            )}
          </div>
        </div>

        {/* Tamil Translator trigger */}
        <div className="pt-4 border-t border-slate-800/50 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Languages className="w-4 h-4 text-emerald-500" /> Language: {tamilMode ? "தமிழ்" : "English"}
          </div>
          <button
            onClick={() => setTamilMode(!tamilMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase cursor-pointer transition-all ${tamilMode ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white'}`}
          >
            {tamilMode ? "English" : "தமிழ்"}
          </button>
        </div>
      </div>

      {/* Right Content Pane: Chat messages */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden">
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {activeSession && activeSession.messages && activeSession.messages.length > 0 ? (
            <AnimatePresence initial={false}>
              {activeSession.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-slate-950 border-slate-800 text-emerald-400" : "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className="space-y-1.5">
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${msg.role === "user" ? "bg-emerald-950/20 border-emerald-500/15 text-slate-800 dark:text-emerald-100 rounded-tr-none" : "bg-slate-950/70 border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none"}`}>
                      {msg.text}
                    </div>
                    {/* Timestamp & Speak */}
                    <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => speakMessage(msg.id, msg.text)}
                        className={`p-1 hover:bg-slate-800 rounded transition-all cursor-pointer ${speakingMessageId === msg.id ? 'text-emerald-400' : 'text-slate-500'}`}
                        title="Speech Output"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            /* Welcome / Suggested screen */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-emerald-300">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Ask Fertilizer & Agriculture Assistant</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I am connected to an agricultural vector database indexing government guidelines and crop manuals. Ask me questions or tap standard prompts below.
                </p>
              </div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl w-full pt-4">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q.text)}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-left hover:bg-emerald-500/10 hover:border-emerald-500/20 text-xs transition-all cursor-pointer text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    {tamilMode ? `தமிழ்: ${q.label}` : q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex gap-3.5 mr-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-950/40 border border-slate-800/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Gemini compiling answer with ChromaDB context...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-3">
          {/* Voice Mic mockup */}
          <button
            onClick={triggerVoiceInput}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 flex-shrink-0 ${isListening ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
            title="Voice Input (Speech-to-Text Mockup)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening, speak clearly..." : "Ask agronomy expert questions, explain crop disease, dosage..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl disabled:opacity-40 transition-all flexitems-center justify-center cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
