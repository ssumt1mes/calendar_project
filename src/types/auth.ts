export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  ok: boolean;
  message?: string;
  user?: AuthUser;
}
