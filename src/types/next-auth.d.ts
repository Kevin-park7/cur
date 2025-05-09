import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      username?: string | null;
      role: string;
    }
  }

  interface User {
    id: string;
    username?: string | null;
    role: string;
  }
} 