// Amazon.in search result selectors. These were previously a copy of the
// Flipkart ones (and the URL pointed at flipkart.com), which is why "amazon"
// always returned 0. Checked against live search pages 2026-10-21.
export const AmazonSelectors = {
    PRODUCT_CARD: '[data-component-type="s-search-result"][data-asin]:not([data-asin=""])',

    // Fashion cards have two h2s (brand, then title); others have one (title).
    HEADINGS: "h2",

    // .a-text-price is the struck-through MRP; skip it.
    PRICE: ".a-price:not(.a-text-price) .a-offscreen",

    IMAGE: "img.s-image",
};

export const AmazonConstants = {
    BASE_URL: "https://www.amazon.in",
    SEARCH_URL: "https://www.amazon.in/s?k=",
    // Sponsored results link through /sspa/click tracking redirects; the
    // canonical product page is always /dp/<ASIN>.
    PRODUCT_URL: (asin: string) => `https://www.amazon.in/dp/${asin}`,

    TIMEOUT: 50000
}
