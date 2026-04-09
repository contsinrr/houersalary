/// <reference types="vite/client" />

import type { ComponentProps } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: ComponentProps<any>;
    }
  }
}
