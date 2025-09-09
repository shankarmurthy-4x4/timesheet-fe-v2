export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  country: string;
  industry: string;
  projects: number;
  manager: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: 'Active' | 'Inactive';
  products: string;
  onboardingDate: string;
  businessModel: string;
  taxId?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  contacts: Contact[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  phone: string;
  countryCode: string;
  isPrimary: boolean;
}

export interface ClientFormData {
  name: string;
  industry: string;
  products: string;
  accountManager?: string;
  onboardingDate: string;
  businessModel: string;
  taxId?: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  website?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  countryCode: string;
  phone: string;
  isPrimary?: boolean;
}