import Hero from "./ui/hero";
import PromotionalBanner from "./components/PromotionalBanner";
import Products from "./components/Products";

export default function Home() {
  return (
    <>
      <PromotionalBanner />
      <Hero />
      <Products />
    </>
  );
}
