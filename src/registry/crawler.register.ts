import { BaseCrawler } from "../crawlers/BaseCrawler";
import { AmazonCrawler } from "../crawlers/amazon/AmazonCrawler";
import { FlipkartCrawler } from "../crawlers/flipkart/flipkartCrawler";
import { MyntraCrawler } from "../crawlers/myntra/MyntraCrawler";
class CrawlerRegistry {
    private crawlers: BaseCrawler[] = [];

    constructor() {
        // this.register(new MyntraCrawler());
        // this.register(new AmazonCrawler());
       this.register(new FlipkartCrawler());

    }

    register(crawler: BaseCrawler) {
        this.crawlers.push(crawler);
    }

    getAll() {
        return this.crawlers;
    };

    getPlatform(platform: string) {
        return this.crawlers.find(c => c.platform == platform);
    }
};

export default new CrawlerRegistry();