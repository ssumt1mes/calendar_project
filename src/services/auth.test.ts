import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCurrentUser,
  loginWithPassword,
  logout,
  registerWithPassword,
} from './auth';

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers and creates session', async () => {
    const result = await registerWithPassword('Tester', 'user@example.com', 'my-password-123');
    expect(result.ok).toBe(true);
    expect(result.user?.email).toBe('user@example.com');
    expect(getCurrentUser()?.email).toBe('user@example.com');
  });

  it('logs in existing account', async () => {
    await registerWithPassword('Tester', 'user@example.com', 'my-password-123');
    logout();
    const result = await loginWithPassword('user@example.com', 'my-password-123');
    expect(result.ok).toBe(true);
    expect(getCurrentUser()?.name).toBe('Tester');
  });

  it('rejects wrong password', async () => {
    await registerWithPassword('Tester', 'user@example.com', 'my-password-123');
    logout();
    const result = await loginWithPassword('user@example.com', 'wrong-password');
    expect(result.ok).toBe(false);
    expect(getCurrentUser()).toBeNull();
  });

  it('rejects duplicate email on register', async () => {
    await registerWithPassword('Tester', 'user@example.com', 'my-password-123');
    logout();
    const result = await registerWithPassword('Tester2', 'user@example.com', 'my-password-456');
    expect(result.ok).toBe(false);
  });
});
