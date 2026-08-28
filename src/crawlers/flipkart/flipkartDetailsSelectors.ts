export const FlipkartDetailsSelectors = {
    // Desktop PDP (www.flipkart.com served with a real desktop UA)
    TITLE: "span.VU-ZEz, h1 span, h1",
    BRAND: "span.mEh187",
    PRICE: "div.Nx9bqj.CxhGGd, div.Nx9bqj",

    MAIN_IMAGE: "img.DByuf4, img._396cs4, img._2r_T1I",
    THUMBNAILS: "div._0DkuPH img, li.YGoYIP img",
    ANY_PRODUCT_IMAGE: "img[src*='rukmini']",

    RATING: "div.XQDdHH",
    RATING_COUNT: "span.Wphh3N",

    // "Highlights" bullet list on the desktop PDP
    HIGHLIGHTS: "div._7eSDEz li, div.xFVion li, ul._7eSDEz li",
    DESCRIPTION: "div.yN\+eNk, div.cPHDOP div._4gvKMe, div._1mXcCf",

    SPECIFICATION_ROWS: "table._0ZhAN9 tr, div._3k-BhJ tr, table tr",

    SIZE_OPTIONS: "a.aJWdJI, li.hCcg1P, div._1fGeJ5, ul.hSEbzK li",
    COLOR_OPTIONS: "li.aJWdJI img, div._3Oikkh img, ul._2C41yO li img",

    OUT_OF_STOCK: "div.Z8JjpR, div._16FRp0"
};
