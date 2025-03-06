import { FC } from "react";

export const HeroSection: FC = () => {
  return (
    <section
      className="text-center relative px-[300px] py-[100px]"
      aria-labelledby="hero-heading"
    >
      <div>
        <h1
          id="hero-heading"
          className="text-[55px] mb-10 max-md:text-[45px] max-md:px-5 max-md:py-0 max-sm:text-[32px]"
        >
          <span className="text-[red] font-bold">
            PROTECT, PREVENT, PREPARE
          </span>
          <span> : Your Trusted Partner in Fire Safety Compliance</span>
        </h1>
        <p className="text-xl max-sm:text-base">
          DESIGNED TO HELP BUREAU OF FIRE PROTECTION TO IMPROVE FIRE SAFETY
        </p>
      </div>
    </section>
  );
};
