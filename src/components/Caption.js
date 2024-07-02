import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import './caption.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [captions, setCaptions] = useState([]);
  const [captionText, setCaptionText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const videoRef = useRef(null);
  const [currentCaption, setCurrentCaption] = useState('');
  const [videoError, setVideoError] = useState('');

  const addCaption = () => {
    if (captionText && startTime && endTime) {
      setCaptions([
        ...captions,
        { text: captionText, startTime: parseTime(startTime), endTime: parseTime(endTime) },
      ]);
      setCaptionText('');
      setStartTime('');
      setEndTime('');
    }
  };

  const parseTime = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
    const current = captions.find(caption => currentTime >= caption.startTime && currentTime <= caption.endTime);
    setCurrentCaption(current ? current.text : '');
  };

  const handleVideoError = (e) => {
    console.error('Video Error:', e);
    setVideoError('Video cannot be played. Please check the URL and CORS policy.');
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('error', handleVideoError);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.removeEventListener('error', handleVideoError);
      }
    };
  }, [captions]);

  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="App">
      <h1>Video Caption App</h1>
      <div>
        <input
          type="text"
          placeholder="Enter video URL"
          value={videoUrl}
          onChange={e => {
            setVideoUrl(e.target.value);
            setVideoError('');
          }}
        />
      </div>
      {videoUrl && (
        <div className="video-container">
          {isYouTubeUrl(videoUrl) ? (
            <YouTube videoId={getYouTubeVideoId(videoUrl)} opts={{ width: '100%', playerVars: { controls: 1 } }} />
          ) : (
            <video ref={videoRef} width="100%" controls>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          {videoError && <div className="error">{videoError}</div>}
          {currentCaption && <div className="caption">{currentCaption}</div>}
        </div>
      )}
      <div>
        <input
          type="text"
          placeholder="Enter caption text"
          value={captionText}
          onChange={e => setCaptionText(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter start time (hh:mm:ss)"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter end time (hh:mm:ss)"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
        />
        <button onClick={addCaption}>Add Caption</button>
      </div>
      <div>
        <h2>Captions List</h2>
        <ul className="captions-list">
          {captions.map((caption, index) => (
            <li key={index}>
              {formatTime(caption.startTime)} - {formatTime(caption.endTime)}: {caption.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
