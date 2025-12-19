import { setRequestLocale } from "next-intl/server";
import { HeroSection, PartnerMarquee, TestimonialsSection, FaqSection } from "@/components/home";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <PartnerMarquee />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
