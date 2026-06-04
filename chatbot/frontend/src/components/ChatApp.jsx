import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ChatApp() {
  const { user, logout } = useAuth();
  
  // Dashboard & State management
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // UI States
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rename States
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  // Copy Feedback State
  const [copyFeedback, setCopyFeedback] = useState({}); // { [index]: boolean }

  // Refs
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);

  // Fetch initial chat list
  const fetchChats = async (selectFirst = false) => {
    try {
      const data = await api.getChats();
      setChats(data);
      if (data.length > 0) {
        if (selectFirst && !activeChatId) {
          setActiveChatId(data[0].id);
        }
      } else {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats(true);
  }, []);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await api.getMessages(activeChatId);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage]);

  // Focus rename input when activated
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  // Create new chat
  const handleNewChat = async () => {
    try {
      const newChat = await api.createChat('New Chat');
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setSidebarOpen(false); // Close drawer on mobile
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    let chatId = activeChatId;

    setSendingMessage(true);
    if (!textToSend) setInputValue('');

    try {
      // 1. If there's no active chat, create one first
      if (!chatId) {
        const newChat = await api.createChat(text.slice(0, 30) || 'New Chat');
        chatId = newChat.id;
        setActiveChatId(chatId);
        // Optimistically add chat to listing
        setChats((prev) => [newChat, ...prev]);
      }

      // 2. Add user message optimistically to UI
      const tempUserMsg = {
        id: 'temp-user-id-' + Date.now(),
        chat_id: chatId,
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // 3. Send to API
      const response = await api.sendMessage(chatId, text);

      // 4. Update messages with formal DB entries
      setMessages((prev) => {
        // Remove temp message and append actual messages
        const filtered = prev.filter((m) => !m.id.startsWith('temp-user-id-'));
        return [...filtered, response.userMessage, response.aiMessage];
      });

      // 5. Refresh chat list (titles might have updated if it was "New Chat")
      fetchChats();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove temp message and show error alert
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-user-id-')));
      alert('Error sending message: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Inline Rename trigger
  const startRename = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditTitleValue(currentTitle);
  };

  const submitRename = async (chatId) => {
    if (!editTitleValue.trim() || editTitleValue === chats.find(c => c.id === chatId)?.title) {
      setEditingChatId(null);
      return;
    }

    // Optimistic update
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: editTitleValue.trim() } : c))
    );
    setEditingChatId(null);

    try {
      await api.renameChat(chatId, editTitleValue.trim());
    } catch (err) {
      console.error('Failed to rename chat:', err);
      fetchChats(); // Rollback
    }
  };

  const handleRenameKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
      submitRename(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  // Delete chat trigger
  const openDeleteModal = (e, chat) => {
    e.stopPropagation(); // Avoid selecting the chat
    setChatToDelete(chat);
    setDeleteModalOpen(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    const targetId = chatToDelete.id;

    // Close modal
    setDeleteModalOpen(false);
    setChatToDelete(null);

    // Optimistic update
    setChats((prev) => prev.filter((c) => c.id !== targetId));
    if (activeChatId === targetId) {
      setActiveChatId(null);
      setMessages([]);
    }

    try {
      await api.deleteChat(targetId);
      fetchChats(); // Sync with server
    } catch (err) {
      console.error('Failed to delete chat:', err);
      fetchChats(); // Rollback
    }
  };

  // Clipboard copy handler
  const handleCopyCode = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyFeedback((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  // Message body parser for code blocks & inline styles
  const parseMessageContent = (content) => {
    const parts = [];
    const regex = /```(\w*)\n([\s\S]*?)(?:```|$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2].trim(),
      });
      lastIndex = regex.lastIndex;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }

    if (parts.length === 0 && content) {
      parts.push({ type: 'text', content });
    }

    return parts;
  };

  const parseInlineStyles = (text) => {
    if (!text) return '';

    let tokens = [{ type: 'text', value: text }];

    // 1. Process links: [text](url)
    tokens = tokens.flatMap((token) => {
      if (token.type !== 'text') return token;
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const newParts = [];
      let lastIdx = 0;
      let match;
      while ((match = linkRegex.exec(token.value)) !== null) {
        if (match.index > lastIdx) {
          newParts.push({ type: 'text', value: token.value.substring(lastIdx, match.index) });
        }
        newParts.push({ type: 'link', text: match[1], url: match[2] });
        lastIdx = linkRegex.lastIndex;
      }
      if (lastIdx < token.value.length) {
        newParts.push({ type: 'text', value: token.value.substring(lastIdx) });
      }
      return newParts.length > 0 ? newParts : token;
    });

    // 2. Process inline code: `code`
    tokens = tokens.flatMap((token) => {
      if (token.type !== 'text') return token;
      const parts = token.value.split(/`([^`]+)`/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return { type: 'code', value: part };
        }
        return { type: 'text', value: part };
      });
    });

    // 3. Process bold: **text**
    tokens = tokens.flatMap((token) => {
      if (token.type !== 'text') return token;
      const parts = token.value.split(/\*\*([^*]+)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return { type: 'bold', value: part };
        }
        return { type: 'text', value: part };
      });
    });

    // 4. Process bold: __text__
    tokens = tokens.flatMap((token) => {
      if (token.type !== 'text') return token;
      const parts = token.value.split(/__([^_]+)__/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return { type: 'bold', value: part };
        }
        return { type: 'text', value: part };
      });
    });

    // 5. Process italics: *text*
    tokens = tokens.flatMap((token) => {
      if (token.type !== 'text') return token;
      const parts = token.value.split(/\*([^*]+)\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return { type: 'italic', value: part };
        }
        return { type: 'text', value: part };
      });
    });

    // 6. Process italics: _text_
    tokens = tokens.flatMap((token) => {
      if (token.type !== 'text') return token;
      const parts = token.value.split(/_([^_]+)_/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return { type: 'italic', value: part };
        }
        return { type: 'text', value: part };
      });
    });

    return tokens.map((token, idx) => {
      switch (token.type) {
        case 'code':
          return <code key={idx}>{token.value}</code>;
        case 'bold':
          return <strong key={idx}>{parseInlineStyles(token.value)}</strong>;
        case 'italic':
          return <em key={idx}>{parseInlineStyles(token.value)}</em>;
        case 'link':
          return (
            <a
              key={idx}
              href={token.url}
              target="_blank"
              rel="noopener noreferrer"
              className="markdown-link"
            >
              {parseInlineStyles(token.text)}
            </a>
          );
        default:
          return token.value;
      }
    });
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const blocks = [];
    let currentBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Empty lines
      if (trimmed === '') {
        // Only flush paragraphs on empty lines. Keep lists (ul, ol) open so consecutive items are grouped.
        if (currentBlock && currentBlock.type === 'paragraph') {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        continue;
      }

      // 2. Headers
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        blocks.push({
          type: 'header',
          level: headerMatch[1].length,
          text: headerMatch[2],
        });
        currentBlock = null;
        continue;
      }

      // 3. Blockquotes
      if (trimmed.startsWith('>')) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        const content = trimmed.substring(1).trim();
        blocks.push({
          type: 'blockquote',
          text: content,
        });
        currentBlock = null;
        continue;
      }

      // 4. Horizontal Rules
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        blocks.push({ type: 'hr' });
        currentBlock = null;
        continue;
      }

      // 5. Unordered List Items
      const ulMatch = line.match(/^(\s*)([*+-])\s+(.*)$/);
      if (ulMatch) {
        const content = ulMatch[3];
        if (currentBlock && currentBlock.type === 'ul') {
          currentBlock.items.push(content);
        } else {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { type: 'ul', items: [content] };
        }
        continue;
      }

      // 6. Ordered List Items
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (olMatch) {
        const num = parseInt(olMatch[2], 10);
        const content = olMatch[3];
        if (currentBlock && currentBlock.type === 'ol') {
          currentBlock.items.push({ num, content });
        } else {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { type: 'ol', items: [{ num, content }] };
        }
        continue;
      }

      // 7. Regular paragraph lines
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'paragraph', lines: [line] };
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks.map((block, index) => {
      switch (block.type) {
        case 'header': {
          const HeaderTag = `h${block.level}`;
          return (
            <HeaderTag key={index} className={`markdown-header markdown-h${block.level}`}>
              {parseInlineStyles(block.text)}
            </HeaderTag>
          );
        }
        case 'blockquote':
          return (
            <blockquote key={index} className="markdown-blockquote">
              {parseInlineStyles(block.text)}
            </blockquote>
          );
        case 'ul':
          return (
            <ul key={index} className="markdown-list-ul">
              {block.items.map((item, idx) => (
                <li key={idx}>{parseInlineStyles(item)}</li>
              ))}
            </ul>
          );
        case 'ol':
          return (
            <ol key={index} className="markdown-list-ol">
              {block.items.map((item, idx) => (
                <li key={idx} value={item.num}>
                  {parseInlineStyles(item.content)}
                </li>
              ))}
            </ol>
          );
        case 'hr':
          return <hr key={index} className="markdown-hr" />;
        case 'paragraph':
          const paragraphText = block.lines.join(' ');
          return (
            <p key={index} className="markdown-paragraph">
              {parseInlineStyles(paragraphText)}
            </p>
          );
        default:
          return null;
      }
    });
  };

  // Suggestions templates
  const suggestions = [
    {
      title: 'Explain recursion',
      subtitle: 'using a simple real-world analogy.',
      prompt: 'Can you explain recursion to me? Please use a simple real-world analogy so a beginner can understand.',
    },
    {
      title: 'Draft an email',
      subtitle: 'requesting internship feedback.',
      prompt: 'Draft a polite and professional email to my summer internship supervisor requesting feedback on my performance.',
    },
    {
      title: 'SQL Query Debugger',
      subtitle: 'find optimization problems.',
      prompt: 'Here is a SQL query. Please review it for speed bottlenecks or optimization errors: SELECT users.name, count(orders.id) FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = "pending" GROUP BY users.name;',
    },
    {
      title: 'JavaScript Promise',
      subtitle: 'write a clean async example.',
      prompt: 'Could you write a simple, well-commented JavaScript example demonstrating how to run two API fetches in parallel using Promise.all?',
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="dashboard">
      {/* Mobile Sidebar drawer backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar component */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-dot"></span>
            <span className="logo-text">AI Assistant</span>
          </div>
          {/* Mobile close toggle */}
          <button className="btn-sidebar-toggle" onClick={() => setSidebarOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="sidebar-action-container">
          <button className="btn-new-chat" onClick={handleNewChat}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="chats-list-container">
          {loadingChats ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)' }}></div>
            </div>
          ) : chats.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '20px' }}>
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setSidebarOpen(false); // Close drawer on mobile
                }}
              >
                <div className="chat-item-left">
                  <svg className="chat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  
                  {editingChatId === chat.id ? (
                    <input
                      ref={editInputRef}
                      className="chat-title-input"
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      onBlur={() => submitRename(chat.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
                      onClick={(e) => e.stopPropagation()} // Avoid selecting chat
                    />
                  ) : (
                    <span className="chat-title-text">{chat.title}</span>
                  )}
                </div>

                {editingChatId !== chat.id && (
                  <div className="chat-actions">
                    <button
                      className="chat-action-btn"
                      title="Rename Chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(chat.id, chat.title);
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button
                      className="chat-action-btn delete"
                      title="Delete Chat"
                      onClick={(e) => openDeleteModal(e, chat)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* User profile footer */}
        <div className="sidebar-profile">
          <div className="profile-info">
            <div className="profile-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="profile-details">
              <div className="profile-name">{user?.name || 'User Account'}</div>
              <div className="profile-email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="btn-logout" title="Log Out" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* Main chat interface */}
      <main className="chat-panel">
        <header className="chat-header">
          {/* Hamburger toggle */}
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h2 className="chat-header-title">
            {activeChat ? activeChat.title : 'AI Chatbot Dashboard'}
          </h2>
          <div style={{ width: '24px' }}></div> {/* Empty spacer for header layout symmetry */}
        </header>

        {/* Chat message listing or Suggestions empty state */}
        {activeChatId === null || (messages.length === 0 && !loadingMessages && !sendingMessage) ? (
          <div className="empty-state animated-fadeIn">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h1 className="empty-state-title">Welcome, {user?.name || 'Friend'}!</h1>
            <p className="empty-state-subtitle">
              Ask me questions, draft documents, outline code concepts, or simply have a quick chat. Select a template below to get started.
            </p>

            <div className="suggestions-grid">
              {suggestions.map((s, index) => (
                <div
                  key={index}
                  className="suggestion-card"
                  onClick={() => handleSendMessage(s.prompt)}
                >
                  <div className="suggestion-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    {s.title}
                  </div>
                  <div className="suggestion-text">{s.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {loadingMessages ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(255,255,255,0.05)', borderTopColor: 'var(--accent-primary)' }}></div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={msg.id} className={`message-bubble-wrapper ${msg.role}`}>
                  <div className={`message-bubble ${msg.role}`}>
                    {/* Render message body with split parts */}
                    {parseMessageContent(msg.content).map((part, partIdx) => {
                      if (part.type === 'code') {
                        const copyKey = `${msg.id}-${partIdx}`;
                        return (
                          <div key={partIdx} className="code-block-container">
                            <div className="code-block-header">
                              <span>{part.language.toUpperCase()}</span>
                              <button
                                className="code-block-copy-btn"
                                onClick={() => handleCopyCode(part.content, copyKey)}
                              >
                                {copyFeedback[copyKey] ? 'Copied!' : 'Copy Code'}
                              </button>
                            </div>
                            <pre className="code-block-pre">
                              <code>{part.content}</code>
                            </pre>
                          </div>
                        );
                      }
                      return <React.Fragment key={partIdx}>{renderMarkdown(part.content)}</React.Fragment>;
                    })}
                  </div>
                </div>
              ))
            )}

            {/* AI Generation Loading Indicator */}
            {sendingMessage && (
              <div className="message-bubble-wrapper model">
                <div className="message-bubble model">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Form message inputs */}
        <div className="chat-input-container">
          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <textarea
              className="chat-input"
              rows="1"
              placeholder={activeChatId ? "Send a message..." : "Type here to create a new chat..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendingMessage}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={!inputValue.trim() || sendingMessage}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Delete Conversation</h3>
            <p className="modal-description">
              Are you sure you want to delete "<strong>{chatToDelete?.title}</strong>"? This action is permanent and cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                style={{ padding: '10px 16px', fontSize: '14px', borderRadius: '8px' }}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setChatToDelete(null);
                }}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDeleteChat}>
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
