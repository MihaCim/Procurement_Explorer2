import React from 'react';
import { useParams } from 'react-router-dom';

import AgenticFeedback from '../components/dueDiligence/AgenticFeedback';
import RiskProfile from '../components/dueDiligence/RiskProfile';
import { WebSocketProvider } from '../context/WebSocketContext';

const AgenticDD: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>No ID</div>;

  return (
    <WebSocketProvider id={id}>
      <div className="flex flex-col items-center mt-6">
        <h1 className="text-2xl font-bold mb-4">AgenticDD</h1>
        <p className="text-lg">WebSocket ID: {id}</p>
        <div className="flex self-stretch flex-col gap-2">
          <AgenticFeedback />
          <RiskProfile />
        </div>
      </div>
    </WebSocketProvider>
  );
};

export default AgenticDD;
