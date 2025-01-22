import Jimp from "jimp";
import filetype from "magic-bytes.js";
import type { Page } from "puppeteer";
import type { Mapping } from "./types";

export const random = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const isUnlimited = async (tab: Page) =>
  tab
    .$(".table-cell.w-full.align-top.text-left a[href='/unlimited']")
    .then((el) => !!el);

export const descrambleImages = async (
  pageMappings: { [key: string]: Mapping },
  folder: string
) => {
  const images: { page: number; savePath: string; content: Buffer }[] = [];

  for (const [_, { page, mapping, width, height }] of Object.entries(
    pageMappings
  )) {
    console.log(`Descrambling page ${page}`);

    const bytes = await Bun.file(`${folder}/scrambled/${page}`).bytes();
    const buffer = Buffer.from(bytes);
    const jimp = await Jimp.read(buffer);
    const type = filetype(bytes)[0];
    const newImage = await Jimp.create(jimp.bitmap.width, jimp.bitmap.height);

    mapping.forEach(({ sx, sy, dx, dy }) => {
      const box = jimp.clone().crop(sx, sy, 128, 128);
      newImage.composite(box, dx, dy);
    });

    newImage.crop(0, 0, width, height);

    images.push({
      page,
      savePath: `${folder}/${page}.${type.extension}`,
      content: await newImage.quality(100).getBufferAsync(type.mime!),
    });
  }

  return images;
};
