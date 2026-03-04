export {};

declare global {
  interface Window {
    electronAPI?: {
      saveAuthToken: (token: string) => void;
      getAuthToken: () => Promise<string | null>;
    };
  }
}