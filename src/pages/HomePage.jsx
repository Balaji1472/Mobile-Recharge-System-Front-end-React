import React from 'react';
import HeroSection from '../components/Hero/HeroSection';
import PopularPlans from '../components/Plans/PopularPlans';
import FeaturesSection from '../components/Features/FeaturesSection';
import FAQSection from '../components/FAQ/FAQSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularPlans />
      <FeaturesSection />
      <FAQSection />
    </>
  );
}