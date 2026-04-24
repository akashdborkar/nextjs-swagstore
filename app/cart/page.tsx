import { Metadata } from "next";
import { Cart } from "../ui/products/cart";

const title = 'Your Shopping Bag';
const description = 'Review your selected premium swag items and proceed to secure checkout.';

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

export default function CartPage() {
  return <Cart />;
}