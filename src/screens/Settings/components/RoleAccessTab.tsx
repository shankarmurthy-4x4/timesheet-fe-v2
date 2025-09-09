import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import { RolePermissions } from '../../../types/settings';

interface RoleAccessTabProps {
  roles: RolePermissions[];
  onEditRole: (role: RolePermissions) => void;
  onDeleteRole: (roleId: string) => void;
  onCreateRole: () => void;
}

export const RoleAccessTab: React.FC<RoleAccessTabProps> = ({
  roles,
  onEditRole,
  onDeleteRole,
  onCreateRole,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Role Access</h2>
          <Button
            onClick={onCreateRole}
            className="bg-[#0b57d0] text-white hover:bg-blue-700"
          >
            Create new role
          </Button>
        </div>

        <div className="overflow-auto border border-gray-200 rounded-lg">
          <Table>
            <TableHeader className="bg-[#e6e9ee]">
              <TableRow>
                <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                  Role
                </TableHead>
                <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                  Users
                </TableHead>
                <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role, index) => (
                <TableRow
                  key={role.id}
                  className={index % 2 === 1 ? "bg-[#f6f7f9]" : ""}
                >
                  <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                    {role.name}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                    {role.userCount}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRole(role)}
                        className="text-[#0b57d0] hover:text-blue-700 hover:bg-blue-50 p-1 h-auto"
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#0b57d0] hover:text-blue-700 hover:bg-blue-50 p-1 h-auto"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{role.name}" role? 
                              This action cannot be undone and will affect {role.userCount} users.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteRole(role.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};