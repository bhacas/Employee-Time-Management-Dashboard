import React, { useState } from 'react';
import { ClockIcon, EditIcon, TrashIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TimeEntry, useTimeEntries } from '../context/TimeEntriesContext';
import NewEntryModal from './modals/NewEntryModal';
interface TimeEntryCardProps {
  entry: TimeEntry;
}
const TimeEntryCard: React.FC<TimeEntryCardProps> = ({
  entry
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const {
    deleteEntry
  } = useTimeEntries();
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteEntry(entry.id);
    }
  };
  return <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{entry.description}</h3>
          {entry.project && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {entry.project}
            </span>}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setIsEditModalOpen(true)} className="text-gray-400 hover:text-blue-500">
            <EditIcon className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500 flex items-center">
        <ClockIcon className="h-4 w-4 mr-1" />
        <span>
          {entry.startTime} - {entry.endTime} ({formatDuration(entry.duration)})
        </span>
      </div>
      <NewEntryModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} entryToEdit={entry} />
    </div>;
};
export default TimeEntryCard;