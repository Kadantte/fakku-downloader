import { $ } from "bun";
import Jimp from "jimp";
import joinImages from "join-images";
import filetype from "magic-bytes.js";
import { parse } from "node-html-parser";
import { rm, stat } from "node:fs/promises";
import pMap from "p-map";
import type { Page } from "puppeteer";
import tempfile from "tempfile";
import type { Cookie, Mapping, Metadata, PageData } from "./types";

export const isUnlimited = async (tab: Page) =>
  tab
    .$(".table-cell.w-full.align-top.text-left a[href='/unlimited']")
    .then((el) => !!el);

export const descrambleImages = async (
  pageMappings: { [key: string]: Mapping },
  folder: string,
  jpegtran: boolean
) => {
  const images: {
    page: number;
    savePath: string;
    content: Uint8Array;
  }[] = [];

  for (const [_, { page, mapping, width, height }] of Object.entries(
    pageMappings
  )) {
    console.log(
      `Descrambling page ${page}${jpegtran ? " using jpegtran" : ""}`
    );

    const bytes = await Bun.file(`${folder}/scrambled/${page}`).bytes();
    const type = filetype(bytes)[0];
    const savePath = `${folder}/${page}.${type.extension}`;

    let content: Uint8Array;

    if (jpegtran && type.mime === "image/jpeg") {
      const rows = mapping.reduce((acc, cur) => {
        const index = acc.findIndex((c) => c[0].dy === cur.dy);

        if (index >= 0) {
          acc[index] = [...acc[index], cur];
        } else {
          acc = [...acc, [cur]];
        }

        return acc;
      }, [] as { sx: number; sy: number; dx: number; dy: number }[][]);

      const fixedRows: [Uint8Array, number][] = [];

      await pMap(
        rows,
        async (row) => {
          const temp = tempfile();
          const { dy } = row[0];
          const rowWidth = row.length * 128;
          const rowCrop =
            await $`cat < ${bytes} | jpegtran -crop ${rowWidth}x128+0+${dy}`
              .quiet()
              .then((result) => result.bytes());
          let fixedRow = rowCrop;

          for (const { sx, sy, dx } of row) {
            await $`cat < ${bytes} | jpegtran -crop 128x128+${sx}+${sy} -outfile ${temp}`;
            fixedRow =
              await $`cat < ${fixedRow} | jpegtran -drop +${dx}+0 ${temp}`
                .quiet()
                .then((result) => result.bytes());
          }

          fixedRows.push([fixedRow, dy]);
          await rm(temp);
        },
        { concurrency: navigator.hardwareConcurrency }
      );

      let newImg = bytes;

      const temp = tempfile();

      for (const [data, position] of fixedRows) {
        await Bun.write(temp, data);
        newImg =
          await $`cat < ${newImg} | jpegtran -drop +0+${position} ${temp}`
            .quiet()
            .then((result) => result.bytes());
      }

      newImg =
        await $`cat < ${newImg} | jpegtran -optimize -progressive -crop ${width}x${height}+0+0`
          .quiet()
          .then((result) => result.bytes());

      content = newImg;
    } else {
      const buffer = Buffer.from(bytes);
      const jimp = await Jimp.read(buffer);
      const newImage = await Jimp.create(jimp.bitmap.width, jimp.bitmap.height);

      mapping.forEach(({ sx, sy, dx, dy }) => {
        const box = jimp.clone().crop(sx, sy, 128, 128);
        newImage.composite(box, dx, dy);
      });

      newImage.crop(0, 0, width, height);
      content = Uint8Array.from(
        await newImage.quality(100).getBufferAsync(type.mime!)
      );
    }

    images.push({
      page,
      savePath,
      content,
    });
  }

  return images;
};

