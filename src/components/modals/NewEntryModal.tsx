import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { useTimeEntries } from '../../context/TimeEntriesContext';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';
interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: any;
}
const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  onClose,
  entryToEdit
}) => {
  const {
    addEntry,
    updateEntry
  } = useTimeEntries();
  const {
    showSuccess,
    showError
  } = useToast();
  const [date, setDate] = useState(entryToEdit?.date || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(entryToEdit?.startTime || '09:00');
  const [endTime, setEndTime] = useState(entryToEdit?.endTime || '17:00');
  const [description, setDescription] = useState(entryToEdit?.description || '');
  const [project, setProject] = useState(entryToEdit?.project || '');
  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return endMinutes - startMinutes;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) {
      showError('End time must be after start time');
      return;
    }
    const entryData = {
      date,
      startTime,
      endTime,
      description,
      duration,
      project,
      userId: entryToEdit?.userId
    };
    if (entryToEdit) {
      updateEntry(entryToEdit.id, entryData);
      showSuccess('Time entry updated successfully');
    } else {
      addEntry(entryData);
      showSuccess('Time entry added successfully');
    }
    onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {entryToEdit ? 'Edit Time Entry' : 'New Time Entry'}
              </h3>
              <button onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input type="date" id="date" required value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input type="time" id="startTime" required value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input type="time" id="endTime" required value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                  Project
                </label>
                <input type="text" id="project" value={project} onChange={e => setProject(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Project name (optional)" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea id="description" required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="What did you work on?" />
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={onClose} className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  {entryToEdit ? 'Update Entry' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>;
};
export default NewEntryModal;