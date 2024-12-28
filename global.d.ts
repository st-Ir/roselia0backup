// global.d.ts
interface Window {
    ENV: Record<string, any>; // Adjust the type if you have a specific structure for ENV
  }

declare module "*.astro" {
    export const props: {
      user: any;
    };
  }
  