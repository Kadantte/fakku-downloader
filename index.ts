import { options, slugs } from "./command";
import { downloadGallery } from "./direct";
import { parseCookies } from "./utils";

if (options.direct) {
  if (!options.cookies) {
    throw new Error("No cookies were specified");
  }

  const cookies = await parseCookies(options.cookies);

  for (const slug of slugs) {
    await downloadGallery(slug, cookies, options);
  }
} else {
  const browser = await (await import("./browser")).default(options);

  for (const slug of slugs) {
    await browser.downloadGallery(slug).catch((error) => {
      console.error(`Failed to download gallery '${slug}'`, error);
    });
  }

  await browser.close();
}
