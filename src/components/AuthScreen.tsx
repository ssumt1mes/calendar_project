import React, { useState } from 'react';
import { AuthResult } from '../types/auth';
import './AuthScreen.css';
import { appConfig, getStorageModeLabel, isSupabaseConfigured } from '../config';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<AuthResult>;
  onRegister: (name: string, email: string, password: string) => Promise<AuthResult>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const resetError = () => {
    if (error) {
      setError(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('비밀번호 확인이 일치하지 않습니다.');
          setSubmitting(false);
          return;
        }

        const registerResult = await onRegister(name, email, password);
        if (!registerResult.ok) {
          setError(registerResult.message ?? '회원가입에 실패했습니다.');
        }
        return;
      }

      const loginResult = await onLogin(email, password);
      if (!loginResult.ok) {
        setError(loginResult.message ?? '로그인에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-hero">
          <span className="auth-kicker">shared calendar</span>
          <h1>{appConfig.appName}</h1>
          <p className="auth-sub">로그인 후 캘린더를 시작하세요. 현재 저장 모드: {getStorageModeLabel()}</p>
          <p className="auth-sub">공유 캘린더 이름: {appConfig.calendarName}</p>
        </div>
        {appConfig.syncProvider === 'supabase' && !isSupabaseConfigured() && (
          <p className="auth-sub">Supabase 환경변수가 비어 있어 지금은 로컬 준비 모드로 동작합니다.</p>
        )}

        <div className="auth-security-note" role="note" aria-label="auth security note">
          <strong>보안 안내</strong>
          <span>현재 로그인 정보는 브라우저 로컬 저장소 기반입니다. 공용 기기에서는 사용하지 않는 편이 안전합니다.</span>
        </div>

        <div className="auth-switch" role="tablist" aria-label="Authentication mode">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              resetError();
            }}
            type="button"
          >
            로그인
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              resetError();
            }}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === 'register' && (
            <label>
              이름
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </label>
          )}

          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {mode === 'register' && (
            <label>
              비밀번호 확인
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button data-testid="auth-submit" className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};
