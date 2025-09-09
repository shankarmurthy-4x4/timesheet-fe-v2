import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, PlusIcon, TrashIcon, HomeIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../../../components/ui/alert-dialog';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '../../../components/ui/breadcrumb';
import { ContactForm } from '../components/ContactForm';
import { ClientForm } from '../components/ClientForm';
import { ProjectListDialog } from '../components/ProjectListDialog';
import { clientApi } from '../../../services/clientApi';
import { Client, Contact, ContactFormData, ClientFormData } from '../../../types/client';
import toast from 'react-hot-toast';

export const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProjectListDialog, setShowProjectListDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // Load client data
  React.useEffect(() => {
    const loadClient = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const clientData = await clientApi.getClientById(id);
        setClient(clientData);
      } catch (error) {
        console.error('Failed to load client:', error);
        toast.error('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading client details...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Client not found</h1>
        <Button onClick={() => navigate('/clients')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'Active' | 'Inactive') => {
    try {
      const updatedClient = await clientApi.updateClientStatus(client.id, newStatus);
      setClient(updatedClient);
      toast.success(`Client status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update client status');
    }
  };

  const handleAddContact = async (data: ContactFormData) => {
    try {
      const newContact = await clientApi.addContact(client.id, data);
      const updatedClient = await clientApi.getClientById(client.id);
      if (updatedClient) {
        setClient(updatedClient);
        toast.success('Contact added successfully!');
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const handleEditContact = async (data: ContactFormData) => {
    if (!editingContact) return;
    
    try {
      await clientApi.updateContact(client.id, editingContact.id, data);
      const updatedClient = await clientApi.getClientById(client.id);
      if (updatedClient) {
        setClient(updatedClient);
        setEditingContact(null);
        toast.success('Contact updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await clientApi.deleteContact(client.id, contactId);
      const updatedClient = await clientApi.getClientById(client.id);
      if (updatedClient) {
        setClient(updatedClient);
        toast.success('Contact deleted successfully!');
      }
      setDeletingContactId(null);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const handleEditClient = async (data: ClientFormData) => {
    try {
      const updatedClient = await clientApi.updateClient(client.id, data);
      setClient(updatedClient);
      toast.success('Client updated successfully!');
    } catch (error) {
      console.error('Failed to update client:', error);
      toast.error('Failed to update client');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/clients')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/dashboard" 
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/dashboard');
                    }}
                  >
                    <HomeIcon className="h-4 w-4" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/clients" 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/clients');
                    }}
                  >
                    Clients
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">
                    {client.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300"
          >
            Export data
          </Button>
        </div>
      </div>

      {/* Client Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {client.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Status</span>
                <Select value={client.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Details */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Client Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClientForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client code</label>
                    <p className="text-sm text-gray-900">{client.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client name</label>
                    <p className="text-sm text-gray-900">{client.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="text-sm text-gray-900">{client.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Products</label>
                    <p className="text-sm text-gray-900">{client.products}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account manager</label>
                    <div 
                      className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => navigate(`/users/${client.manager.id}`)}
                    >
                      <Avatar className="w-6 h-6">
                        <img src={client.manager.avatar} alt={client.manager.name} />
                      </Avatar>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">{client.manager.name}</p>
                        <p className="text-xs text-gray-500">{client.manager.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Onboarding date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(client.onboardingDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business model</label>
                    <p className="text-sm text-gray-900">{client.businessModel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax ID / GST</label>
                    <p className="text-sm text-gray-900">{client.taxId || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900">
                    {client.address}, {client.city}, {client.state} {client.zipCode}, {client.country}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="text-sm text-gray-900">{client.website || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Details */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContactForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                {client.contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.isPrimary && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {contact.firstName} {contact.lastName}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteContact(contact.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-500">Designation</label>
                        <p className="text-gray-900">{contact.designation}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Contact number</label>
                        <p className="text-gray-900">{contact.countryCode} {contact.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-500">Email address</label>
                        <p className="text-gray-900">{contact.email}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowContactForm(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add contact
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Associated Projects */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Associated Projects</h2>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-500">Total projects</label>
                <p 
                  className="text-2xl font-bold text-blue-600 cursor-pointer hover:underline"
                  onClick={() => setShowProjectListDialog(true)}
                >
                  {client.projects}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        open={showContactForm || !!editingContact}
        onOpenChange={(open) => {
          if (!open) {
            setShowContactForm(false);
            setEditingContact(null);
          }
        }}
        onSubmit={editingContact ? handleEditContact : handleAddContact}
        initialData={editingContact || undefined}
        mode={editingContact ? 'edit' : 'create'}
      />

      {/* Client Form Modal */}
      <ClientForm
        open={showClientForm}
        onOpenChange={setShowClientForm}
        onSubmit={handleEditClient}
        initialData={client}
        mode="edit"
      />

      {/* Project List Dialog */}
      <ProjectListDialog
        open={showProjectListDialog}
        onOpenChange={setShowProjectListDialog}
        clientId={client.id}
        clientName={client.name}
      />
    </div>
  );
};