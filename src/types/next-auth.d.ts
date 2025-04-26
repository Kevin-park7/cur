import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      level: string;
    } & DefaultSession['user']
  }

  interface User {
    role: string;
    level: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    level: string;
  }
} 