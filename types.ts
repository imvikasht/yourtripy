
import { ReactNode } from 'react';

export interface FeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface PricingPlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  cta: string;
}

export interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  image: string;
}
