declare module 'fast-csv' {
  import { Transform } from 'stream';

  export interface ParserOptions {
    headers?: boolean;
    delimiter?: string;
    comment?: string;
  }

  export interface Parser extends Transform {
    on(event: 'data', listener: (data: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }

  export function parse(options?: ParserOptions): Parser;
}
