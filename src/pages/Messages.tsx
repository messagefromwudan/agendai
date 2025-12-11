import { Search, Send, Circle, Menu, X, Sparkles, ThumbsUp, CheckCheck, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  fetchConversations,
  fetchMessages,
  createMessage,
  updateMessageReactions,
  markConversationAsRead,
  type Conversation as ConversationType,
  type Message as MessageType,
} from '../utils/messagesHelpers';

type Reaction = 'like' | 'confirm';

export default function Messages() {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchSubject, setSearchSubject] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('messagesSidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }
    loadConversations();
  }, []);

  useEffect(() => {
    localStorage.setItem('messagesSidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
      markConversationAsRead(selectedChat);
    }
  }, [selectedChat]);

  const loadConversations = async () => {
    setLoading(true);
    const convos = await fetchConversations();
    setConversations(convos);
    if (convos.length > 0 && !selectedChat) {
      setSelectedChat(convos[0].id);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const msgs = await fetchMessages(conversationId);
    setCurrentMessages(msgs);
  };

  const filteredConversations = conversations.filter((conv) => {
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
      'Matematică': 'bg-blue-100 text-blue-700 border-blue-200',
      'Fizică': 'bg-green-100 text-green-700 border-green-200',
      'Literatură': 'bg-purple-100 text-purple-700 border-purple-200',
      'Chimie': 'bg-orange-100 text-orange-700 border-orange-200',
      'Istorie': 'bg-red-100 text-red-700 border-red-200',
      'General': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[subject] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleReaction = async (messageId: string, reaction: Reaction) => {
    const targetMessage = currentMessages.find(m => m.id === messageId);
    if (!targetMessage) return;

    const reactions = targetMessage.reactions || [];
    const hasReaction = reactions.includes(reaction);
    const newReactions = hasReaction
      ? reactions.filter(r => r !== reaction)
      : [...reactions, reaction];

    setCurrentMessages(messages =>
      messages.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: newReactions,
          };
        }
        return msg;
      })
    );

    await updateMessageReactions(messageId, newReactions);
  };

  const handleAIDraftReply = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const lastTeacherMessage = [...currentMessages]
        .reverse()
        .find(msg => !msg.isOwn);

      if (lastTeacherMessage) {
        const aiSuggestion = `Mulțumesc pentru feedback, ${lastTeacherMessage.sender}. Apreciez sprijinul dumneavoastră și voi continua să muncesc din greu pentru a-mi îmbunătăți abilitățile.`;
        setMessage(aiSuggestion);
      }
      setIsGeneratingAI(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || sending) return;

    setSending(true);
    const messageContent = message;
    setMessage('');

    const newMessage = await createMessage(selectedChat, 'Tu', messageContent, true);
    if (newMessage) {
      setCurrentMessages(prev => [...prev, newMessage]);
      await loadConversations();
    }

    setSending(false);
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Ieri';
    } else if (diffDays <= 7) {
      return `Acum ${diffDays} zile`;
    } else {
      return date.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

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
                  Mesaje
                </h1>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`}
                title={isSidebarOpen ? 'Ascunde bara laterală' : 'Extinde bara laterală'}
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
                    placeholder="Caută mesaje..."
                    className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
                  />
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors ${
                      showAdvancedSearch ? 'text-[#164B2E]' : 'text-gray-400'
                    }`}
                    title="Căutare avansată"
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
                      placeholder="Filtrează după materie..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-xs"
                    />
                    <input
                      type="text"
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      placeholder="Filtrează după profesor..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-xs"
                    />
                    <input
                      type="text"
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      placeholder="Filtrează după cuvinte cheie..."
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
                      Șterge filtrele
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
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatRelativeTime(conv.lastMessageTime)}</span>
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
                  <span className="text-sm text-gray-500">Activ acum</span>
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
                            title="Apreciază"
                          >
                            <ThumbsUp className={`w-4 h-4 ${msg.reactions?.includes('like') ? 'text-blue-600 fill-blue-600' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleReaction(msg.id, 'confirm')}
                            className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
                              msg.reactions?.includes('confirm') ? 'bg-green-50' : ''
                            }`}
                            title="Confirmă"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Scrie mesajul tău..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
                disabled={sending}
              />
              <button
                onClick={handleAIDraftReply}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                title="Generează Răspuns cu AI"
              >
                {isGeneratingAI ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Generez...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium text-sm">Generează AI</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="bg-[#164B2E] hover:bg-[#0d2819] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">{sending ? 'Se trimite...' : 'Trimite'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
