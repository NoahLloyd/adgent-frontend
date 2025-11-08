export type AdIdea = {
  title: string;
  description: string;
  image: string; // base64 PNG
};

export type GenerateAdIdeasRequest = {
  company_url: string;
  additional_context?: string;
};

export type ProcessingStep = {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete';
};
