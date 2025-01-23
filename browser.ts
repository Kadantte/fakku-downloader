import puppeteer from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { RequestInterceptionManager } from "puppeteer-intercept-and-modify-requests";
import yaml from "yaml";
import { done, notUnlimited } from "./data";
import descramble from "./descrambler";
import type { Metadata, Options, PageData } from "./types";
import {
  descrambleImages,
  handleSpreads,
  isUnlimited,
  parseMetadata,
} from "./utils";

puppeteer.use(stealthPlugin());

export default async (options: Options) => {
  const browser = await puppeteer.launch({
    args: ["--disable-web-security"],
    userDataDir: options.userDataDir,
    headless: options.headless,
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

    const html = await tab.evaluate(
      () => document.querySelector("*")!.outerHTML
    );

    return parseMetadata(html, slug);
  };

  const downloadGallery = async (slug: string) => {
    tab.setViewport(null);

    const url = `https://www.fakku.net/hentai/${slug}`;

    if ((!options.force && done.has(url)) || notUnlimited.has(url)) {
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

    const interceptManager = new RequestInterceptionManager(client as any);

    console.debug(
      `Intercepting requests for page data with a timeout of ${options.timeout}ms`
    );

    const { pageData, zid } = await new Promise<{
      pageData: PageData;
      zid: string;
    }>(async (resolve, reject) => {
      const timeout = setTimeout(
        () => reject(`Failed to get page data`),
        options.timeout
      );

      await interceptManager.intercept({
        urlPattern: "*/read",
        resourceType: "XHR",
        modifyResponse({ body, event }) {
          if (body) {
            clearTimeout(timeout);
            resolve({
              pageData: JSON.parse(body),
              zid: event.request.headers["Cookie"].match(
                /fakku_zid=([^;]+)/
              )![1],
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
      `${options.downloadDir}/${slug}/scrambled/data.json`,
      JSON.stringify(pageData, null, 2)
    );

    const pageMappings = descramble(zid, pageData);

    await Bun.write(
      `${options.downloadDir}/${slug}/scrambled/mappings.json`,
      JSON.stringify(pageMappings, null, 2)
    );

    console.debug("Downloading pages");

    let savedPages = 0;

    const downloadedImages = [];

    for (const { page, image, filename } of Object.values(pageMappings)) {
      console.debug(`Downloading page ${page} ${filename} - ${image}`);

      const dataURL = await tab.evaluate(async (image) => {
        const blob = await fetch(image, { credentials: "include" }).then(
          (res) => res.blob()
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

      await Bun.write(`${options.downloadDir}/${slug}/${path}`, blob);

      downloadedImages.push(filename);
    }

    if (downloadedImages.length === Object.entries(pageMappings).length) {
      console.log("Finished getting images");
    }

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

  return { downloadGallery, close: () => browser.close() };
};
