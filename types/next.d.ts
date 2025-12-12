declare module "next/image" {
  import { ImageProps } from "next/dist/shared/lib/get-img-props";
  import React from "react";
  const Image: React.FC<ImageProps & { priority?: boolean }>;
  export default Image;
}

declare module "next/script" {
  import React from "react";
  interface ScriptProps {
    id?: string;
    src?: string;
    strategy?:
      | "beforeInteractive"
      | "afterInteractive"
      | "lazyOnload"
      | "worker";
    onLoad?: () => void;
    onReady?: () => void;
    onError?: () => void;
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: { __html: string };
    [key: string]: any;
  }
  const Script: React.FC<ScriptProps>;
  export default Script;
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (url: string) => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string>>(): T;
}
