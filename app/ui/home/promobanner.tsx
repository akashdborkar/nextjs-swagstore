import { getPromo } from '@/app/services/promoService';
import PromoBannerClient from './promo-banner-client';

export default async function PromoBanner() {
  const promo = await getPromo();

  if (!promo) {
    return null;
  }

  return <PromoBannerClient promo={promo} />;
}
