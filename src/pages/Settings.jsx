import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';

const Settings = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your admin panel settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Travel Lounge Admin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="admin@travellounge.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>(GMT-12:00) International Date Line West</option>
                  <option>(GMT-11:00) Midway Island, Samoa</option>
                  <option>(GMT-10:00) Hawaii</option>
                  <option>(GMT-09:00) Alaska</option>
                  <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                  <option>(GMT-07:00) Arizona</option>
                  <option>(GMT-06:00) Central America</option>
                  <option selected>(GMT-05:00) Eastern Time (US & Canada)</option>
                  <option>(GMT-04:00) Atlantic Time (Canada)</option>
                </select>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Settings</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Enable</button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password Change</h4>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Change</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;