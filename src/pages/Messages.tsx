import { Search, Send, Circle, Menu, X, Sparkles, ThumbsUp, CheckCheck, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

type Reaction = 'like' | 'confirm';

type Message = {
  id: number;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  reactions?: Reaction[];
};

type Conversation = {
  id: number;
  name: string;
  role: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: Date;
  time: string;
  unread: number;
  online: boolean;
};

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchSubject, setSearchSubject] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('messagesSidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('messagesSidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  const conversations: Conversation[] = [
    {
      id: 1,
      name: 'Ms. Johnson',
      role: 'Mathematics Teacher',
      subject: 'Mathematics',
      lastMessage: 'Great progress on the last test!',
      lastMessageTime: new Date('2024-11-23T10:30:00'),
      time: '10:30 AM',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Dr. Smith',
      role: 'Physics Teacher',
      subject: 'Physics',
      lastMessage: 'Lab report deadline extended',
      lastMessageTime: new Date('2024-11-22T14:20:00'),
      time: 'Yesterday',
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: 'Mr. Anderson',
      role: 'Literature Teacher',
      subject: 'Literature',
      lastMessage: 'Your essay was excellent',
      lastMessageTime: new Date('2024-11-21T09:15:00'),
      time: '2 days ago',
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: 'Class 11-A Group',
      role: 'Study Group',
      subject: 'General',
      lastMessage: 'Alex: Who wants to study tomorrow?',
      lastMessageTime: new Date('2024-11-20T16:45:00'),
      time: '3 days ago',
      unread: 5,
      online: true,
    },
  ];

  const [currentMessages, setCurrentMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Ms. Johnson',
      content: 'Hi Bianca! I wanted to congratulate you on your excellent performance in the last math test.',
      time: '10:15 AM',
      isOwn: false,
      reactions: [],
    },
    {
      id: 2,
      sender: 'You',
      content: 'Thank you so much, Ms. Johnson! I really enjoyed working on those quadratic problems.',
      time: '10:20 AM',
      isOwn: true,
      reactions: [],
    },
    {
      id: 3,
      sender: 'Ms. Johnson',
      content: 'Great progress on the last test! Keep up the excellent work. I\'ve noticed your problem-solving skills have really improved.',
      time: '10:30 AM',
      isOwn: false,
      reactions: [],
    },
  ]);

  const sortedConversations = [...conversations].sort(
    (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
  );

  const filteredConversations = sortedConversations.filter((conv) => {
    const matchesSearch = searchQuery === '' ||
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = searchSubject === '' ||
      conv.subject.toLowerCase().includes(searchSubject.toLowerCase());

    const matchesTeacher = searchTeacher === '' ||
      conv.name.toLowerCase().includes(searchTeacher.toLowerCase());

    const matchesKeywords = searchKeywords === '' ||
      conv.lastMessage.toLowerCase().includes(searchKeywords.toLowerCase());

    return matchesSearch && matchesSubject && matchesTeacher && matchesKeywords;
  });

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Mathematics': 'bg-blue-100 text-blue-700 border-blue-200',
      'Physics': 'bg-green-100 text-green-700 border-green-200',
      'Literature': 'bg-purple-100 text-purple-700 border-purple-200',
      'Chemistry': 'bg-orange-100 text-orange-700 border-orange-200',
      'History': 'bg-red-100 text-red-700 border-red-200',
      'General': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[subject] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleReaction = (messageId: number, reaction: Reaction) => {
    setCurrentMessages(messages =>
      messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const hasReaction = reactions.includes(reaction);
          return {
            ...msg,
            reactions: hasReaction
              ? reactions.filter(r => r !== reaction)
              : [...reactions, reaction],
          };
        }
        return msg;
      })
    );
  };

  const handleAIDraftReply = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const lastTeacherMessage = [...currentMessages]
        .reverse()
        .find(msg => !msg.isOwn);

      if (lastTeacherMessage) {
        const aiSuggestion = `Thank you for your feedback, ${lastTeacherMessage.sender}. I appreciate your support and will continue working hard to improve my skills.`;
        setMessage(aiSuggestion);
      }
      setIsGeneratingAI(false);
    }, 1500);
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex gap-6 h-full">
        <div
          className={`bg-white rounded-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? 'w-80' : 'w-16'
          }`}
        >
          <div className={`p-4 border-b border-gray-200 ${!isSidebarOpen ? 'flex items-center justify-center' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              {isSidebarOpen && (
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Messages
                </h1>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`}
                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            {isSidebarOpen && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
                  />
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors ${
                      showAdvancedSearch ? 'text-[#164B2E]' : 'text-gray-400'
                    }`}
                    title="Advanced search"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {showAdvancedSearch && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-200">
                    <input
                      type="text"
                      value={searchSubject}
                      onChange={(e) => setSearchSubject(e.target.value)}
                      placeholder="Filter by subject..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-xs"
                    />
                    <input
                      type="text"
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      placeholder="Filter by teacher..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-xs"
                    />
                    <input
                      type="text"
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      placeholder="Filter by keywords..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-xs"
                    />
                    <button
                      onClick={() => {
                        setSearchSubject('');
                        setSearchTeacher('');
                        setSearchKeywords('');
                      }}
                      className="w-full text-xs text-gray-600 hover:text-[#164B2E] font-medium transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedChat(conv.id);
                  if (!isSidebarOpen) {
                    setIsSidebarOpen(true);
                  }
                }}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedChat === conv.id ? 'bg-blue-50' : ''
                }`}
                title={!isSidebarOpen ? conv.name : ''}
              >
                {isSidebarOpen ? (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full"></div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{conv.name}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSubjectColor(conv.subject)} flex-shrink-0`}>
                            {conv.subject}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{conv.time}</span>
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
                ) : (
                  <div className="flex justify-center relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full"></div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                    )}
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#164B2E] rounded-full flex items-center justify-center">
                        <span className="text-xs text-[#F1F5F9] font-semibold">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                )}
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
                <h2 className="font-semibold text-gray-900">
                  {selectedConversation?.name || 'Ms. Johnson'}
                </h2>
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
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} group`}
                  onMouseEnter={() => setHoveredMessage(msg.id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  {!msg.isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full mr-3 flex-shrink-0"></div>
                  )}
                  <div className={`max-w-[70%] ${msg.isOwn ? 'order-1' : 'order-2'}`}>
                    <div className="relative">
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

                      {hoveredMessage === msg.id && (
                        <div
                          className={`absolute -top-2 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                            msg.isOwn ? 'right-0' : 'left-0'
                          }`}
                        >
                          <button
                            onClick={() => handleReaction(msg.id, 'like')}
                            className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
                              msg.reactions?.includes('like') ? 'bg-blue-50' : ''
                            }`}
                            title="Like"
                          >
                            <ThumbsUp className={`w-4 h-4 ${msg.reactions?.includes('like') ? 'text-blue-600 fill-blue-600' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleReaction(msg.id, 'confirm')}
                            className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
                              msg.reactions?.includes('confirm') ? 'bg-green-50' : ''
                            }`}
                            title="Acknowledge"
                          >
                            <CheckCheck className={`w-4 h-4 ${msg.reactions?.includes('confirm') ? 'text-green-600' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      )}

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex items-center gap-1 mt-1 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.includes('like') && (
                            <div className="bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-blue-600 fill-blue-600" />
                            </div>
                          )}
                          {msg.reactions.includes('confirm') && (
                            <div className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                              <CheckCheck className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                        </div>
                      )}
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
              <button
                onClick={handleAIDraftReply}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                title="AI Draft Reply"
              >
                {isGeneratingAI ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium text-sm">AI Draft</span>
                  </>
                )}
              </button>
              <button className="bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
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
