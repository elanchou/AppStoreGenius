export type TemplateLayout = 'text-top' | 'text-bottom' | 'split-left' | 'split-right' | 'angled-right' | 'panorama-right' | 'panorama-left';

export interface TemplateConfig {
  id: string;
  name: string;
  layout: TemplateLayout;
  background: string; // Tailwind class or hex
  titleColor: string; // Tailwind class or hex
  subtitleColor: string; // Tailwind class or hex
  fontFamily: string;
}

export interface ScreenshotData {
  id: string;
  title: string;
  subtitle: string;
  appImage: string | null; // Base64 or URL
  template: TemplateConfig;
}

export interface AppDetails {
  name: string;
  description: string;
  targetAudience: string;
  keyFeatures: string[];
}
