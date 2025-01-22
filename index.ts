import joinImages from "join-images";
import { parse } from "node-html-parser";
import puppeteer from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { RequestInterceptionManager } from "puppeteer-intercept-and-modify-requests";
import { parseArgs } from "util";
import yaml from "yaml";
import descramble from "./descrambler";
import { descrambleImages, isUnlimited, random } from "./utils";

puppeteer.use(stealthPlugin());

export interface Metadata {
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
}

export interface PageData {
  pages: {
    [key: string]: {
      page: number;
      image: string;
    };
  };
  spreads: [number, number][];
  key_hash: string;
  key_data: string;
}

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    spreads: {
      type: "boolean",
      short: "s",
    },
    headless: {
      type: "string",
      default: "true",
      short: "h",
    },
    "user-data-dir": {
      type: "string",
      short: "u",
    },
    "download-dir": {
      type: "string",
      short: "d",
    },
    timeout: {
      type: "string",
      default: "20000",
    },
    file: {
      type: "string",
      short: "f",
    },
  },
  strict: true,
  allowPositionals: true,
});

const downloadDir = values["download-dir"]
  ? values["download-dir"]
  : process.env.DOWNLOAD_DIR ?? "./downloads";

const urls = await (async () => {
  if (values.file) {
    const text = await Bun.file(values.file).text();
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length);
  } else {
    const urls = positionals.slice(2);

    if (!urls.length) {
      throw new Error("No URLs given");
    }

    return urls;
  }
})();

const slugs = [];

for (const [i, url] of urls.entries()) {
  const match = url.match(/(?<=fakku\.net\/hentai\/)[^\/]+/)?.[0];

  if (!match) {
    throw new Error(`Invalid FAKKU URL (${i}) '${url}`);
  }

  slugs.push(match);
}

const browser = await puppeteer.launch({
  args: ["--disable-web-security"],
  userDataDir: values["user-data-dir"]
    ? values["user-data-dir"]
    : process.env.USER_DATA_DIR ?? "./data",
  headless: values.headless ? values.headless === "true" : true,
});

const tab = await browser.newPage();
await tab.goto("https://www.fakku.net/login", { waitUntil: "networkidle0" });

if (await tab.$("a[href='/login/reset']")) {
  console.log('Login then press "Enter" to continue');

  for await (const _ of console) {
    break;
  }
}

await tab.goto("https://www.fakku.net/", { waitUntil: "networkidle0" });

const getMetadata = async (slug: string): Promise<Metadata> => {
  console.log(`(${slug}) Getting metadata`);

  const html = await tab.evaluate(() => document.querySelector("*")!.outerHTML);
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

const done: Set<String> = await (async () => {
  try {
    const text = await Bun.file("done.txt").text();

    return new Set(
      text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length)
    );
  } catch (e) {
    return new Set();
  }
})();

const notUnlimited: Set<String> = await (async () => {
  try {
    const text = await Bun.file("not_unlimited.txt").text();

    return new Set(
      text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length)
    );
  } catch (e) {
    return new Set();
  }
})();

const downloadGallery = async (slug: string) => {
  tab.setViewport(null);

  const url = `https://www.fakku.net/hentai/${slug}`;

  if (done.has(url) || notUnlimited.has(url)) {
    return;
  }

  console.debug(`Navigating to gallery page: ${url}`);

  await tab.goto(url, {
    waitUntil: "networkidle0",
  });

  if (!isUnlimited(tab) || !(await tab.$("a[title='Start Reading']"))) {
    notUnlimited.add(url);
    await Bun.write("not_unlimited.txt", Array.from(notUnlimited).join("\n"));

    return;
  }

  const metadata = await getMetadata(slug);
  const client = await tab.createCDPSession();

  // @ts-ignore
  const interceptManager = new RequestInterceptionManager(client);

  console.debug(
    `Intercepting requests for page data with a timeout of ${values.timeout}ms`
  );

  const { pageData, zid } = await new Promise<{
    pageData: PageData;
    zid: string;
  }>(async (resolve, reject) => {
    const timeout = setTimeout(
      () => reject(`Failed to get page data`),
      parseInt(values.timeout!)
    );

    await interceptManager.intercept({
      urlPattern: "*/read",
      resourceType: "XHR",
      modifyResponse({ body, event }) {
        if (body) {
          clearTimeout(timeout);
          resolve({
            pageData: JSON.parse(body),
            zid: event.request.headers["Cookie"].match(/fakku_zid=([^;]+)/)![1],
          });
        }

        return { body };
      },
    });

    console.debug("Clicking 'Start Reading' button");

    await Promise.all([
      tab.waitForNavigation(),
      tab.click("a[title='Start Reading']"),
    ]);
  });

  console.debug("Intercepted page data body", pageData, zid);

  await Bun.write(
    `${downloadDir}/${slug}/scrambled/data.json`,
    JSON.stringify(pageData, null, 2)
  );

  const pageMappings = descramble(zid, pageData);

  await Bun.write(
    `${downloadDir}/${slug}/scrambled/mappings.json`,
    JSON.stringify(pageMappings, null, 2)
  );

  console.debug("Downloading pages");

  let savedPages = 0;

  const downloadedImages = [];

  for (const { page, image, filename } of Object.values(pageMappings)) {
    console.debug(`Downloading page ${page} ${filename} - ${image}`);

    const dataURL = await tab.evaluate(async (image) => {
      const blob = await fetch(image, { credentials: "include" }).then((res) =>
        res.blob()
      );

      const result = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return result;
    }, image);

    const path = `scrambled/${page}`;

    console.log(`Saving "${path}"`);

    const blob = await fetch(dataURL).then((res) => res.blob());

    await Bun.write(`${downloadDir}/${slug}/${path}`, blob);

    downloadedImages.push(filename);
  }

  if (downloadedImages.length === Object.entries(pageMappings).length) {
    console.log("Finished getting images");
  }

  const images = await descrambleImages(pageMappings, `${downloadDir}/${slug}`);

  for (const image of images) {
    console.debug(`Saving page ${image.page} to ${image.savePath}`);

    await Bun.write(image.savePath, Uint8Array.from(image.content));

    savedPages++;
  }

  if (pageData.spreads.length && values.spreads) {
    console.log(`(${slug}) Creating spread images`);

    for (const [a, b] of pageData.spreads) {
      if (b > a) {
        const path = `${downloadDir}/${slug}/${a}_${b}.png`;

        if (await Bun.file(path).exists()) {
          continue;
        }

        const bufferA = await Bun.file(
          `${downloadDir}/${slug}/${a}.png`
        ).arrayBuffer();
        const bufferB = await Bun.file(
          `${downloadDir}/${slug}/${b}.png`
        ).arrayBuffer();

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
  }

  await Bun.write(`${downloadDir}/${slug}/info.yaml`, yaml.stringify(metadata));

  if (savedPages === Object.keys(pageData.pages).length) {
    done.add(`https://www.fakku.net/hentai/${slug}`);
    await Bun.write("done.txt", Array.from(done).join("\n"));

    console.log(`(${slug}) Finished`);
  } else {
    console.log(`Something failed when downloading ${slug}`);
  }
};

for (const slug of slugs) {
  await downloadGallery(slug).catch((error) => {
    console.error(`Failed to download gallery '${slug}'`, error);
  });
}

browser.close();
