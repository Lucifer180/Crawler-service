export interface ProductDetails {
    id?: string;

    title: string;

    brand: string;

    description: string[];

    price: number;

    image?: string;

    images?: string[];

    rating: number;

    ratingCount?: number;

    sizes: string[];

    colors: string[];

    specifications: any;

    availability: boolean;

    platform?: string;

    url?: string;
}