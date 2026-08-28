import crawlerRegister from "../registry/crawler.register"

export async function getProductDetails(platform: string, url: string) {
    const crawler = crawlerRegister.getPlatform(platform);

    if (!crawler) {
        throw new Error("Platform not supported");
    };

    return crawler.getProduct(url);

}