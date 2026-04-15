import Hero from "./ui/hero";
import PromotionalBanner from "./components/PromotionalBanner";
import Products from "./components/Products";
import { CartProvider } from "./context/Cart/CartProvider";

export default function Home() {
  return (
    <>
      <PromotionalBanner />
      <Hero />
      <Products />
    </>
  );
}
