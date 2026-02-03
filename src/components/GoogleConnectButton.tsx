import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

interface GoogleConnectButtonProps {
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
}

export const GoogleConnectButton = ({ onLoginSuccess, onLogout }: GoogleConnectButtonProps) => {
  const [user, setUser] = useState<{ picture?: string; name?: string } | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onLoginSuccess(tokenResponse.access_token);
      // Fetch user info for UI
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        setUser({ picture: userInfo.picture, name: userInfo.name });
      } catch (e) {
        console.error("Failed to fetch user info", e);
      }
    },
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
  });

  const handleLogout = () => {
    setUser(null);
    onLogout();
  };

  if (user) {
    return (
      <div 
        onClick={handleLogout}
        title="Disconnect Google Calendar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '4px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontSize: '0.9rem',
          color: '#fff',
          transition: 'all 0.2s ease',
        }}
      >
        {user.picture ? (
          <img 
            src={user.picture} 
            alt="User" 
            style={{ width: '20px', height: '20px', borderRadius: '50%' }} 
          />
        ) : (
          <span>✓</span>
        )}
        <span>Connected</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background 0.2s',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.35 11.1h-9.17v2.98h5.24c-0.23 1.2-0.9 2.2-1.91 2.87v2.39h3.1c1.81-1.67 2.86-4.13 2.86-7.07 0-0.7 0.08-1.37 ..."/> 
        {/* Simplified Google Icon path or use a real one */}
        <path d="M12.48 10.92v2.16h3.44c-0.15.82-0.94 2.4-3.44 2.4-2.07 0-3.77-1.74-3.77-3.84s1.7-3.84 3.77-3.84c1.18 0 1.96.51 2.41.93l1.71-1.66C15.46 5.97 14.12 5.04 12.48 5.04c-3.79 0-6.86 3.09-6.86 6.9s3.07 6.9 6.86 6.9c1.98 0 3.73-.66 5.05-1.9 1.45-1.34 2.33-3.37 2.33-5.74 0-0.57-.05-0.99-.1-1.42h-7.28z" />
      </svg>
      Link Calendar
    </button>
  );
};
