import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  TrendingUp, 
  List, 
  ShieldCheck, 
  Hammer 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  widget?: {
    type: 'chart' | 'list' | 'actions' | 'kpis';
    title: string;
    data: any;
  };
}

export const AiCopilotDrawer: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  const { refreshTrips } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'init', 
      sender: 'ai', 
      text: '### Welcome to TransitOps AI+ Operations Center\nI am your Copilot. You can ask me to analyze telemetry, predict fuel expenses, check driver rankings, or optimize dispatch schedules. How can I assist you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Autoscroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Setup Web Speech API for voice assistant input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Try Google Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    const userMsg: Message = { id: `msg-${Date.now()}-user`, sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/ai/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText })
      });
      const data = await res.json();
      
      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.message,
        widget: data.widget
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { id: `msg-${Date.now()}-err`, sender: 'ai', text: 'Error connecting to Gemini API endpoint. Verify server is online.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Triggers action logs inside messages (e.g. Schedule Maintenance)
  const handleWidgetAction = async (payload: any, widgetId: string) => {
    try {
      if (payload.vehicleId) {
        // Mock schedule maintenance API trigger
        alert(`Maintenance Action Approved: ${payload.type} scheduled for Vehicle ${payload.vehicleId}.`);
        setMessages(prev => [
          ...prev,
          { id: `msg-act-${Date.now()}`, sender: 'ai', text: `Confirmed: Scheduled service task for vehicle **${payload.vehicleId}** has been written to the maintenance schedule database.` }
        ]);
        await refreshTrips();
      } else if (payload.driverId) {
        alert(`Driver Coaching Approved for Driver ${payload.driverId}. Notification dispatched to mobile device.`);
        setMessages(prev => [
          ...prev,
          { id: `msg-act-${Date.now()}`, sender: 'ai', text: `Coaching modules dispatched to Driver ID: **${payload.driverId}**.` }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper parser to render safe github-style markdown bolding/headers
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;
      
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-slate-100 text-sm mt-3 mb-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-black text-slate-100 text-base mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const clean = line.replace(/^[*-\s]+/, '');
        return <li key={idx} className="ml-4 list-disc text-slate-350 text-[11px] leading-relaxed mt-1">{parseInlineStyles(clean)}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        const clean = line.replace(/^\d+\.\s+/, '');
        return <li key={idx} className="ml-4 list-decimal text-slate-350 text-[11px] leading-relaxed mt-1">{parseInlineStyles(clean)}</li>;
      }
      return <p key={idx} className="text-slate-350 text-[11px] leading-relaxed mt-1.5">{parseInlineStyles(line)}</p>;
    });
  };

  const parseInlineStyles = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-200">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!inline && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/20 hover:scale-105 active:scale-95 transition-all duration-200 z-50 animate-bounce"
        >
          <Bot className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Drawer Overlay */}
      {!inline && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] transition-opacity duration-300"
        />
      )}

      {/* Slide-out / Inline Panel */}
      <div className={inline 
        ? "relative w-full h-[55vh] bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden"
        : `fixed top-0 right-0 h-screen w-[420px] max-w-full bg-slate-950/95 border-l border-slate-800/80 shadow-2xl flex flex-col z-[300] transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`
      }>
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center space-x-1.5">
                <span>AI Fleet Copilot</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live System Analyst</span>
            </div>
          </div>
          {!inline && (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Message Thread Scroll view */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-2xl p-4 border text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-blue-600/10 border-blue-500/20 text-slate-200 rounded-tr-none' 
                  : 'bg-slate-900 border-slate-850 text-slate-300 rounded-tl-none'
              }`}>
                {msg.sender === 'ai' ? renderMarkdown(msg.text) : msg.text}
              </div>

              {/* Renders dynamic AI structured widgets */}
              {msg.widget && (
                <div className="w-full max-w-[95%] glass-panel border border-slate-800 rounded-2xl p-4 space-y-3.5 my-2">
                  <span className="text-[9px] text-blue-400 uppercase font-black tracking-widest flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{msg.widget.title}</span>
                  </span>

                  {/* Widget 1: Recharts Chart */}
                  {msg.widget.type === 'chart' && (
                    <div className="w-full h-40 text-[9px] font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.widget.data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={8} />
                          <YAxis stroke="#64748b" fontSize={8} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Revenue" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Widget 2: Leaderboard rankings list */}
                  {msg.widget.type === 'list' && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {msg.widget.data.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-950/40 border border-slate-900 text-[10px]">
                          <div>
                            <div className="font-bold text-slate-200">{item.label}</div>
                            <div className="text-[9px] text-slate-500 mt-0.5">{item.subLabel}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Widget 3: KPI Metrics Grid */}
                  {msg.widget.type === 'kpis' && (
                    <div className="grid grid-cols-3 gap-2">
                      {msg.widget.data.map((kpi: any, i: number) => (
                        <div key={i} className="text-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{kpi.label}</span>
                          <div className="text-xs font-black text-slate-200 mt-1">{kpi.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Widget 4: Actionable Card buttons */}
                  {msg.widget.type === 'actions' && (
                    <div className="space-y-3">
                      {msg.widget.data.map((action: any) => (
                        <div key={action.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between gap-2.5">
                          <div>
                            <h5 className="text-[11px] font-bold text-slate-200">{action.title}</h5>
                            <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">{action.description}</p>
                          </div>
                          <button
                            onClick={() => handleWidgetAction(action.payload, action.id)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-extrabold text-[10px] transition-colors flex items-center justify-center space-x-1"
                          >
                            <Hammer className="w-3.5 h-3.5" />
                            <span>{action.actionLabel}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl p-4 bg-slate-900 border border-slate-850 flex items-center space-x-2 text-xs text-slate-450 rounded-tl-none">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">AI Copilot is formulating strategy...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center space-x-2">
          {/* Voice Speech trigger */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2 rounded-lg border transition-all ${
              isListening 
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)] animate-pulse' 
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          
          <input
            type="text"
            placeholder={isListening ? 'Listening...' : 'Ask Copilot anything...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || isListening}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-550 font-medium"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading || isListening}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </>
  );
};
export default AiCopilotDrawer;
