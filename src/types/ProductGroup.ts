export interface ProductOffer {
    platform: string;
    price: number;
    url: string;
    image: string;
}

export interface ProductGroup {
    id: string;
    title: string;
    brand?: string;
    image: string;
    offers: ProductOffer[];
}
