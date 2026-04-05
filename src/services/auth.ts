import { AuthResult, AuthUser } from '../types/auth';

interface UserRecord extends AuthUser {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface SessionRecord {
  token: string;
  userId: string;
  email: string;
  name: string;
  issuedAt: string;
  expiresAt: string;
}

interface LoginAttemptRecord {
  fails: number;
  lockedUntil?: number;
}

const USERS_KEY = 'web-calendar-auth-users';
const SESSION_KEY = 'web-calendar-auth-session';
const ATTEMPTS_KEY = 'web-calendar-auth-attempts';
export const AUTH_EVENT_KEY = 'web-calendar-auth-update';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_LOGIN_FAILS = 5;
const LOCKOUT_MS = 1000 * 60 * 10;
const PBKDF2_ITERATIONS = import.meta.env.MODE === 'test' ? 2000 : 210000;

const dispatchAuthUpdate = () => {
  window.dispatchEvent(new Event(AUTH_EVENT_KEY));
};

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const fromBase64ToArrayBuffer = (value: string): ArrayBuffer => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};

const getUsers = (): UserRecord[] => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: UserRecord[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getAttempts = (): Record<string, LoginAttemptRecord> => {
  const raw = localStorage.getItem(ATTEMPTS_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveAttempts = (attempts: Record<string, LoginAttemptRecord>) => {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
};

const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const randomId = (): string => {
  return crypto.randomUUID();
};

const derivePasswordHash = async (password: string, saltBase64: string): Promise<string> => {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromBase64ToArrayBuffer(saltBase64),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  );

  return toBase64(new Uint8Array(derivedBits));
};

const createSalt = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
};

const createSession = (user: AuthUser): SessionRecord => {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_MS);
  return {
    token: randomId(),
    userId: user.id,
    email: user.email,
    name: user.name,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
};

const writeSession = (session: SessionRecord | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  dispatchAuthUpdate();
};

export const getCurrentSession = (): SessionRecord | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionRecord;
    const now = Date.now();
    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!parsed.userId || Number.isNaN(expiresAt) || now >= expiresAt) {
      writeSession(null);
      return null;
    }
    return parsed;
  } catch {
    writeSession(null);
    return null;
  }
};

export const getCurrentUser = (): AuthUser | null => {
  const session = getCurrentSession();
  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    name: session.name,
  };
};

export const registerWithPassword = async (
  nameInput: string,
  emailInput: string,
  password: string,
): Promise<AuthResult> => {
  const name = nameInput.trim();
  const email = emailInput.trim().toLowerCase();

  if (name.length < 2) {
    return { ok: false, message: '이름은 2자 이상이어야 합니다.' };
  }

  if (!isEmail(email)) {
    return { ok: false, message: '올바른 이메일 형식을 입력해주세요.' };
  }

  if (password.length < 8) {
    return { ok: false, message: '비밀번호는 8자 이상이어야 합니다.' };
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, message: '이미 가입된 이메일입니다.' };
  }

  const salt = createSalt();
  const passwordHash = await derivePasswordHash(password, salt);
  const user: UserRecord = {
    id: randomId(),
    name,
    email,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  const session = createSession(user);
  writeSession(session);

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

export const loginWithPassword = async (emailInput: string, password: string): Promise<AuthResult> => {
  const email = emailInput.trim().toLowerCase();
  if (!isEmail(email)) {
    return { ok: false, message: '이메일 형식이 올바르지 않습니다.' };
  }

  const now = Date.now();
  const attempts = getAttempts();
  const attempt = attempts[email] ?? { fails: 0 };

  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const leftSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { ok: false, message: `로그인 시도가 너무 많습니다. ${leftSeconds}초 후 다시 시도해주세요.` };
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    const nextFails = attempt.fails + 1;
    attempts[email] = {
      fails: nextFails,
      lockedUntil: nextFails >= MAX_LOGIN_FAILS ? now + LOCKOUT_MS : undefined,
    };
    saveAttempts(attempts);
    return { ok: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' };
  }

  const hash = await derivePasswordHash(password, user.salt);
  if (hash !== user.passwordHash) {
    const nextFails = attempt.fails + 1;
    attempts[email] = {
      fails: nextFails,
      lockedUntil: nextFails >= MAX_LOGIN_FAILS ? now + LOCKOUT_MS : undefined,
    };
    saveAttempts(attempts);
    return { ok: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' };
  }

  attempts[email] = { fails: 0 };
  saveAttempts(attempts);

  const session = createSession(user);
  writeSession(session);

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

export const logout = (): void => {
  writeSession(null);
};
