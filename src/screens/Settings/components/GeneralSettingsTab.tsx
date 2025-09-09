import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { GeneralSettings, SettingsFormData } from '../../../types/settings';
import { weekDays } from '../../../data/mockSettings';

interface GeneralSettingsTabProps {
  settings: GeneralSettings;
  onSave: (data: SettingsFormData) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onSave,
}) => {
  const [dailyWorkingHours, setDailyWorkingHours] = useState(settings.dailyWorkingHours);
  const [selectedDays, setSelectedDays] = useState<string[]>(settings.weeklyWorkingDays);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = () => {
    onSave({
      dailyWorkingHours,
      weeklyWorkingDays: selectedDays,
    });
  };

  const handleCancel = () => {
    setDailyWorkingHours(settings.dailyWorkingHours);
    setSelectedDays(settings.weeklyWorkingDays);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">General settings</h2>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-gray-600 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#172b4d] text-white hover:bg-[#0f1f3a]"
            >
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Daily Working Hours */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-4">Set daily working hours</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Hours</label>
              <Input
                type="number"
                min="1"
                max="24"
                value={dailyWorkingHours}
                onChange={(e) => setDailyWorkingHours(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          {/* Weekly Working Days */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-4">Set weekly working days</h3>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map((day) => (
                <Button
                  key={day}
                  variant={selectedDays.includes(day) ? 'default' : 'outline'}
                  onClick={() => handleDayToggle(day)}
                  className={`${
                    selectedDays.includes(day)
                      ? 'bg-[#0b57d0] text-white hover:bg-blue-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};