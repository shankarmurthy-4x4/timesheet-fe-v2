import React, { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { Avatar } from '../../../components/ui/avatar';
import { projectApi } from '../../../services/projectApi';
import { User } from '../../../types/project';

interface AddUsersFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userIds: string[]) => void;
  excludeUserIds: string[];
}

export const AddUsersForm: React.FC<AddUsersFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  excludeUserIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load users when dialog opens
  React.useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      setSearchTerm('');
      setSelectedUsers([]);
    }
  }, [open]);

  // Search users when search term changes
  React.useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers();
    } else {
      loadUsers();
    }
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await projectApi.getUsers();
      // Filter out already assigned users
      const availableUsers = usersData.filter(user => !excludeUserIds.includes(user.id));
      setUsers(availableUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await projectApi.searchUsers(searchTerm);
      // Filter out already assigned users
      const availableUsers = usersData.filter(user => !excludeUserIds.includes(user.id));
      setUsers(availableUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedUsers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Users</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <img src={user.avatar} alt={user.name} />
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUsers.includes(user.id) && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                    {!selectedUsers.includes(user.id) && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
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
            <Button 
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};