import { useState, useEffect } from 'react';
import { Send, Paperclip, Mic, Sparkles, Lightbulb, BookOpen, Calculator } from 'lucide-react';
import {
  fetchActiveSession,
  fetchSessionMessages,
  fetchQuickActions,
  createSession,
  addMessage,
  type AITutorMode,
  type AITutorSession,
  type AITutorMessage,
  type AITutorQuickAction,
} from '../utils/aiTutorHelpers';

export default function AITutor() {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<AITutorMode>('explain');
  const [session, setSession] = useState<AITutorSession | null>(null);
  const [messages, setMessages] = useState<AITutorMessage[]>([]);
  const [quickActions, setQuickActions] = useState<AITutorQuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const modes = [
    { id: 'explain', label: 'Explică', icon: Lightbulb },
    { id: 'quiz', label: 'Test', icon: BookOpen },
    { id: 'homework', label: 'Ajutor Teme', icon: Calculator },
  ];

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    setLoading(true);
    try {
      const [activeSession, actions] = await Promise.all([
        fetchActiveSession(),
        fetchQuickActions(),
      ]);

      if (activeSession) {
        setSession(activeSession);
        setMode(activeSession.mode);
        const sessionMessages = await fetchSessionMessages(activeSession.id);
        setMessages(sessionMessages);
      } else {
        const newSession = await createSession('explain');
        if (newSession) {
          setSession(newSession);
          const initialMessage = await addMessage(
            newSession.id,
            'ai',
            'Salut! Sunt asistentul tău de învățare AI. Sunt aici pentru a te ajuta să înțelegi conceptele, să te pregătești pentru teste și să-ți completezi temele. Ce ai vrea să explorezi astăzi?',
            undefined,
            actions.slice(0, 3).map((a) => ({
              label: a.label,
              colorScheme: a.colorScheme,
            }))
          );
          if (initialMessage) {
            setMessages([initialMessage]);
          }
        }
      }

      setQuickActions(actions);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (newMode: AITutorMode) => {
    setMode(newMode);
    if (session) {
      const newSession = await createSession(newMode);
      if (newSession) {
        setSession(newSession);
        setMessages([]);
        const initialMessage = await addMessage(
          newSession.id,
          'ai',
          'Salut! Sunt asistentul tău de învățare AI. Sunt aici pentru a te ajuta să înțelegi conceptele, să te pregătești pentru teste și să-ți completezi temele. Ce ai vrea să explorezi astăzi?',
          undefined,
          quickActions.slice(0, 3).map((a) => ({
            label: a.label,
            colorScheme: a.colorScheme,
          }))
        );
        if (initialMessage) {
          setMessages([initialMessage]);
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session || sending) return;

    setSending(true);
    const userMessageContent = message;
    setMessage('');

    try {
      const userMessage = await addMessage(session.id, 'user', userMessageContent);
      if (userMessage) {
        setMessages((prev) => [...prev, userMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleQuickActionClick = async (action: AITutorQuickAction) => {
    if (!session || sending) return;

    setSending(true);
    try {
      const userMessage = await addMessage(session.id, 'user', action.prompt);
      if (userMessage) {
        setMessages((prev) => [...prev, userMessage]);
      }
    } catch (error) {
      console.error('Failed to send quick action:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = (msg: AITutorMessage) => {
    if (msg.messageType === 'progress_notification' && msg.formattedContent?.type === 'progress') {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-900">{msg.formattedContent.title}</p>
              <p className="text-sm text-green-700">{msg.formattedContent.message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (msg.senderType === 'user') {
      return (
        <div className="flex gap-4 justify-end">
          <div className="bg-[#164B2E] text-[#F1F5F9] rounded-2xl rounded-tr-none p-6 shadow-sm max-w-[80%]">
            <p>{msg.content}</p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"></div>
        </div>
      );
    }

    return (
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#F1F5F9]" />
        </div>
        <div className="bg-white rounded-2xl rounded-tl-none p-6 shadow-sm max-w-[80%]">
          {msg.formattedContent?.sections ? (
            <>
              {msg.formattedContent.sections.map((section, idx) => (
                <div key={idx}>
                  {section.type === 'heading' && (
                    <p className="text-gray-900 mb-4 font-semibold">{section.content}</p>
                  )}
                  {section.type === 'paragraph' && (
                    <p className="text-gray-900 mb-4">
                      {section.content}
                      {section.inline_code && (
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-1">
                          {section.inline_code}
                        </span>
                      )}
                    </p>
                  )}
                  {section.type === 'info_box' && (
                    <div className={`bg-${section.color || 'blue'}-50 border border-${section.color || 'blue'}-200 rounded-xl p-4 mb-4`}>
                      {section.title && (
                        <p className={`text-sm font-semibold text-${section.color || 'blue'}-900 mb-2`}>
                          {section.title}
                        </p>
                      )}
                      {section.items && (
                        <ul className={`text-sm text-${section.color || 'blue'}-800 space-y-1`}>
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx}>• {item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {msg.formattedContent.actions && (
                <div className="flex gap-2">
                  {msg.formattedContent.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        action.style === 'primary'
                          ? 'bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9]'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-900 mb-4">{msg.content}</p>
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const fullAction = quickActions.find((qa) => qa.label === action.label);
                        if (fullAction) {
                          handleQuickActionClick(fullAction);
                        }
                      }}
                      className={`bg-${action.colorScheme}-50 hover:bg-${action.colorScheme}-100 text-${action.colorScheme}-700 px-3 py-2 rounded-lg text-sm transition-colors`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
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
      <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-[#F1F5F9]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F1F5F9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Asistent Învățare AI
                </h1>
                <p className="text-[#F1F5F9]/70 text-sm">Mentorul tău personal, disponibil 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[#F1F5F9] text-sm font-medium">Activ</span>
            </div>
          </div>

          <div className="flex gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id as AITutorMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    mode === m.id
                      ? 'bg-white text-[#164B2E] shadow-lg'
                      : 'bg-white/10 text-[#F1F5F9] hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id}>{renderMessage(msg)}</div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
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
                placeholder="Întreabă-mă orice despre studiile tale..."
                className="flex-1 px-6 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="bg-[#164B2E] hover:bg-[#0d2819] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Trimite</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
