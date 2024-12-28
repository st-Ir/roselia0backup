// global.d.ts
interface Window {
  ENV: Record<string, any>;
}

declare module "*.astro" {
    export const props: {
      user: any;
    };
  }
