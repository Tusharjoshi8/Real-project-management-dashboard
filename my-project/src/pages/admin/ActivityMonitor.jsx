import { useApp } from "../../contexts/AppContext";
import { Activity } from "lucide-react";

export const ActivityMonitor = () => {
  const { activities } = useApp();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Activity size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold">Real-Time Activity Monitor</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-medium">
                {activity.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {activity.userName}
                    </span>{" "}
                    <span className="text-gray-600">
                      {activity.action.toLowerCase()}
                    </span>{" "}
                    <span className="font-medium">
                      {activity.entity}
                    </span>
                  </p>

                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {activity.details}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};