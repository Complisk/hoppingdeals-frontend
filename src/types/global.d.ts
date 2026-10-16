export {};

declare global {
  interface Window {
    google?: any;
    Stripe?: any;
    webkit?: any;
    ethereum?: any;
  }
}
