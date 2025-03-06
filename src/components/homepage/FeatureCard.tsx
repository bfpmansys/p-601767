import { FC } from "react";

interface FeatureCardProps {
  imageUrl: string;
  title: string;
  altText: string;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  imageUrl,
  title,
  altText,
}) => {
  return (
    <div className="flex flex-col items-center gap-5 max-sm:w-[90%]">
      <img
        src={imageUrl}
        alt={altText}
        className="w-[275px] h-[162px] object-cover rounded-[11px] max-sm:w-full max-sm:h-auto"
        loading="lazy"
      />
      <h3 className="text-base italic font-medium">{title}</h3>
    </div>
  );
};
