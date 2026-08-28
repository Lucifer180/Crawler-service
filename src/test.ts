import BrowserManager from "./browser/browserManager";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    await BrowserManager.init();
    const query = "shoes";

    console.log("\n--- Inspecting Flipkart Card elements ---");
    const flipkartContext = await BrowserManager.createContext();
    const flipkartPage = await flipkartContext.newPage();
    await flipkartPage.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
    
    const flipkartCards = flipkartPage.locator("div[data-id]");
    if (await flipkartCards.count() > 0) {
      const cardElements = await flipkartCards.first().evaluate((el) => {
        return [...el.querySelectorAll("*")].map((e) => ({
          tag: e.tagName,
          className: e.className,
          text: e.textContent?.trim() || "",
          href: e.getAttribute("href"),
          src: e.getAttribute("src")
        })).filter(x => (x.text && x.text.length > 0) || x.href || x.src);
      });
      console.log(JSON.stringify(cardElements, null, 2));
    }
    await flipkartContext.close();

    console.log("\n--- Inspecting Myntra Card elements ---");
    const myntraContext = await BrowserManager.createContext();
    const myntraPage = await myntraContext.newPage();
    await myntraPage.goto(`https://www.myntra.com/${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
    
    const myntraCards = myntraPage.locator(".product-base");
    if (await myntraCards.count() > 0) {
      const cardElements = await myntraCards.first().evaluate((el) => {
        return [...el.querySelectorAll("*")].map((e) => ({
          tag: e.tagName,
          className: e.className,
          text: e.textContent?.trim() || "",
          href: e.getAttribute("href"),
          src: e.getAttribute("src")
        })).filter(x => (x.text && x.text.length > 0) || x.href || x.src);
      });
      console.log(JSON.stringify(cardElements, null, 2));
    }
    await myntraContext.close();

    await BrowserManager.close();
    console.log("Done");
  } catch (err) {
    console.error("Test error:", err);
  }
}

test();