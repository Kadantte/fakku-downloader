export type Mapping = {
  mapping: { sx: number; sy: number; dx: number; dy: number }[];
  width: number;
  height: number;
  filename: string;
} & PageData["pages"][string];

export type Metadata = {
  Title?: string;
  Artist?: string[];
  Circle?: string[];
  Description?: string;
  Parody?: string[];
  URL?: string;
  Tags?: string[];
  Publisher?: string[];
  Magazine?: string[];
  Event?: string[];
  Pages?: number;
  ThumbnailIndex?: number;
};

export type PageData = {
  pages: {
    [key: string]: {
      page: number;
      image: string;
    };
  };
  spreads: [number, number][];
  key_hash: string;
  key_data: string;
};

export type Cookie = {
  name: string;
  value: string;
};

export type Options = {
  force: boolean | undefined;
  downloadDir: string;
  userDataDir: string;
  headless: boolean | undefined;
  useJpegtran: boolean;
  timeout: number;
  spreads: boolean | undefined;
  direct: boolean | undefined;
  cookies: string | undefined;
};
