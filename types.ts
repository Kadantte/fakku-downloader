import type { PageData } from ".";

export type Mapping = {
  mapping: { sx: number; sy: number; dx: number; dy: number }[];
  width: number;
  height: number;
  filename: string;
} & PageData["pages"][string];
