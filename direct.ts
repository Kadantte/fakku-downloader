import yaml from "yaml";
import { done } from "./data";
import descrambler from "./descrambler";
import type { Cookie, Options, PageData } from "./types";
import { descrambleImages, handleSpreads, parseMetadata } from "./utils";

export const downloadGallery = async (
  slug: string,
  cookies: Cookie[],
  options: Options
) => {
  console.debug(`Downloading ${slug}`);

  const headers = {
    cookie: cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; "),
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept: "*/*",
    "accept-language": "en-US",
    priority: "u=0, i",
    "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    Referer: "https://www.fakku.net/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  const url = `https://www.fakku.net/hentai/${slug}`;

  if (!options.force && done.has(url)) {
    return;
  }

  const html = await fetch(url, { headers }).then((res) => res.text());
  const metadata = parseMetadata(html, slug);

  const pageData: PageData = await fetch(
    `https://reader.fakku.net/hentai/${slug}/read`,
    { headers }
  ).then((res) => res.json());

  await Bun.write(
    `${options.downloadDir}/${slug}/scrambled/data.json`,
    JSON.stringify(pageData, null, 2)
  );

  const pageMappings = descrambler(
    cookies.find((cookie) => cookie.name === "fakku_zid")!.value,
    pageData
  );

  await Bun.write(
    `${options.downloadDir}/${slug}/scrambled/mappings.json`,
    JSON.stringify(pageMappings, null, 2)
  );

  console.debug("Downloading pages");

  let savedPages = 0;
  const downloadedImages = [];

  for (const { page, image, filename } of Object.values(pageMappings)) {
    console.debug(`Downloading page ${page} ${filename} - ${image}`);
    const blob = await fetch(image, { headers }).then((res) => res.blob());
    const path = `scrambled/${page}`;
    console.log(`Saving "${path}"`);
    await Bun.write(`${options.downloadDir}/${slug}/${path}`, blob);
    downloadedImages.push(filename);
  }

  console.log("Finished getting images");

  const images = await descrambleImages(
    pageMappings,
    `${options.downloadDir}/${slug}`,
    options.useJpegtran
  );

  for (const image of images) {
    console.debug(`Saving page ${image.page} to ${image.savePath}`);

    await Bun.write(image.savePath, image.content);

    savedPages++;
  }

  if (pageData.spreads.length && options.spreads) {
    console.log(`(${slug}) Creating spread images`);
    await handleSpreads(pageData.spreads, `${options.downloadDir}/${slug}`);
  }

  await Bun.write(
    `${options.downloadDir}/${slug}/info.yaml`,
    yaml.stringify(metadata)
  );

  if (savedPages === Object.keys(pageData.pages).length) {
    done.add(`https://www.fakku.net/hentai/${slug}`);
    await Bun.write("done.txt", Array.from(done).join("\n"));
    console.log(`(${slug}) Finished`);
  } else {
    console.log(`Something failed when downloading ${slug}`);
  }
};
