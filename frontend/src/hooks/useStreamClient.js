import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

// Gets stream auth token from backend, Creates video client, Joins video call,
// Creates chat client, Connects to chat channel, Cleans everything up on unmount
function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  // Keep latest instances across renders
  const videoCallRef = useRef(null);
  const chatClientRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const initCall = async () => {
      if (!session?.callId) {
        setIsInitializingCall(false);
        return;
      }

      if (!isHost && !isParticipant) {
        setIsInitializingCall(false);
        return;
      }

      if (session.status === "completed") {
        setIsInitializingCall(false);
        return;
      }

      try {
        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (cancelled) return;

        setStreamClient(client);

        const videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });

        if (cancelled) {
          await videoCall.leave().catch(() => {});
          return;
        }

        videoCallRef.current = videoCall;
        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;

        const chat = StreamChat.getInstance(apiKey);

        await chat.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (cancelled) {
          await chat.disconnectUser().catch(() => {});
          return;
        }

        chatClientRef.current = chat;
        setChatClient(chat);

        const chatChannel = chat.channel("messaging", session.callId);
        await chatChannel.watch();

        if (cancelled) return;

        setChannel(chatChannel);
      } catch (error) {
        console.error("Error initializing call:", error);
        toast.error("Failed to join video call");
      } finally {
        if (!cancelled) {
          setIsInitializingCall(false);
        }
      }
    };

    if (session && !loadingSession) {
      initCall();
    }

    return () => {
      cancelled = true;

      (async () => {
        try {
          if (videoCallRef.current) {
            try {
              await videoCallRef.current.leave();
            } catch (err) {
              // Ignore if already left
              if (
                !err.message?.includes("already been left")
              ) {
                console.error("Error leaving call:", err);
              }
            }

            videoCallRef.current = null;
          }

          if (chatClientRef.current) {
            await chatClientRef.current.disconnectUser().catch(() => {});
            chatClientRef.current = null;
          }

          await disconnectStreamClient().catch(() => {});
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;