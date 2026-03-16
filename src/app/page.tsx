import HeroSlideshow from "@/components/HeroSlideshow";
import CollectionGrid from "@/components/CollectionGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandStory from "@/components/BrandStory";
import ImageBanner from "@/components/ImageBanner";
import SplitBanner from "@/components/SplitBanner";
import InstagramFeed from "@/components/InstagramFeed";

export default function Home() {
  return (
    <>
      <HeroSlideshow />
      <CollectionGrid />
      <SplitBanner />
      <FeaturedProducts />
      <BrandStory />
      <ImageBanner />
      <InstagramFeed />
    </>
  );
}
