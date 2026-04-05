import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { appConfig } from '../config';
import './GoogleConnectButton.css';

interface GoogleConnectButtonProps {
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
}

export const GoogleConnectButton = ({ onLoginSuccess, onLogout }: GoogleConnectButtonProps) => {
  const [user, setUser] = useState<{ picture?: string; name?: string } | null>(null);

  if (!appConfig.googleEnabled || !appConfig.googleClientId) {
    return (
      <div
        className="google-connect-disabled"
        title="Set VITE_GOOGLE_CLIENT_ID and VITE_ENABLE_GOOGLE_CALENDAR=true to enable Google sync"
      >
        Google Calendar 연결은 아직 설정되지 않았습니다.
      </div>
    );
  }

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onLoginSuccess(tokenResponse.access_token);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        setUser({ picture: userInfo.picture, name: userInfo.name });
      } catch (e) {
        console.error('Failed to fetch user info', e);
      }
    },
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
  });

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    onLogout();
  };

  if (user) {
    return (
      <button
        type="button"
        className="google-connect-button connected"
        onClick={handleLogout}
        title="Disconnect Google Calendar"
      >
        {user.picture ? (
          <img src={user.picture} alt="" className="google-avatar" />
        ) : (
          <span className="google-connect-check" aria-hidden="true">✓</span>
        )}
        <span className="google-connect-copy">
          <strong>{user.name ?? 'Google 계정 연결됨'}</strong>
          <span>읽기 전용 캘린더 연결 해제</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => login()}
      className="google-connect-button"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.48 10.92v2.16h3.44c-0.15.82-0.94 2.4-3.44 2.4-2.07 0-3.77-1.74-3.77-3.84s1.7-3.84 3.77-3.84c1.18 0 1.96.51 2.41.93l1.71-1.66C15.46 5.97 14.12 5.04 12.48 5.04c-3.79 0-6.86 3.09-6.86 6.9s3.07 6.9 6.86 6.9c1.98 0 3.73-.66 5.05-1.9 1.45-1.34 2.33-3.37 2.33-5.74 0-0.57-.05-0.99-.1-1.42h-7.28z" />
      </svg>
      <span className="google-connect-copy">
        <strong>Google Calendar 연결</strong>
        <span>읽기 전용 일정 가져오기</span>
      </span>
    </button>
  );
};
