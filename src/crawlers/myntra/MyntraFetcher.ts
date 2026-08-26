import { BaseFetcher } from "../base/BaseFetcher";

export class MyntraFetcher extends BaseFetcher {
    async search(query: string) {
        const url = `https://www.myntra.com/${encodeURIComponent(query)}`;

        return await this.navigate(url);
        
    }
}