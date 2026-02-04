import { AsyncLocalStorage } from 'async_hooks';

export interface UserContext {
  id: string;
  email: string;
}

const storage = new AsyncLocalStorage<UserContext>();

export const AuthContext = {
  run: (user: UserContext, next: () => void) => {
    storage.run(user, next);
  },

  getLoggedUser: (): UserContext => {
    const user = storage.getStore();
    if (!user) throw new Error('No user found in current context');
    return user;
  },
};
