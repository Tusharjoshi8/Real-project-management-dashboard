import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Megaphone, Send } from 'lucide-react';
import { toast } from 'sonner';

export const Announcements = () => {
  const { announcements, addAnnouncement } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!title || !body) {
      toast.error('Please fill in all fields');
      return;
    }

    addAnnouncement({ title, body, createdBy: 'current-admin' });
    setTitle('');
    setBody('');
    toast.success('Announcement sent successfully');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Megaphone size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold">Announcements</h1>
      </div>

      <div className="grid gap-6">
        {/* Create Announcement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Create Announcement</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter announcement message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send size={18} />
              Send Announcement
            </button>
          </div>
        </div>

        {/* Past Announcements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Past Announcements</h2>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{announcement.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};