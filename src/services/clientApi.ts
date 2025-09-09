import { Client, Contact, ClientFormData, ContactFormData } from '../types/client';
import { mockClients } from '../data/mockClients';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key
const STORAGE_KEY = 'clients';

// Get clients from localStorage or use mock data
const getStoredClients = (): Client[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockClients;
  } catch {
    return mockClients;
  }
};

// Save clients to localStorage
const saveClients = (clients: Client[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error('Failed to save clients:', error);
  }
};

export const clientApi = {
  // Get all clients
  async getClients(): Promise<Client[]> {
    await delay(300);
    return getStoredClients();
  },

  // Get client by ID
  async getClientById(id: string): Promise<Client | null> {
    await delay(200);
    const clients = getStoredClients();
    return clients.find(client => client.id === id) || null;
  },

  // Create new client
  async createClient(data: ClientFormData): Promise<Client> {
    await delay(500);
    const clients = getStoredClients();
    
    const newClient: Client = {
      id: Date.now().toString(),
      code: `CPL-${String(clients.length + 100).padStart(3, '0')}`,
      name: data.name,
      email: `contact@${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
      country: data.country,
      industry: data.industry,
      projects: 0,
      manager: {
        id: '1',
        name: data.accountManager || 'Unassigned',
        email: 'manager@company.com',
        avatar: '/rectangle-3-1.png',
      },
      status: 'Active',
      products: data.products,
      onboardingDate: data.onboardingDate,
      businessModel: data.businessModel,
      taxId: data.taxId,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      website: data.website,
      contacts: [],
    };
    
    const updatedClients = [...clients, newClient];
    saveClients(updatedClients);
    return newClient;
  },

  // Update client
  async updateClient(id: string, data: Partial<ClientFormData>): Promise<Client> {
    await delay(400);
    const clients = getStoredClients();
    const clientIndex = clients.findIndex(client => client.id === id);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    const updatedClient = {
      ...clients[clientIndex],
      name: data.name || clients[clientIndex].name,
      industry: data.industry || clients[clientIndex].industry,
      products: data.products || clients[clientIndex].products,
      manager: {
        ...clients[clientIndex].manager,
        name: data.accountManager || clients[clientIndex].manager.name,
      },
      onboardingDate: data.onboardingDate || clients[clientIndex].onboardingDate,
      businessModel: data.businessModel || clients[clientIndex].businessModel,
      taxId: data.taxId || clients[clientIndex].taxId,
      address: data.address || clients[clientIndex].address,
      country: data.country || clients[clientIndex].country,
      state: data.state || clients[clientIndex].state,
      city: data.city || clients[clientIndex].city,
      zipCode: data.zipCode || clients[clientIndex].zipCode,
      website: data.website || clients[clientIndex].website,
    };
    
    clients[clientIndex] = updatedClient;
    saveClients(clients);
    return updatedClient;
  },

  // Update client status
  async updateClientStatus(id: string, status: 'Active' | 'Inactive'): Promise<Client> {
    await delay(300);
    const clients = getStoredClients();
    const clientIndex = clients.findIndex(client => client.id === id);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    clients[clientIndex].status = status;
    saveClients(clients);
    return clients[clientIndex];
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    await delay(300);
    const clients = getStoredClients();
    const filteredClients = clients.filter(client => client.id !== id);
    saveClients(filteredClients);
  },

  // Add contact to client
  async addContact(clientId: string, data: ContactFormData): Promise<Contact> {
    await delay(400);
    const clients = getStoredClients();
    const clientIndex = clients.findIndex(client => client.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode,
      isPrimary: data.isPrimary || false,
    };
    
    // If this is set as primary, make all others non-primary
    if (newContact.isPrimary) {
      clients[clientIndex].contacts = clients[clientIndex].contacts.map(contact => ({
        ...contact,
        isPrimary: false,
      }));
    }
    
    clients[clientIndex].contacts.push(newContact);
    saveClients(clients);
    return newContact;
  },

  // Update contact
  async updateContact(clientId: string, contactId: string, data: ContactFormData): Promise<Contact> {
    await delay(400);
    const clients = getStoredClients();
    const clientIndex = clients.findIndex(client => client.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    const contactIndex = clients[clientIndex].contacts.findIndex(contact => contact.id === contactId);
    if (contactIndex === -1) {
      throw new Error('Contact not found');
    }
    
    const updatedContact: Contact = {
      ...clients[clientIndex].contacts[contactIndex],
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode,
      isPrimary: data.isPrimary || false,
    };
    
    // If this is set as primary, make all others non-primary
    if (updatedContact.isPrimary) {
      clients[clientIndex].contacts = clients[clientIndex].contacts.map(contact => ({
        ...contact,
        isPrimary: contact.id === contactId ? true : false,
      }));
    }
    
    clients[clientIndex].contacts[contactIndex] = updatedContact;
    saveClients(clients);
    return updatedContact;
  },

  // Delete contact
  async deleteContact(clientId: string, contactId: string): Promise<void> {
    await delay(300);
    const clients = getStoredClients();
    const clientIndex = clients.findIndex(client => client.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    clients[clientIndex].contacts = clients[clientIndex].contacts.filter(contact => contact.id !== contactId);
    saveClients(clients);
  },

  // Search clients
  async searchClients(query: string): Promise<Client[]> {
    await delay(300);
    const clients = getStoredClients();
    return clients.filter(client => 
      client.name.toLowerCase().includes(query.toLowerCase()) ||
      client.code.toLowerCase().includes(query.toLowerCase()) ||
      client.email.toLowerCase().includes(query.toLowerCase()) ||
      client.country.toLowerCase().includes(query.toLowerCase()) ||
      client.industry.toLowerCase().includes(query.toLowerCase())
    );
  },
};