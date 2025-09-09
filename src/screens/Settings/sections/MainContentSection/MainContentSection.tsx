import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { GeneralSettingsTab } from "../../components/GeneralSettingsTab";
import { RoleAccessTab } from "../../components/RoleAccessTab";
import { RolePermissionModal } from "../../components/RolePermissionModal";
import { CreateRoleModal } from "../../components/CreateRoleModal";
import { settingsApi } from "../../../../services/settingsApi";
import { GeneralSettings, RolePermissions, SettingsFormData, RoleFormData } from "../../../../types/settings";
import toast from "react-hot-toast";

export const MainContentSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'general' | 'roles'>('general');
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    dailyWorkingHours: 8,
    weeklyWorkingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RolePermissions | null>(null);

  // Load data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [settingsData, rolesData] = await Promise.all([
          settingsApi.getGeneralSettings(),
          settingsApi.getRoles(),
        ]);
        setGeneralSettings(settingsData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveGeneralSettings = async (data: SettingsFormData) => {
    try {
      const updatedSettings = await settingsApi.updateGeneralSettings(data);
      setGeneralSettings(updatedSettings);
      toast.success('General settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleEditRole = (role: RolePermissions) => {
    setEditingRole(role);
    setShowPermissionModal(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await settingsApi.deleteRole(roleId);
      setRoles(roles.filter(role => role.id !== roleId));
      toast.success('Role deleted successfully!');
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleSaveRole = async (data: RoleFormData) => {
    try {
      if (editingRole) {
        const updatedRole = await settingsApi.updateRole(editingRole.id, data);
        setRoles(roles.map(role => role.id === editingRole.id ? updatedRole : role));
        toast.success('Role updated successfully!');
      } else {
        const newRole = await settingsApi.createRole(data);
        setRoles([...roles, newRole]);
        toast.success('Role created successfully!');
      }
      setShowPermissionModal(false);
      setShowCreateRoleModal(false);
      setEditingRole(null);
    } catch (error) {
      console.error('Failed to save role:', error);
      toast.error('Failed to save role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {/* Header */}
      <header className="w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Settings
        </h1>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-0 w-full">
        <Button
          variant={activeTab === 'general' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('general')}
          className={`rounded-none rounded-tl-md rounded-tr-md border-b-0 ${
            activeTab === 'general' 
              ? 'bg-[#172b4d] text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          General settings
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('roles')}
          className={`rounded-none rounded-tl-md rounded-tr-md border-b-0 ${
            activeTab === 'roles' 
              ? 'bg-[#172b4d] text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Role access
        </Button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'general' && (
          <GeneralSettingsTab
            settings={generalSettings}
            onSave={handleSaveGeneralSettings}
          />
        )}
        
        {activeTab === 'roles' && (
          <RoleAccessTab
            roles={roles}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onCreateRole={() => {
              setEditingRole(null);
              setShowCreateRoleModal(true);
            }}
          />
        )}
      </div>

      {/* Role Permission Modal */}
      <RolePermissionModal
        open={showPermissionModal}
        onOpenChange={setShowPermissionModal}
        role={editingRole}
        onSave={handleSaveRole}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        open={showCreateRoleModal}
        onOpenChange={setShowCreateRoleModal}
        onSave={handleSaveRole}
      />
    </section>
  );
};