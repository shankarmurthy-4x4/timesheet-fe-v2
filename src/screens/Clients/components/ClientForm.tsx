import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { industries, businessModels, countries, states } from '../../../data/mockClients';
import { ClientFormData } from '../../../types/client';

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  industry: z.string().min(1, 'Industry is required'),
  products: z.string().min(1, 'Products is required'),
  accountManager: z.string().optional(),
  onboardingDate: z.string().min(1, 'Onboarding date is required'),
  businessModel: z.string().min(1, 'Business model is required'),
  taxId: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  website: z.string().optional(),
});

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: Partial<ClientFormData>;
  mode: 'create' | 'edit';
}

export const ClientForm: React.FC<ClientFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  const selectedCountry = watch('country');

  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof ClientFormData, value);
      });
    }
  }, [initialData, setValue]);

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = (data: ClientFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Client' : 'Edit Client'}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Client Name */}
          <div>
            <Input
              {...register('name')}
              placeholder="Client name"
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Industry and Products */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select onValueChange={(value) => setValue('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
              )}
            </div>
            <div>
              <Input
                {...register('products')}
                placeholder="Products"
                className="w-full"
              />
              {errors.products && (
                <p className="text-red-500 text-sm mt-1">{errors.products.message}</p>
              )}
            </div>
          </div>

          {/* Account Manager and Onboarding Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                {...register('accountManager')}
                placeholder="Account manager (optional)"
                className="w-full"
              />
            </div>
            <div className="relative">
              <Input
                {...register('onboardingDate')}
                type="date"
                placeholder="Onboarding date"
                className="w-full"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {errors.onboardingDate && (
                <p className="text-red-500 text-sm mt-1">{errors.onboardingDate.message}</p>
              )}
            </div>
          </div>

          {/* Business Model and Tax ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select onValueChange={(value) => setValue('businessModel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Business model" />
                </SelectTrigger>
                <SelectContent>
                  {businessModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessModel && (
                <p className="text-red-500 text-sm mt-1">{errors.businessModel.message}</p>
              )}
            </div>
            <div>
              <Input
                {...register('taxId')}
                placeholder="Tax ID / GST (optional)"
                className="w-full"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Input
              {...register('address')}
              placeholder="Address"
              className="w-full"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Country and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select onValueChange={(value) => setValue('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>
            <div>
              <Select 
                onValueChange={(value) => setValue('state', value)}
                disabled={!selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCountry && states[selectedCountry as keyof typeof states]?.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* City and Zip Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                {...register('city')}
                placeholder="City"
                className="w-full"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1 border border-red-500 rounded px-2 py-1">
                  This field is required
                </p>
              )}
            </div>
            <div>
              <Input
                {...register('zipCode')}
                placeholder="Zip code"
                className="w-full"
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <Input
              {...register('website')}
              placeholder="Website (optional)"
              className="w-full"
            />
            <p className="text-gray-500 text-sm mt-1">Hint text for help user</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0b57d0] text-white">
              {mode === 'create' ? 'Add client' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};