import React, { useState } from 'react';
import ChatComponent from '../components/Chat';
// import DebugConnections from '../components/DebugConnections';
import Layout from '../components/Layout';

const ChatPage = () => {
  // const [showDebug, setShowDebug] = useState(false);

  return (
    <Layout>
      <div>
        {/* Debug button and DebugConnections removed */}
        
        <ChatComponent />
      </div>
    </Layout>
  );
};

export default ChatPage;
