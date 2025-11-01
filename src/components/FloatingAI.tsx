import { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group z-50"
        >
          <div className="absolute inset-0 rounded-full bg-[#164B2E] opacity-0 group-hover:opacity-100 animate-pulse"></div>
          <Bot className="w-8 h-8 text-[#F1F5F9] relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#F1F5F9]" />
              </div>
              <div>
                <h3 className="text-[#F1F5F9] font-semibold">AI Assistant</h3>
                <p className="text-[#F1F5F9]/70 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#F1F5F9] hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#164B2E] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-[#F1F5F9]" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[75%]">
                  <p className="text-sm text-gray-800">
                    Hi! I'm your AI learning companion. I can help you with homework, explain concepts, or create study plans. What would you like to work on?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
              />
              <button className="bg-[#164B2E] text-[#F1F5F9] p-3 rounded-xl hover:bg-[#0d2819] transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
