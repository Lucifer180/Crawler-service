// import { Page } from "playwright";
// import BrowserManager from "../../browser/browserManager";
// import { AmazonConstants } from "./amazon.constans";
import { BaseFetcher } from "../base/BaseFetcher";
import { AmazonConstants } from "./amazon.constans";

export class AmazonFetcher extends BaseFetcher {
   async search(query: string) {
        const url = `${AmazonConstants.SEARCH_URL}${encodeURIComponent(query)}`;

        return await this.navigate(url);
    }
}