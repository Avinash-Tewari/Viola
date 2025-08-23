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