export const parseCookies = async (str: string): Promise<Cookie[]> => {
  let content: string;

  try {
    if ((await stat(str)).isFile()) {
      content = await Bun.file(str).text();
    } else {
      throw new Error("Failed to parse cookies - Given path is not a file");
    }
  } catch {
    content = str;
  }

  let cookies: Cookie[] = [];

  try {
    cookies = JSON.parse(content).map(
      (cookie: { name: string; value: string }) => ({
        name: cookie.name,
        value: cookie.value,
      })
    );
  } catch {
    const matches = Array.from(
      content.matchAll(/(?<=\s)([^.\s]+)\t([^\s]+)$/gm)
    );

    for (const match of matches) {
      const name = match[1];
      const value = match[2];
      cookies.push({ name, value });
    }
  }

  const missingCookies = ["fakku_sid", "fakku_zid", "_c"].filter(
    (requiredCookie) =>
      !cookies.some((cookie) => cookie.name === requiredCookie)
  );

  if (missingCookies.length) {
    throw new Error(`Cookies ${missingCookies.join(", ")} are missing`);
  }

  return cookies;
};

export const parseMetadata = (html: string, slug: string): Metadata => {
  const root = parse(html);
  const infoDivs = Array.from(root.querySelectorAll(".table.text-sm.w-full"));

  let metadata: Metadata = {
    Title: root.querySelector("h1")?.textContent?.trim(),
  };

  const artists = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Artist")
    ?.querySelectorAll("a")
    .map((a) => a.textContent.trim());

  if (artists) {
    metadata.Artist = artists;
  }

  const circles = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Circle")
    ?.querySelectorAll("a")
    .map((a) => a.textContent.trim());

  if (circles) {
    metadata.Circle = circles;
  }

  if (infoDivs.at(-2)!.childNodes.length === 1) {
    metadata.Description = infoDivs.at(-2)!.textContent.trim();
  }

  const parodies = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Parody")
    ?.querySelectorAll("a")
    .map((a) => a.textContent.trim());

  if (parodies) {
    metadata.Parody = parodies;
  }

  metadata.URL = `https://www.fakku.net/hentai/${slug}`;

  metadata.Tags = infoDivs
    .at(-1)!
    .querySelectorAll('a[href^="/tags/"]')
    .map((a) => a.textContent.trim());

  const publishers = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Publisher")
    ?.querySelectorAll("a")
    .map((a) => a.textContent.trim());

  if (publishers) {
    metadata.Publisher = publishers;
  }

  const magazines = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Magazine")
    ?.querySelectorAll("a")
    .map((a) => a.textContent.trim());

  if (magazines) {
    metadata.Magazine = magazines;
  }

  const events = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Event")
    ?.querySelectorAll("a")
    .map((a) => a.textContent.trim());

  if (events) {
    metadata.Event = events;
  }

  const pagesMatch = infoDivs
    .find((div) => div.childNodes[1]?.textContent == "Pages")
    ?.childNodes[3]?.textContent?.match(/\d+/)?.[0];

  if (pagesMatch) {
    metadata.Pages = parseInt(pagesMatch);
  }

  const thumbnail = root
    .querySelector('img[src*="/thumbs/"]')!
    .getAttribute("src")!;
  metadata.ThumbnailIndex =
    parseInt(thumbnail.split("/").at(-1)!.match(/\d+/)![0]!) - 1;

  console.debug("Obtained metadata", metadata);

  return metadata;
};

export const handleSpreads = async (
  spreads: PageData["spreads"],
  rootDir: string
) => {
  for (const [a, b] of spreads) {
    if (b > a) {
      const path = `${rootDir}/${a}_${b}.png`;

      if (await Bun.file(path).exists()) {
        continue;
      }

      const bufferA = await Bun.file(`${rootDir}/${a}.png`).arrayBuffer();
      const bufferB = await Bun.file(`${rootDir}/${b}.png`).arrayBuffer();

      const img = await (
        await joinImages([Buffer.from(bufferA), Buffer.from(bufferB)], {
          direction: "horizontal",
        })
      )
        .removeAlpha()
        .png()
        .toBuffer();

      await Bun.write(path, Uint8Array.from(img));
    }
  }
};
