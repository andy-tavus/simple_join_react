# Tavus.io Direct Stream Subscription React App

This React application is designed to connect to a Tavus.io video call room and directly subscribe to the audio and video streams of participants. Unlike the traditional method of embedding a call in an iframe, this approach allows you to have more control over how the video and audio are displayed, enabling custom user interface designs and interactions.

## Overview

At a high level, this app does the following:

1. **Setup**: Initializes a Tavus.io call object with specific configurations to manage audio and video streams.
2. **Subscription**: Manually subscribes to the audio and video streams of participants as they join the call.
3. **Display**: Uses HTML5 video and audio elements to render the streams directly in the browser.
4. **Interaction**: Provides a simple interface for users to join a room by entering a conversation ID.

## Prerequisites

Before you start, ensure you have the following:

- **Node.js**: Make sure Node.js is installed on your system to run the app.
- **Tavus.io Account**: You need a Tavus.io account to create and manage video call rooms.
- **Conversation URL**: Obtain a conversation URL from your Tavus.io dashboard.
- **React Knowledge**: Basic understanding of React and JavaScript will be helpful.

## Installation

To get started with the app, follow these steps:

1. **Clone the Repository**: Download the app code to your local machine.
2. **Install Dependencies**: Navigate to the app directory and run:
```bash
npm install
```
This command installs all necessary packages, including the Tavus.io SDK and React.

## Key Dependencies

The app relies on the following key packages:

- `@daily-co/daily-js`: The JavaScript SDK for interacting with Tavus.io services.
- `react`: A JavaScript library for building user interfaces.
- `react-dom`: Provides DOM-specific methods that can be used at the top level of your app.

## How It Works

### 1. Setting Up the Tavus.io Call Object

The app begins by creating a call object using the Tavus.io SDK. This object is configured to handle audio and video streams manually:

```javascript
const daily = DailyJs.createCallObject({
  audioSource: true,
  videoSource: true,
  subscribeToTracksAutomatically: false, // We manage track subscriptions manually
});
```

### 2. Subscribing to Participant Streams

When participants join the call, the app subscribes to their audio and video streams. This is done in two main ways:

1. **Manual Track Subscription**: This method allows you to specify which tracks to subscribe to for each participant.
```javascript
daily.updateParticipant(participant.session_id, {
  setSubscribedTracks: {
    video: true,
    audio: true
  }
});
```

2. **Track Event Handling**: The app listens for track events to dynamically handle new streams as they start.
```javascript
daily.on('track-started', (event) => {
  const { participant, track } = event;
  if (!participant.local) {
    handleParticipantTrack(participant, track);
  }
});
```

### 3. Displaying Streams

The app uses HTML5 elements to display the streams. Video and audio tracks are handled separately to ensure smooth playback:

```javascript
// For video
const videoStream = new MediaStream([track]);
videoElement.srcObject = videoStream;

// For audio
const audioStream = new MediaStream([track]);
const audio = new Audio();
audio.srcObject = audioStream;
```

## Key Features

- **Direct Stream Subscription**: Bypasses the iframe to give you more control over the media.
- **Manual Track Management**: Allows for precise control over which streams are active.
- **Custom UI**: Integrate video and audio streams into your own user interface.
- **Event-Driven**: Reacts to participant events to manage streams dynamically.
- **Error Handling**: Includes mechanisms to handle errors and clean up resources.

## Usage

To use the app, follow these steps:

1. **Start the Development Server**: Run the app locally by executing:
```bash
npm start
```

2. **Join a Room**: Enter your Tavus.io conversation ID in the input field provided and click "Join Room" or press Enter.

## Important Notes

- **Permissions**: Ensure your browser has permissions to access the camera and microphone.
- **Room Access**: Verify that your Tavus.io conversation URL is correct and accessible.
- **Event Handling**: The app automatically manages participant join and leave events.
- **Resource Cleanup**: Streams and resources are cleaned up when the component unmounts to prevent memory leaks.

## Common Issues and Solutions

1. **No Video/Audio Display**
   - Check if browser permissions are granted for camera and microphone.
   - Ensure the conversation URL is correct and participants have active streams.

2. **Connection Issues**
   - Verify your internet connection.
   - Check the status of Tavus.io services.
   - Ensure you have the correct permissions to access the conversation.

## Best Practices

1. **Resource Management**: Always clean up resources when components unmount to avoid memory leaks:
```javascript
useEffect(() => {
  return () => {
    if (callObject) {
      callObject.destroy();
    }
  };
}, [callObject]);
```

2. **Error Handling**: Implement robust error handling to manage unexpected issues:
```javascript
daily.on('error', (error) => {
  console.error('Tavus.io error:', error);
  setError(error.errorMsg);
});
```

3. **Participant Management**: Use appropriate delays when checking for participants to ensure they are fully initialized:
```javascript
setTimeout(() => {
  checkForExistingParticipant(daily);
}, 1500);
```

## Contributing

We welcome contributions! Feel free to submit issues and enhancement requests to improve the app. 