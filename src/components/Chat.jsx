import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { useChatContext } from '../contexts/ChatContext';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Custom styles for scrollbar and animations
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #ec4899, #8b5cf6);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #db2777, #7c3aed);
  }
  
  .chat-fade-in {
    animation: fadeInUp 0.5s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .pulse-ring {
    animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
  }
  
  @keyframes pulseRing {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    80%, 100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
  
  .unread-glow {
    animation: unreadGlow 2s ease-in-out infinite alternate;
  }
  
  @keyframes unreadGlow {
    from {
      box-shadow: 0 0 5px rgba(239, 68, 68, 0.4);
    }
    to {
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4);
    }
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}

const ChatComponent = () => {
  const location = useLocation();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // Use shared chat client from context
  const { chatClient: client, isInitialized, usersWithUnreadMessages } = useChatContext();

  // Function to create or get a direct message channel
  const createDirectChannel = async (otherUser) => {
    if (!client) {
      console.error('Chat client not initialized');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating/selecting direct channel with user:', otherUser);

      // Sort IDs to ensure consistent channel ID
      const members = [client.userID, otherUser._id].sort();
      const channelId = `dm-${members.join('-')}`;

      // Try to query for an existing channel first
      const existing = await client.queryChannels({
        id: { $eq: channelId },
        type: 'messaging',
      });

      let directChannel;
      if (existing && existing.length > 0) {
        directChannel = existing[0];
        await directChannel.watch();
        console.log('Found existing direct channel:', channelId);
      } else {
        // Get the correct profile image
        const userImage = otherUser.flatmateProfile?.photoUrl || 
                         otherUser.profileImage || 
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name || 'User')}&background=F472B6&color=fff&size=64`;
        directChannel = client.channel('messaging', channelId, {
          members,
          name: otherUser.name,
          image: userImage,
        });
        await directChannel.watch();
        console.log('Created new direct channel:', channelId);
      }

      setChannel(directChannel);
      setActiveChat(otherUser);
      setLoading(false);

      // Mark channel as read when opened
      try {
        await directChannel.markRead();
        console.log('Marked direct channel as read');
      } catch (err) {
        console.warn('Failed to mark channel as read:', err);
      }
    } catch (error) {
      console.error('Error creating/selecting direct channel:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Function to refresh connected users
  const refreshConnectedUsers = async (userId) => {
    try {
      // Get user data for authentication
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('No user email found in localStorage');
        return;
      }

      console.log('Fetching connected users for email:', userEmail);
      
      // Use the same API endpoint as the profile page to ensure consistency
      // Add cache busting to ensure fresh data
      const connectionsResponse = await fetch(`/api/user/connections?email=${encodeURIComponent(userEmail)}&_t=${Date.now()}`);
      
      if (!connectionsResponse.ok) {
        const errorText = await connectionsResponse.text();
        console.error('Failed to fetch connected users:', connectionsResponse.status, errorText);
        throw new Error(`Failed to fetch connected users: ${connectionsResponse.status}`);
      }
      
      const { connections } = await connectionsResponse.json();
      console.log('Successfully fetched connected users from profile API:', connections);
      
      // Filter out any invalid connections (same as profile page does)
      const validConnections = connections.filter(
        (c) => c && c.email && c.name && c.email.includes('@') && c.name.length > 0
      );
      
      console.log('Valid connections after filtering:', validConnections);
      
      // Transform the data to match the expected format for chat
      const connectedUsers = validConnections.map(conn => ({
        _id: conn._id,
        name: conn.name,
        email: conn.email,
        profilePicture: conn.flatmateProfile?.photoUrl || conn.profileImage || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.name || 'User')}&background=4f46e5&color=fff&size=128`,
        flatmateProfile: conn.flatmateProfile
      }));
      
      console.log('Transformed connected users for chat:', connectedUsers.map(u => ({ id: u._id, name: u.name, email: u.email })));
      
      // Create all connected users in Stream Chat via backend
      if (connectedUsers.length > 0) {
        try {
          const userIds = connectedUsers.map(u => u._id);
          const userResponse = await fetch(`/api/user/by-email/${encodeURIComponent(userEmail)}`);
          const { user } = await userResponse.json();
          
          await fetch('/api/chat/create-users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user': JSON.stringify(user)
            },
            body: JSON.stringify({ userIds })
          });
          console.log('Created connected users in Stream Chat');
        } catch (err) {
          console.warn('Failed to create users in Stream Chat:', err);
        }
      }
      
      setConnectedUsers(connectedUsers);
    } catch (error) {
      console.error('Error fetching connected users:', error);
      setConnectedUsers([]); // Set empty array on error to show proper UI
    }
  };
  // Update loading state based on context initialization
  useEffect(() => {
    if (isInitialized && client) {
      setLoading(false);
      refreshConnectedUsers();
    } else if (!isInitialized) {
      setLoading(true);
    }
  }, [isInitialized, client]);

  // React to navigation state changes to open direct chat with a user
  useEffect(() => {
    if (!client || !isInitialized) return;
    const startChatWith = location.state?.startChatWith;
    if (startChatWith) {
      console.log('Auto-starting chat with user (navigation state changed):', startChatWith);
      window.history.replaceState({}, document.title);
      setTimeout(() => {
        createDirectChannel(startChatWith);
      }, 300); // Shorter delay since client is ready
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.startChatWith, client, isInitialized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 absolute top-0"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Loading chat...</div>
          <div className="text-sm text-gray-500">Connecting you with your flatmates</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <div className="text-red-500 text-4xl">⚠️</div>
          </div>
          <div className="text-2xl font-bold text-red-600 mb-4">Chat Unavailable</div>
          <div className="text-gray-600 mb-6 leading-relaxed">{error}</div>
          {error.includes('API key') && (
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl mb-6 border-l-4 border-blue-400">
              <p className="font-semibold mb-2">💡 To enable chat functionality:</p>
              <ol className="list-decimal list-inside text-left space-y-1">
                <li>Sign up for a free Stream Chat account</li>
                <li>Get your API key from the dashboard</li>
                <li>Add VITE_STREAM_API_KEY to your .env file</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-blue-500 text-2xl">💬</div>
          </div>
          <div className="text-xl font-semibold text-gray-700">Initializing chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 chat-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-pink-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">💬</span>
                </div>
                <div className="absolute inset-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl pulse-ring"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  FlatScout Chat
                </h1>
                <p className="text-sm text-gray-500">Connect with your flatmates instantly</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Online</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chat client={client} theme="messaging light">
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-pink-100 flex flex-col bg-white/50 backdrop-blur-sm">
            {/* Connected Users Section */}
            <div className="p-6 border-b border-pink-100 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">👥</span>
                  </span>
                  <span>Connected Users</span>
                  <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 text-xs px-2 py-1 rounded-full font-semibold">
                    {connectedUsers.length}
                  </span>
                </h3>
                <button
                  onClick={() => {
                    const userEmail = localStorage.getItem('userEmail');
                    if (userEmail) {
                      refreshConnectedUsers();
                    }
                  }}
                  className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 rounded-xl hover:from-pink-200 hover:to-purple-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                  title="Refresh connected users"
                >
                  🔄
                </button>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {connectedUsers
                  .sort((a, b) => {
                    // Sort users with unread messages to the top
                    const aHasUnread = usersWithUnreadMessages?.has(a._id);
                    const bHasUnread = usersWithUnreadMessages?.has(b._id);
                    if (aHasUnread && !bHasUnread) return -1;
                    if (!aHasUnread && bHasUnread) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map(user => {
                  const hasUnreadMessages = usersWithUnreadMessages?.has(user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => createDirectChannel(user)}
                      className={`p-4 rounded-xl cursor-pointer flex items-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeChat?._id === user._id 
                          ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 shadow-lg' 
                          : hasUnreadMessages
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 shadow-md hover:shadow-lg unread-glow'
                          : 'hover:bg-white hover:shadow-md border-2 border-transparent'
                      }`}
                    >
                      {hasUnreadMessages && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                      <div className="relative">
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className={`w-12 h-12 rounded-full object-cover border-2 shadow-md ${
                            hasUnreadMessages ? 'border-red-300' : 'border-white'
                          }`}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=F472B6&color=fff&size=128`;
                          }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          hasUnreadMessages ? 'bg-red-400' : 'bg-green-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold truncate block ${
                            hasUnreadMessages ? 'text-red-800' : 'text-gray-800'
                          }`}>
                            {user.name}
                          </span>
                          {hasUnreadMessages && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 truncate block">
                          {user.email}
                        </span>
                      </div>
                      <div className={`${hasUnreadMessages ? 'text-red-500' : 'text-pink-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
                {connectedUsers.length === 0 && (
                  <div className="text-center p-8 bg-white/60 rounded-xl border-2 border-dashed border-pink-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">💭</span>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">No connections yet</p>
                    <p className="text-xs text-gray-500">Connect with flatmates to start chatting!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Chats Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 border-b border-pink-100 bg-white/80 backdrop-blur-sm">
                <h3 className="font-bold text-gray-800 text-lg flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </span>
                  <span>Recent Chats</span>
                </h3>
              </div>
              <div className="p-3">
                <ChannelList
                  filters={{
                    type: 'messaging',
                    members: { $in: [client.userID] }
                  }}
                  sort={{ last_message_at: -1 }}
                  options={{ state: true, presence: true, limit: 10 }}
                  List={({ loadedChannels }) => (
                    <div className="space-y-2">
                      {loadedChannels?.length === 0 ? (
                        <div className="p-6 text-center bg-white/60 rounded-xl border-2 border-dashed border-purple-200">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                          <p className="font-semibold text-gray-700">No conversations yet</p>
                          <p className="text-xs text-gray-500 mt-1">Start chatting with your connections!</p>
                        </div>
                      ) : (
                        loadedChannels?.map(ch => {
                          const channelUnreadCount = ch.countUnread ? ch.countUnread() : 0;
                          const isUnread = channelUnreadCount > 0;
                          return (
                            <div
                              key={ch.id}
                              onClick={async () => {
                                setChannel(ch);
                                setActiveChat(null);
                                
                                // Mark channel as read when opened
                                try {
                                  await ch.markRead();
                                  console.log('Marked recent chat as read');
                                } catch (err) {
                                  console.warn('Failed to mark channel as read:', err);
                                }
                              }}
                              className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 transform hover:scale-[1.01] relative ${
                                ch.id === channel?.id 
                                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-lg' 
                                  : isUnread
                                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-md hover:shadow-lg'
                                  : 'hover:bg-white hover:shadow-md border-transparent bg-white/40'
                              }`}
                            >
                              {isUnread && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                              )}
                              <div className={`font-semibold text-sm truncate flex items-center justify-between ${
                                isUnread ? 'text-red-800' : 'text-gray-800'
                              }`}>
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${isUnread ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                  <span>{ch.data.name}</span>
                                </div>
                                {isUnread && (
                                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                    {channelUnreadCount > 9 ? '9+' : channelUnreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 truncate mt-1">
                                {ch.state.messages[ch.state.messages.length - 1]?.text || 'No messages yet'}
                              </div>
                              {ch.state.messages[ch.state.messages.length - 1] && (
                                <div className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{new Date(ch.state.messages[ch.state.messages.length - 1].created_at).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white/30 backdrop-blur-sm">
            {channel ? (
              <Channel channel={channel}>
                <Window>
                  <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100">
                    <ChannelHeader />
                  </div>
                  <div className="flex-1 bg-gradient-to-b from-white/50 to-pink-50/30">
                    <MessageList />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border-t border-pink-100">
                    <MessageInput />
                  </div>
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-12 bg-white/60 rounded-3xl backdrop-blur-sm border border-pink-100 shadow-xl max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl text-white">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to Chat
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Select a connected user from the sidebar to start a conversation and connect with your flatmates!
                  </p>
                  <div className="mt-6 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Chat>
    </div>
  );
};

export default ChatComponent;
