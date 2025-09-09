import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { RolePermissions, RoleFormData, Permission } from '../../../types/settings';
import { modules, permissions } from '../../../data/mockSettings';

interface RolePermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RolePermissions | null;
  onSave: (data: RoleFormData) => void;
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({
  open,
  onOpenChange,
  role,
  onSave,
}) => {
  const [rolePermissions, setRolePermissions] = useState<RoleFormData['permissions']>(() => {
    if (role) {
      return role.permissions;
    }
    return {
      timesheet: { view: false, create: false, edit: false, delete: false },
      task: { view: false, create: false, edit: false, delete: false },
      project: { view: false, create: false, edit: false, delete: false },
      client: { view: false, create: false, edit: false, delete: false },
      report: { view: false, create: false, edit: false, delete: false },
    };
  });

  React.useEffect(() => {
    if (role) {
      setRolePermissions(role.permissions);
    }
  }, [role]);

  const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module as keyof typeof prev],
        [permission]: checked,
      },
    }));
  };

  const handleSave = () => {
    if (!role) return;
    
    onSave({
      name: role.name,
      permissions: rolePermissions,
    });
  };

  const getModuleDisplayName = (module: string) => {
    switch (module) {
      case 'timesheet':
        return 'Timesheet';
      case 'task':
        return 'Task';
      case 'project':
        return 'Project';
      case 'client':
        return 'Client';
      case 'report':
        return 'Report';
      default:
        return module;
    }
  };

  const getPermissionDisplayName = (permission: string) => {
    return permission.charAt(0).toUpperCase() + permission.slice(1);
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit - {role.name}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="p-6">
          <div className="overflow-auto border border-gray-200 rounded-lg">
            <Table>
              <TableHeader className="bg-[#e6e9ee]">
                <TableRow>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                    Module
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4 text-center">
                    View
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4 text-center">
                    Create
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4 text-center">
                    Edit
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4 text-center">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module, index) => (
                  <TableRow key={module} className={index % 2 === 1 ? "bg-[#f6f7f9]" : ""}>
                    <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                      {getModuleDisplayName(module)}
                    </TableCell>
                    {permissions.map((permission) => (
                      <TableCell key={permission} className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions[module as keyof typeof rolePermissions][permission as keyof Permission]}
                          onChange={(e) => handlePermissionChange(module, permission, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#0b57d0] text-white hover:bg-blue-700"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};