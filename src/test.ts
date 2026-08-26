import BrowserManager from "./browser/browserManager";
import dotenv from "dotenv";

dotenv.config();
async function test() {
  try {
    await BrowserManager.init();
    const {page} = await BrowserManager.createSession();
    await page.goto("https://google.com");
    console.log(await page.title());

    console.log("4. Getting title...");
    const title = await page.title();
    const content = await page.content();

    console.log("Title:", title);

    await page.close();

    await BrowserManager.close();

    console.log("Done");
  } catch (err) {
    console.error(err);
  }
}

test();