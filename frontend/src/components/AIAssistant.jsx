import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const AIAssistant = () => {
  const { user, isSignedIn } = useUser();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Starting welcome message
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "Hi there! I'm your personal AI Career Coach. Because I'm connected to your dashboard, I can answer questions specifically about your resume, suggest interview prep, or help you figure out your next career move. What's on your mind?" 
    }
  ]);

  // This automatically scrolls the chat down when a new message appears
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isSignedIn) return;

    const userText = input;
    setInput(''); // Clear the input box instantly
    
    // Add the user's message to the screen
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // Send the message and the user's email to Flask
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          email: user.primaryEmailAddress.emailAddress
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add the AI's reply to the screen
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I hit a snag connecting to my brain! Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Server error. Make sure your Flask backend is running!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Bot size={48} className="mb-4 opacity-20" />
        <p>Please log in using the button at the top right to chat with your AI Assistant.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-blue-600 p-4 flex items-center gap-3 text-white">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-semibold">Career Coach AI</h2>
          <p className="text-xs text-blue-100">Context-aware • Powered by Gemini</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600 shadow-sm'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message Bubble */}
            <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                : 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100'
            }`}>
              {/* Renders line breaks properly */}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 shadow-sm flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm rounded-tl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-xs text-slate-400 font-medium">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your career..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-slate-50"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl flex items-center justify-center transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIAssistant;