import Hero from "./ui/home/hero";
import FeaturedProducts, { ProductsResponse } from "./ui/products/feature-products";
import { Metadata } from "next";
import PromoBanner from "./ui/home/promobanner";

const title = 'Swag Store | Home';
const description = 'Welcome to the Swag Store! Discover our exclusive collection. From stylish apparel to unique accessories, find the perfect swag.';

export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: title,
    description: description,
  }
};

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Hero />
      <FeaturedProducts />
    </>
  );
}
