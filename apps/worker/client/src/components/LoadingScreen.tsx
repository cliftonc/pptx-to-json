import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: string;
  show: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Processing...",
  progress,
  show
}) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      transition: 'all 0.3s ease'
    }}>
      {/* Animated PowerPoint Logo */}
      <div style={{
        fontSize: '80px',
        marginBottom: '30px',
        animation: 'pulse 2s infinite'
      }}>
        🎨
      </div>

      {/* Loading Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '30px'
      }} />

      {/* Main Message */}
      <h2 style={{
        margin: '0 0 15px 0',
        color: '#333',
        fontSize: '24px',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        {message}
      </h2>

      {/* Progress Message */}
      {progress && (
        <p style={{
          margin: '0 0 30px 0',
          color: '#666',
          fontSize: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          lineHeight: '1.5'
        }}>
          {progress}
        </p>
      )}


      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;