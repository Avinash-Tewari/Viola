
'use client'; 

import { useSession, useAgent } from '@livekit/components-react';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';

import {
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useLocalParticipant,
  useTrackTranscription,
} from "@livekit/components-react";

import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import "./voiceAssistant.css";

const Message = ({ type, text }) => {
  return (
    <div className="message">
      <strong className={`message-${type}`}>
        {type === "agent" ? "Agent: " : "You: "}
      </strong>
      <span className="message-text">{text}</span>
    </div>
  );
};



const VoiceAssistant = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();

  // ✅ properly destructure local participant info
  const { localParticipant, microphoneTrack } = useLocalParticipant();

  

  const micPublication = localParticipant?.getTrackPublication(Track.Source.Microphone);
  // ✅ user transcription from microphone
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: micPublication,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const allMessages = [
      ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),
      ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),
    ].sort((a, b) => (a?.firstReceivedTime || 0) - (b?.firstReceivedTime || 0));

    setMessages(allMessages);
  }, [agentTranscriptions, userTranscriptions]); // ✅ correct deps




const TOKEN_SOURCE = TokenSource.endpoint('/api/token');

export function Demo() {
  const { audioTrack, state } = useAgent();

  return (
    <AgentAudioVisualizerBar
      size="lg"
      color={undefined}
      barCount={5}
      state={state}
      audioTrack={audioTrack}
    />
  );
}

export default function DemoWrapper({ session }) {
  const session = useSession(TOKEN_SOURCE);

  return (
    <AgentSessionProvider session={session}>
      <Demo />
    </AgentSessionProvider>
  );
}

  return (
    <div className="voice-assistant-container">
      <div className="visualization-container">
        <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
      </div>

      <div className="control-section">
        <VoiceAssistantControlBar />
        <div className="conversation">
          {messages.map((msg, index) => (
            <Message key={msg.id || index} type={msg.type} text={msg.text} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
