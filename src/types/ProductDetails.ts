export interface ProductDetails {

    id: string;

    title: string;

    brand: string;

    price: number;

    description: string;

    images: string[];

    rating: number;

    reviews: number;

    sizes: string[];

    colors: string[];

    seller?: string;

    platform: string;

    url: string;

}