import React, { useState, useEffect, useRef } from 'react';
import DailyJs from '@daily-co/daily-js';

function App() {
  const [callObject, setCallObject] = useState(null);
  const [participants, setParticipants] = useState({});
  const [error, setError] = useState(null);
  const videoRefs = useRef({});
  const audioRefs = useRef({});

  useEffect(() => {
    return () => {
      if (callObject) {
        callObject.destroy();
      }
    };
  }, [callObject]);

  const subscribeToRoom = async (roomId) => {
    try {
      if (callObject) {
        callObject.destroy();
      }

      setError(null);

      // Create a new call object
      const daily = DailyJs.createCallObject({
        audioSource: true,
        videoSource: true,
        subscribeToTracksAutomatically: false,
      });

      // Set up event handlers
      daily.on('joined-meeting', handleJoinedMeeting);
      daily.on('participant-joined', handleParticipantJoined);
      daily.on('participant-left', handleParticipantLeft);
      daily.on('participant-updated', handleParticipantUpdated);
      daily.on('error', handleError);
      daily.on('track-started', handleTrackStarted);
      daily.on('track-stopped', handleTrackStopped);

      // Join the room
      await daily.join({
        url: `https://tavus.daily.co/${roomId}`,
        userName: "Local" // Specify the name of the joining participant
      });

      setCallObject(daily);

      // Add a delay before checking for participants
      setTimeout(() => {
        checkForExistingParticipant(daily);
      }, 1500);

    } catch (err) {
      console.error('Error subscribing to room:', err);
      setError(err.message || 'Failed to subscribe to the room');
    }
  };

  const handleTrackStarted = (event) => {
    console.log('Track started:', event);
    const { participant, track } = event;
    
    if (!participant.local) {
      console.log('Handling non-local participant track:', track);
      handleParticipantTrack(participant, track);
    }
  };

  const handleTrackStopped = (event) => {
    console.log('Track stopped:', event);
  };

  const handleParticipantTrack = (participant, track) => {
    console.log('Handling track for participant:', participant.user_id, track);
    
    if (!track) {
      console.log('No track provided');
      return;
    }

    if (track.kind === 'video') {
      const videoElement = document.getElementById('participant-video');
      if (videoElement) {
        const videoStream = new MediaStream([track]);
        videoElement.srcObject = videoStream;
        videoElement.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    } else if (track.kind === 'audio') {
      const audioStream = new MediaStream([track]);
      const audio = new Audio();
      audio.srcObject = audioStream;
      audio.autoplay = true;
    }
  };

  const checkForExistingParticipant = (daily) => {
    if (!daily) {
      console.log('Daily object is null');
      return;
    }

    const participants = daily.participants();
    if (!participants) {
      console.log('No participants available');
      return;
    }

    console.log('Participants:', participants);

    const existingParticipant = Object.values(participants).find(
      (participant) => participant.local === false
    );

    if (existingParticipant) {
      console.log(`Existing participant found: ${existingParticipant.user_id}`);
      
      // Subscribe to the participant's tracks
      daily.updateParticipant(existingParticipant.session_id, {
        setSubscribedTracks: {
          video: true,
          audio: true
        }
      });
    } else {
      console.log('No existing participant found.');
    }
  };

  const handleJoinedMeeting = (event) => {
    console.log('Joined meeting:', event);
  };

  const handleParticipantJoined = (event) => {
    const { participant } = event;
    console.log('Participant joined:', participant);
    if (!participant.local && callObject) {
      // Add a small delay to ensure the participant is fully initialized
      setTimeout(() => {
        checkForExistingParticipant(callObject);
      }, 500);
    }
  };

  const handleParticipantLeft = (event) => {
    const { participant } = event;
    console.log('Participant left:', participant);
  };

  const handleParticipantUpdated = (event) => {
    const { participant } = event;
    console.log('Participant updated:', participant);
    if (!participant.local && callObject) {
      checkForExistingParticipant(callObject);
    }
  };

  const handleError = (error) => {
    console.error('Daily.co error:', error);
    setError(error.errorMsg || 'An error occurred with the video call');
  };

  return (
    <div className="app">
      <div className="controls">
        <input 
          type="text" 
          placeholder="Enter room ID" 
          onKeyPress={(e) => e.key === 'Enter' && subscribeToRoom(e.target.value)}
        />
        <button onClick={(e) => subscribeToRoom(document.querySelector('input').value)}>
          Join Room
        </button>
      </div>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <div className="video-container">
        <video
          id="participant-video"
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '800px', margin: '20px auto' }}
        />
      </div>
    </div>
  );
}

export default App;
