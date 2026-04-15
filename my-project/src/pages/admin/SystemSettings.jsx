import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Settings, Save } from 'lucide-react';

export const SystemSettings = () => {
  const { systemSettings, updateSystemSettings } = useApp();
  const [settings, setSettings] = useState(systemSettings);

  const handleSave = () => {
    updateSystemSettings(settings);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-6">

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">
                Temporarily disable system access for maintenance
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Notifications Enabled */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Notifications Enabled</h3>
              <p className="text-sm text-gray-600">
                Allow system to send notifications to users
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationsEnabled: e.target.checked
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Task Auto Refresh */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h3 className="font-medium">Task Auto-Refresh</h3>
              <p className="text-sm text-gray-600">
                Automatically refresh task data periodically
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.taskAutoRefresh}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taskAutoRefresh: e.target.checked
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={18} />
            Save Settings
          </button>

        </div>
      </div>
    </div>
  );
};