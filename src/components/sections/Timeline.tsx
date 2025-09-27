import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { MultiSelect } from '../ui/MultiSelect';
import { DateField } from '../ui/DateField';
import { generateId } from '../../lib/utils';

const eventTypes = [
  { id: 'initialInjury', label: 'Initial Injury' },
  { id: 'mdVisit', label: 'MD Visit' },
  { id: 'dxImaging', label: 'Diagnostic Imaging' },
  { id: 'medication', label: 'Medication' },
  { id: 'rehabVisit', label: 'Rehabilitation Visit' },
  { id: 'other', label: 'Other' }
];

export function Timeline() {
  const { register, watch, setValue } = useFormContext();
  const selectedParts = watch('selectedParts') || [];
  const timelineEvents = watch('timeline') || [];
  
  const addEvent = () => {
    const newEvent = {
      id: generateId(),
      date: '',
      bodyParts: [],
      eventType: [],
      description: ''
    };
    setValue('timeline', [...timelineEvents, newEvent]);
  };

  const removeEvent = (index: number) => {
    const newEvents = [...timelineEvents];
    newEvents.splice(index, 1);
    setValue('timeline', newEvents);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(timelineEvents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setValue('timeline', items);
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="timeline">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {timelineEvents.map((event, index) => (
                <Draggable 
                  key={event.id || `event-${index}`} 
                  draggableId={event.id || `event-${index}`} 
                  index={index}
                >
                  {(provided) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="mt-2 cursor-grab text-gray-400 hover:text-gray-600"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <DateField
                              label="Date"
                              required
                              {...register(`timeline.${index}.date`)}
                            />
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Event Type
                              </label>
                              <MultiSelect
                                options={eventTypes}
                                value={watch(`timeline.${index}.eventType`) || []}
                                onChange={(value) => setValue(`timeline.${index}.eventType`, value)}
                                placeholder="Select event types..."
                              />
                            </div>
                          </div>

                          {(watch(`timeline.${index}.eventType`) || []).includes('other') && (
                            <FormField
                              label="Specify Event Type"
                              {...register(`timeline.${index}.eventTypeOther`)}
                              required
                            />
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Body Parts
                            </label>
                            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                              {selectedParts.map((partId) => (
                                <label key={`${event.id}-${partId}`} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    {...register(`timeline.${index}.bodyParts`)}
                                    value={partId}
                                    className="mr-2 rounded border-gray-300"
                                  />
                                  {partId}
                                </label>
                              ))}
                            </div>
                          </div>

                          <FormField
                            label="Description"
                            {...register(`timeline.${index}.description`)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeEvent(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        type="button"
        onClick={addEvent}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Event
      </Button>
    </div>
  );
}