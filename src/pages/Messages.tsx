import { Search, Send, Circle } from 'lucide-react';
import { useState } from 'react';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Ms. Johnson',
      role: 'Mathematics Teacher',
      lastMessage: 'Great progress on the last test!',
      time: '10:30 AM',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Dr. Smith',
      role: 'Physics Teacher',
      lastMessage: 'Lab report deadline extended',
      time: 'Yesterday',
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: 'Mr. Anderson',
      role: 'Literature Teacher',
      lastMessage: 'Your essay was excellent',
      time: '2 days ago',
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: 'Class 11-A Group',
      role: 'Study Group',
      lastMessage: 'Alex: Who wants to study tomorrow?',
      time: '3 days ago',
      unread: 5,
      online: true,
    },
  ];

  const currentMessages = [
    {
      id: 1,
      sender: 'Ms. Johnson',
      content: 'Hi Bianca! I wanted to congratulate you on your excellent performance in the last math test.',
      time: '10:15 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Thank you so much, Ms. Johnson! I really enjoyed working on those quadratic problems.',
      time: '10:20 AM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Ms. Johnson',
      content: 'Great progress on the last test! Keep up the excellent work. I\'ve noticed your problem-solving skills have really improved.',
      time: '10:30 AM',
      isOwn: false,
    },
  ];

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex gap-6 h-full">
        <div className="w-80 bg-white rounded-2xl border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Messages
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedChat === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full"></div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">{conv.name}</p>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{conv.role}</p>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-6 h-6 bg-[#164B2E] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-[#F1F5F9] font-semibold">{conv.unread}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Ms. Johnson</h2>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-sm text-gray-500">Active now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full mr-3 flex-shrink-0"></div>
                  )}
                  <div className={`max-w-[70%] ${msg.isOwn ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        msg.isOwn
                          ? 'bg-[#164B2E] text-[#F1F5F9] rounded-tr-none'
                          : 'bg-white border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      <p className={`text-sm ${msg.isOwn ? 'text-[#F1F5F9]' : 'text-gray-900'}`}>
                        {msg.content}
                      </p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </p>
                  </div>
                  {msg.isOwn && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full ml-3 flex-shrink-0 order-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
              />
              <button className="bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span className="font-medium">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
