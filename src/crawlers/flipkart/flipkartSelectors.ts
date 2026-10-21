// Flipkart's class names are generated and change every few months; prefer
// structural selectors (href patterns, attributes) wherever one exists.
// Checked against live search pages 2026-10-21.
export const FlipkartSelectors = {
    PRODUCT_CARD: "div[data-id]",

    BRAND: "div.Fo1I0b",

    // Grid layout (fashion) puts the title in this link; list layout
    // (electronics) only has it in a[title], and phones only in the image alt.
    TITLE: "a.atJtCj",
    TITLE_ATTR: "a[title]",

    SUBTITLE: "div.o_eY3O",

    PRICE: "div.hZ3P6w",

    IMAGE: "img",

    // Every product link goes to /<slug>/p/<itemId>.
    LINK: 'a[href*="/p/"]'
};
