import { BaseFetcher } from "../base/BaseFetcher";

export class FlipkartFetcher extends BaseFetcher {
    async search(query: string) {
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

        return await this.navigate(url);
    }
}