import React, { useState, useEffect } from 'react';

// The main App component, which will be the default export.
// All other components and logic are contained within this single file.
export default function App() {
  // Replace these with your actual Instagram credentials
  // NOTE: In a production app, you should not hardcode these.
  const DEMO_USER_ID = "17841476089772806";
  const DEMO_ACCESS_TOKEN = "IGAAhRZCVkZCeY9BZAE5XTERRcXVKNW1Dd0tQTjZAxZA0I1c1ktM3o4X0l3d2VMODVYZAmo5ZAWhFTEFWZAXl5N3o4RWVyeWNOUUpFNnhjajAtOXJyT1g5b1dxaFVWNjdwZAHJQaHZAZAMDRJa2pSTUZAIaHhyZA3R3RkNoSUJ2NVlvVVd2TFViawZDZD";

  return (
    <div className="min-h-screen">
      <InstagramReels 
        userId={DEMO_USER_ID} 
        accessToken={DEMO_ACCESS_TOKEN} 
      />
      
      {/* Demo notice and instructions */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
        <h3 className="text-white text-lg font-semibold mb-3">🔧 Setup Instructions:</h3>
        <div className="text-white text-sm space-y-2 opacity-90">
          <p><strong>1.</strong> Replace <code className="bg-black bg-opacity-30 px-2 py-1 rounded">YOUR_INSTAGRAM_USER_ID</code> with your Instagram User ID</p>
          <p><strong>2.</strong> Replace <code className="bg-black bg-opacity-30 px-2 py-1 rounded">YOUR_INSTAGRAM_ACCESS_TOKEN</code> with your Instagram Graph API access token</p>
          <p><strong>3.</strong> This component is production-ready and can be directly used in any React app</p>
          <p><strong>4.</strong> Make sure your access token has the required permissions: <code className="bg-black bg-opacity-30 px-2 py-1 rounded">instagram_graph_user_media</code></p>
        </div>
      </div>
    </div>
  );
}

// Instagram Reels component to fetch and display video content.
const InstagramReels = ({ userId, accessToken }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstagramReels = async () => {
      // Check for placeholder values to provide a more specific error
      if (userId === "YOUR_INSTAGRAM_USER_ID" || accessToken === "YOUR_INSTAGRAM_ACCESS_TOKEN") {
        setError('Please replace the placeholder values for your User ID and Access Token in the code to fetch data.');
        setLoading(false);
        return;
      }

      // Existing check for null/empty values
      if (!userId || !accessToken) {
        setError('User ID and Access Token are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp&access_token=${accessToken}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter only videos (reels)
        const videoData = data.data?.filter(item => item.media_type === 'VIDEO') || [];
        
        setVideos(videoData);
      } catch (err) {
        console.error('Error fetching Instagram reels:', err);
        setError('Failed to fetch Instagram reels. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramReels();
  }, [userId, accessToken]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption) return '';
    return caption.length > maxLength 
      ? caption.substring(0, maxLength) + '...' 
      : caption;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white">
        <div className="loading-spinner w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg font-medium">Loading Instagram Reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white">
        <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-6 max-w-md text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Reels</h3>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white">
        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-white opacity-60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
          <p className="text-white opacity-80">No Instagram Reels were found for this account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* This style block is used to replicate the original CSS animations and gradients
        that are not easily achievable with standard Tailwind classes alone.
      */}
      <style>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        
        .video-card {
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        
        .video-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .gradient-text {
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Instagram <span className="gradient-text">Reels</span>
        </h1>
        <p className="text-white opacity-80">
          Showing {videos.length} video{videos.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {videos.map((video) => (
          <div key={video.id} className="video-card rounded-xl overflow-hidden shadow-lg">
            <div className="relative">
              <video
                controls
                className="w-full h-64 object-cover bg-gray-100"
                poster={video.thumbnail_url}
                preload="metadata"
              >
                <source src={video.media_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="p-4">
              {video.caption && (
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                  {truncateCaption(video.caption)}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatDate(video.timestamp)}
                </span>
                
                <a
                  href={video.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  View on Instagram
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
