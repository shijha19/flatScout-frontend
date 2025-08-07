import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatClient, setChatClient] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [usersWithUnreadMessages, setUsersWithUnreadMessages] = useState(new Set());

  // Initialize chat client and set up unread count tracking
  useEffect(() => {
    let mounted = true;

    const initializeChatClient = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const userLoggedIn = localStorage.getItem('userLoggedIn');

        if (!userEmail || !userLoggedIn) {
          return;
        }

        const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
        if (!STREAM_API_KEY || STREAM_API_KEY === 'your-stream-api-key') {
          console.warn('Stream Chat API key not configured');
          return;
        }

        // Get user data
        const userResponse = await fetch(`/api/user/by-email/${encodeURIComponent(userEmail)}`);
        if (!userResponse.ok) return;

        const { user } = await userResponse.json();
        if (!user || !mounted) return;

        // Get chat token
        const tokenResponse = await fetch('/api/chat/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user': JSON.stringify(user)
          },
          body: JSON.stringify({ userId: user._id })
        });

        if (!tokenResponse.ok || !mounted) return;

        const { token } = await tokenResponse.json();

        // Initialize Stream Chat client
        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        await client.connectUser(
          {
            id: user._id,
            name: user.name || 'Anonymous',
            image: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`,
          },
          token
        );

        if (!mounted) {
          await client.disconnectUser();
          return;
        }

        setChatClient(client);
        setIsInitialized(true);

        // Set up unread count tracking
        const updateUnreadCount = async () => {
          try {
            // Get all channels where the user is a member
            const channels = await client.queryChannels({
              type: 'messaging',
              members: { $in: [user._id] }
            }, { last_message_at: -1 });

            // Calculate total unread count and track users with unread messages
            let totalUnread = 0;
            const usersWithUnread = new Set();
            
            channels.forEach(channel => {
              // Use the channel state unread count
              let channelUnreadCount = 0;
              if (channel.state && channel.state.unreadCount) {
                channelUnreadCount = channel.state.unreadCount;
              } else {
                // Fallback to countUnread method
                channelUnreadCount = channel.countUnread();
              }
              
              totalUnread += channelUnreadCount;
              
              // If this channel has unread messages, identify the other user
              if (channelUnreadCount > 0) {
                const otherMembers = Object.values(channel.state.members || {}).filter(member => member.user?.id !== user._id);
                otherMembers.forEach(member => {
                  if (member.user?.id) {
                    usersWithUnread.add(member.user.id);
                  }
                });
              }
            });

            setUnreadCount(totalUnread);
            setUsersWithUnreadMessages(usersWithUnread);
          } catch (error) {
            console.error('Error updating unread count:', error);
          }
        };

        // Initial count
        updateUnreadCount();

        // Listen for new messages
        const handleNewMessage = (event) => {
          // Only update if it's not from the current user
          if (event.message?.user?.id !== user._id) {
            updateUnreadCount();
            
            // Play notification sound (optional)
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSqGxfLZiDYIG2Gz7+OZSA0NR6fw8elNFQ==');
              audio.volume = 0.3;
              audio.play().catch(console.error);
            } catch (err) {
              // Silent fail - notification sound is not critical
            }
          }
        };

        // Listen for message read events
        const handleMessageRead = () => {
          updateUnreadCount();
        };

        // Listen for channel updated events (when unread count changes)
        const handleChannelUpdated = () => {
          updateUnreadCount();
        };

        // Set up event listeners
        client.on('message.new', handleNewMessage);
        client.on('message.read', handleMessageRead);
        client.on('channel.updated', handleChannelUpdated);

        // Cleanup function
        return () => {
          client.off('message.new', handleNewMessage);
          client.off('message.read', handleMessageRead);
          client.off('channel.updated', handleChannelUpdated);
        };

      } catch (error) {
        console.error('Error initializing chat client:', error);
      }
    };

    initializeChatClient();

    return () => {
      mounted = false;
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, []);

  // Reset when user logs out
  useEffect(() => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    if (!userLoggedIn && isInitialized) {
      setUnreadCount(0);
      setUsersWithUnreadMessages(new Set());
      setChatClient(null);
      setIsInitialized(false);
    }
  }, [isInitialized]);

  const value = {
    unreadCount,
    chatClient,
    isInitialized,
    usersWithUnreadMessages,
    markAsRead: (channelId) => {
      // This function can be called when a channel is opened to mark messages as read
      if (chatClient) {
        const channel = chatClient.channel('messaging', channelId);
        channel.markRead().catch(console.error);
      }
    }
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
