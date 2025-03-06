
import { FC, useState } from "react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    imageUrl:
      "/images/carousel/fsts.png",
    title: "Fire Safety Training Sessions",
    altText: "Fire Safety Training Sessions",
  },
  {
    imageUrl:
      "/images/carousel/taw.png",
    title: "Team at Work",
    altText: "Team at Work",
  },
  {
    imageUrl:
      "/images/carousel/success.png",
    title: "Success Stories",
    altText: "Success Stories",
  },
];

export const FeaturesCarousel: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : features.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0));
  };

  // Calculate indices for visible cards
  const prevIndex = (currentIndex - 1 + features.length) % features.length;
  const nextIndex = (currentIndex + 1) % features.length;

  return (
    <section
      className="flex items-center justify-center gap-10 p-10 max-md:flex-col"
      aria-label="Features"
    >
      <button
        onClick={handlePrev}
        className="focus:outline-none"
        aria-label="Previous feature"
      >
        <img
          src="/images/assets/left.png"
          alt="Previous"
          className="w-[100px] h-[100px] cursor-pointer max-sm:w-[60px] max-sm:h-[60px]"
          loading="lazy"
        />
      </button>

      <div className="flex gap-[60px] items-center max-md:flex-col max-md:items-center">
        <div className="transition-all duration-300 transform scale-75">
          <FeatureCard {...features[prevIndex]} />
        </div>
        <div className="transition-all duration-300 transform scale-125 z-10">
          <FeatureCard {...features[currentIndex]} />
        </div>
        <div className="transition-all duration-300 transform scale-75">
          <FeatureCard {...features[nextIndex]} />
        </div>
      </div>

      <button
        onClick={handleNext}
        className="focus:outline-none"
        aria-label="Next feature"
      >
        <img
          src="/images/assets/right.png"
          alt="Next"
          className="w-[100px] h-[100px] cursor-pointer max-sm:w-[60px] max-sm:h-[60px]"
          loading="lazy"
        />
      </button>
    </section>
  );
};
