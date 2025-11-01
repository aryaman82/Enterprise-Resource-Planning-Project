import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, CalendarDays, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isToday, isSameMonth, addMinutes } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Style constants
const BUTTON_BASE = 'h-10 px-4 rounded-lg transition-all font-medium flex items-center justify-center';
const BUTTON_BLUE = `${BUTTON_BASE} bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg`;
const BUTTON_TODAY = `${BUTTON_BASE} text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 shadow-sm`;
const CALENDAR_CONTAINER = 'min-w-[900px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
const CALENDAR_HEADER = 'grid border-b-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white';

// Status configuration
const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 border-l-4 border-l-green-500 text-green-900 hover:bg-green-100'
  },
  'in-progress': {
    icon: Clock,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-900 hover:bg-blue-100',
    animate: true
  },
  delayed: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-l-4 border-l-yellow-500 text-yellow-900 hover:bg-yellow-100'
  },
  cancelled: {
    icon: XCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50 border-l-4 border-l-red-500 text-red-900 hover:bg-red-100'
  },
  default: {
    icon: Calendar,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-50 border-l-4 border-l-gray-400 text-gray-900 hover:bg-gray-100'
  }
};

// Draggable Schedule Card Component
const DraggableScheduleCard = ({ schedule, compact = false, onEdit, onResizeStart, isResizing, viewMode, getStatusConfig, formatTimeRange, getScheduleTitle, getSchedulePosition }) => {
  const config = getStatusConfig(schedule.status);
  const Icon = config.icon;
  const position = !compact && viewMode === 'week' ? getSchedulePosition(schedule) : null;
  const showResizeHandles = !compact && viewMode === 'week';
  const isResizingCard = isResizing === schedule.id;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `schedule-${schedule.id}`,
    disabled: compact,
    data: {
      type: 'schedule',
      schedule,
    },
  });

  const style = position ? {
    position: 'absolute',
    top: position.top,
    height: position.height,
    width: 'calc(100% - 8px)',
    margin: '0 4px',
    zIndex: isResizingCard ? 50 : (isDragging ? 100 : 10),
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  } : {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(compact ? {} : { ...attributes, ...listeners })}
      onClick={(e) => {
        if (!isResizingCard) {
          e.stopPropagation();
          onEdit?.(schedule);
        }
      }}
      className={`${compact ? 'text-xs p-2' : 'p-2.5 cursor-move'} rounded-lg border ${config.bgColor} ${
        compact ? 'mb-2' : ''
      } hover:shadow-lg transition-all ${
        isResizingCard ? 'ring-2 ring-blue-500' : ''
      } group relative ${isDragging ? 'z-50' : ''}`}
      title={getScheduleTitle(schedule)}
    >
      {/* Drag handle */}
      {!compact && !isDragging && (
        <div className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Resize handle - top */}
      {showResizeHandles && !isDragging && (
        <div
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-400 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart?.(e, schedule, 'start');
          }}
          title="Resize start time"
        />
      )}

      {/* Resize handle - bottom */}
      {showResizeHandles && !isDragging && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-400 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart?.(e, schedule, 'end');
          }}
          title="Resize end time"
        />
      )}

      <div className={`flex items-center space-x-1.5 ${compact ? 'mb-1' : 'mb-1.5 flex-1 min-w-0'}`}>
        <Icon className={`h-4 w-4 ${config.iconColor} ${config.animate ? 'animate-spin' : ''}`} />
        <span className="font-bold truncate">{schedule.orderNumber}</span>
      </div>
      <div className={`text-xs font-medium opacity-90 ${compact ? '' : 'mb-1'}`}>
        {schedule.quantity} units
      </div>
      {schedule.startTime && schedule.endTime && !compact && (
        <div className="text-xs opacity-75 font-mono">
          {formatTimeRange(schedule.startTime, schedule.endTime)}
        </div>
      )}
      {schedule.startTime && compact && (
        <div className="text-xs opacity-75 font-mono mt-0.5">
          {format(new Date(schedule.startTime), 'HH:mm')}
        </div>
      )}
      {schedule.operator && !compact && (
        <div className="text-xs opacity-75 mt-1.5 flex items-center space-x-1">
          <span>👤</span>
          <span className="truncate">{schedule.operator}</span>
        </div>
      )}
    </div>
  );
};

// Droppable Time Slot Component
const DroppableTimeSlot = ({ day, hour, children, className }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${day.getTime()}-${hour}`,
    data: {
      type: 'timeSlot',
      day,
      hour,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
    >
      {children}
    </div>
  );
};

const ProductionPlanningBoard = ({ machineId, onAddSchedule, schedules = [], onEditSchedule, onUpdateSchedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [activeId, setActiveId] = useState(null);
  const [resizingSchedule, setResizingSchedule] = useState(null);
  const [resizeType, setResizeType] = useState(null); // 'start' or 'end'
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeInitialTime, setResizeInitialTime] = useState(null);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Filter schedules for this machine
  const machineSchedules = useMemo(
    () => schedules.filter(s => s.machineId === machineId || s.machine_id === machineId),
    [schedules, machineId]
  );

  const getStatusConfig = useCallback((status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.default;
  }, []);

  const formatTimeRange = useCallback((startTime, endTime) => {
    if (!startTime || !endTime) return '';
    const start = format(new Date(startTime), 'HH:mm');
    const end = format(new Date(endTime), 'HH:mm');
    return `${start} - ${end}`;
  }, []);

  const getScheduleTitle = useCallback((schedule) => {
    return `${schedule.orderNumber} - ${schedule.quantity} units - ${schedule.status} - ${formatTimeRange(schedule.startTime, schedule.endTime)} (Click to edit)`;
  }, [formatTimeRange]);

  // Memoized calendar calculations
  const { weekStart, weekEnd, weekDays, weeks } = useMemo(() => {
    const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
    const we = endOfWeek(currentDate, { weekStartsOn: 1 });
    const wd = eachDayOfInterval({ start: ws, end: we });

    const ms = startOfMonth(currentDate);
    const me = endOfMonth(currentDate);
    const md = eachDayOfInterval({ start: ms, end: me });
    
    const firstDayOfWeek = startOfWeek(ms, { weekStartsOn: 1 });
    const daysBeforeMonth = [];
    if (firstDayOfWeek < ms) {
      let currentDay = firstDayOfWeek;
      while (currentDay < ms) {
        daysBeforeMonth.push(new Date(currentDay));
        currentDay = addDays(currentDay, 1);
      }
    }

    const lastDayOfWeek = endOfWeek(me, { weekStartsOn: 1 });
    const daysAfterMonth = eachDayOfInterval({ 
      start: addDays(me, 1), 
      end: lastDayOfWeek 
    });

    const allMonthDays = [...daysBeforeMonth, ...md, ...daysAfterMonth];
    const weeksArray = [];
    for (let i = 0; i < allMonthDays.length; i += 7) {
      weeksArray.push(allMonthDays.slice(i, i + 7));
    }

    return {
      weekStart: ws,
      weekEnd: we,
      weekDays: wd,
      weeks: weeksArray
    };
  }, [currentDate]);

  const getSchedulesForDate = useCallback((date) => {
    return machineSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return isSameDay(scheduleDate, date);
    });
  }, [machineSchedules]);


  // Get all schedules for a date (for absolute positioning in week view)
  const getAllSchedulesForDate = useCallback((date) => {
    return machineSchedules.filter(schedule => {
      if (!schedule.startTime) return false;
      const scheduleDate = new Date(schedule.startTime);
      return isSameDay(scheduleDate, date);
    });
  }, [machineSchedules]);

  const navigateDate = useCallback((direction) => {
    if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 7) : addDays(prev, -7));
    } else {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleEmptySlotClick = useCallback(() => {
    onAddSchedule?.(machineId);
  }, [onAddSchedule, machineId]);

  // Drag and drop handlers using @dnd-kit
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'schedule' && overData?.type === 'timeSlot') {
      const schedule = activeData.schedule;
      const { day, hour } = overData;

      // Get the latest schedule data
      const latestSchedule = machineSchedules.find(s => s.id === schedule.id);
      if (!latestSchedule || !latestSchedule.startTime || !latestSchedule.endTime) {
        setActiveId(null);
        return;
      }
      
      // Calculate new start time based on drop position (snap to hour for now)
      // Duration is preserved, so end time adjusts automatically
      const newStartTime = new Date(day);
      newStartTime.setHours(hour, 0, 0, 0);
      
      // Calculate duration from the latest schedule data
      const oldStartTime = new Date(latestSchedule.startTime);
      const oldEndTime = new Date(latestSchedule.endTime);
      const duration = oldEndTime.getTime() - oldStartTime.getTime();
      
      // Calculate new end time (preserving duration)
      const newEndTime = new Date(newStartTime.getTime() + duration);

      // Update schedule with precise times - this will sync with the modal/form
      onUpdateSchedule?.(schedule.id, {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString()
      });
    }

    setActiveId(null);
  }, [machineSchedules, onUpdateSchedule]);

  // Resize handlers
  const handleResizeStart = useCallback((e, schedule, type) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingSchedule(schedule.id);
    setResizeType(type);
    setResizeStartY(e.clientY);
    setResizeInitialTime(type === 'start' 
      ? new Date(schedule.startTime)
      : new Date(schedule.endTime)
    );
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!resizingSchedule || !resizeType) return;

    const deltaY = e.clientY - resizeStartY;
    // Convert pixels to time (assuming 80px per hour slot)
    const pixelsPerHour = 80;
    const pixelsPerMinute = pixelsPerHour / 60;
    const totalMinutesDelta = deltaY / pixelsPerMinute;
    
    // Round to nearest 15 minutes for better UX
    const roundedMinutesDelta = Math.round(totalMinutesDelta / 15) * 15;
    
    // Find the latest schedule from state
    const schedule = machineSchedules.find(s => s.id === resizingSchedule);
    if (!schedule || !schedule.startTime || !schedule.endTime) return;

    if (resizeType === 'start') {
      // Update start time
      const newStartTime = addMinutes(resizeInitialTime, roundedMinutesDelta);
      const endTime = new Date(schedule.endTime);
      
      // Ensure start time is before end time (with minimum 15 minutes)
      const minDuration = 15; // minutes
      const minStartTime = new Date(endTime.getTime() - minDuration * 60 * 1000);
      if (newStartTime >= minStartTime) return;
      
      // Update schedule with new start time
      onUpdateSchedule?.(schedule.id, {
        startTime: newStartTime.toISOString()
      });
    } else {
      // Update end time
      const newEndTime = addMinutes(resizeInitialTime, roundedMinutesDelta);
      const startTime = new Date(schedule.startTime);
      
      // Ensure end time is after start time (with minimum 15 minutes)
      const minDuration = 15; // minutes
      const minEndTime = new Date(startTime.getTime() + minDuration * 60 * 1000);
      if (newEndTime <= minEndTime) return;
      
      // Update schedule with new end time
      onUpdateSchedule?.(schedule.id, {
        endTime: newEndTime.toISOString()
      });
    }
  }, [resizingSchedule, resizeType, resizeStartY, resizeInitialTime, machineSchedules, onUpdateSchedule]);

  const handleResizeEnd = useCallback(() => {
    setResizingSchedule(null);
    setResizeType(null);
    setResizeStartY(0);
    setResizeInitialTime(null);
  }, []);

  // Add global mouse move and up listeners for resize
  React.useEffect(() => {
    if (resizingSchedule) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingSchedule, handleResizeMove, handleResizeEnd]);

  // Calculate schedule position and height for week view
  const getSchedulePosition = useCallback((schedule) => {
    if (!schedule.startTime || !schedule.endTime) return null;
    
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: `${startHour * 80}px`, // 80px per hour
      height: `${duration * 80}px`,
      startHour,
      endHour
    };
  }, []);

  // Get active schedule for drag overlay
  const activeSchedule = useMemo(() => {
    if (!activeId || typeof activeId !== 'string') return null;
    const scheduleId = activeId.replace('schedule-', '');
    return machineSchedules.find(s => s.id.toString() === scheduleId);
  }, [activeId, machineSchedules]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigateDate('prev')} className={BUTTON_BLUE} aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goToToday} className={BUTTON_TODAY}>Today</button>
          <button onClick={() => navigateDate('next')} className={BUTTON_BLUE} aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="ml-2">
            <h3 className="text-xl font-bold text-gray-900">
              {viewMode === 'week' 
                ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {viewMode === 'week' ? 'Week View' : 'Month View'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            {(['week', 'month']).map((mode) => {
              const isActive = viewMode === mode;
              const Icon = mode === 'week' ? CalendarDays : CalendarIcon;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`${BUTTON_BASE} ${mode === 'week' ? 'border-r border-gray-300' : ''} ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  <span className="capitalize">{mode}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => onAddSchedule(machineId)} className={`${BUTTON_BLUE} space-x-2`}>
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="p-6 overflow-x-auto bg-gray-50/30">
        {viewMode === 'week' ? (
          <div className={CALENDAR_CONTAINER}>
            {/* Week Header */}
            <div className={`${CALENDAR_HEADER} grid-cols-8`}>
              <div className="p-3 font-semibold text-gray-700 text-sm border-r border-gray-200">Time</div>
              {weekDays.map((day, idx) => {
                const isDayToday = isToday(day);
                const daySchedules = getSchedulesForDate(day);
                return (
                  <div key={idx} className={`text-center p-3 border-r border-gray-200 last:border-r-0 ${
                    isDayToday ? 'bg-blue-50 border-b-2 border-b-blue-500' : ''
                  }`}>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">{format(day, 'EEE')}</div>
                    <div className={`text-xl font-bold ${isDayToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {format(day, 'd')}
                    </div>
                    {daySchedules.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 font-medium">
                        {daySchedules.length} {daySchedules.length === 1 ? 'schedule' : 'schedules'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                const isBusinessHours = hour >= 6 && hour < 22;
                return (
                  <div key={hour} className={`grid grid-cols-8 hover:bg-gray-50/50 transition-colors ${
                    !isBusinessHours ? 'bg-gray-50/30' : ''
                  }`}>
                    <div className={`text-sm font-medium py-4 px-3 border-r border-gray-200 ${
                      !isBusinessHours ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day, dayIdx) => {
                      const isDayToday = isToday(day);
                      const allDaySchedules = getAllSchedulesForDate(day);
                      
                      return (
                        <DroppableTimeSlot
                          key={dayIdx} 
                          day={day}
                          hour={hour}
                          isToday={isDayToday}
                          className={`min-h-[80px] py-2 px-2 border-r border-gray-100 last:border-r-0 relative ${
                            isDayToday ? 'bg-blue-50/20' : ''
                          } ${allDaySchedules.length === 0 ? 'hover:bg-blue-50/30' : ''}`}
                        >
                          {allDaySchedules.map((schedule) => {
                            const scheduleHour = new Date(schedule.startTime).getHours();
                            // Only render schedule in its starting hour slot (positioning handles the rest)
                            if (scheduleHour === hour) {
                              return (
                                <DraggableScheduleCard
                                  key={schedule.id}
                                  schedule={schedule}
                                  onEdit={onEditSchedule}
                                  onResizeStart={handleResizeStart}
                                  isResizing={resizingSchedule}
                                  viewMode={viewMode}
                                  getStatusConfig={getStatusConfig}
                                  formatTimeRange={formatTimeRange}
                                  getScheduleTitle={getScheduleTitle}
                                  getSchedulePosition={getSchedulePosition}
                                />
                              );
                            }
                            return null;
                          })}
                          {allDaySchedules.length === 0 && !activeId && (
                            <div 
                              onClick={() => handleEmptySlotClick()}
                              className="text-center text-gray-300 text-xs py-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              Click to add or drop schedule here
                            </div>
                          )}
                        </DroppableTimeSlot>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="min-w-[1100px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Month Header */}
            <div className={`${CALENDAR_HEADER} grid-cols-7`}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div 
                  key={day} 
                  className={`text-center text-sm font-bold text-gray-700 py-3 border-r border-gray-200 last:border-r-0 ${
                    idx >= 5 ? 'bg-red-50/50' : ''
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7 divide-x divide-gray-200 border-r border-gray-200">
              {weeks.map((week, weekIdx) => (
                <React.Fragment key={weekIdx}>
                  {week.map((day, dayIdx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);
                    const daySchedules = getSchedulesForDate(day);
                    const isWeekend = dayIdx >= 5;
                    
                    return (
                      <div
                        key={dayIdx}
                        className={`min-h-[140px] border-b border-gray-200 p-3 transition-all hover:bg-gray-50/50 ${
                          !isCurrentMonth ? 'bg-gray-50/30 opacity-60' : 'bg-white'
                        } ${isDayToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/30' : ''} ${
                          isWeekend ? 'bg-gray-50/20' : ''
                        }`}
                      >
                        <div className={`flex items-center justify-between mb-2 ${
                          isDayToday ? 'pb-2 border-b border-blue-200' : ''
                        }`}>
                          <div className={`text-base font-bold ${
                            isDayToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {format(day, 'd')}
                          </div>
                          {daySchedules.length > 0 && (
                            <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isDayToday ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {daySchedules.length}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                          {daySchedules.slice(0, 4).map((schedule) => (
                            <DraggableScheduleCard 
                              key={schedule.id} 
                              schedule={schedule} 
                              compact
                              onEdit={onEditSchedule}
                              onResizeStart={handleResizeStart}
                              isResizing={resizingSchedule}
                              viewMode={viewMode}
                              getStatusConfig={getStatusConfig}
                              formatTimeRange={formatTimeRange}
                              getScheduleTitle={getScheduleTitle}
                              getSchedulePosition={getSchedulePosition}
                            />
                          ))}
                          {daySchedules.length > 4 && (
                            <button
                              onClick={() => {
                                setViewMode('week');
                                setCurrentDate(day);
                              }}
                              className={`${BUTTON_BLUE} text-xs w-full h-8`}
                            >
                              +{daySchedules.length - 4} more
                            </button>
                          )}
                          {daySchedules.length === 0 && isCurrentMonth && (
                            <div 
                              onClick={() => onAddSchedule?.(machineId)}
                              className="text-xs text-gray-400 text-center py-2 hover:text-blue-600 hover:bg-blue-50/30 rounded cursor-pointer transition-colors"
                            >
                              Click to add
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Drag Overlay - shows schedule being dragged */}
      <DragOverlay>
        {activeSchedule ? (
          <div className="p-2.5 rounded-lg border bg-blue-50 border-l-4 border-l-blue-500 text-blue-900 shadow-lg">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="font-bold truncate">{activeSchedule.orderNumber}</span>
            </div>
            <div className="text-xs font-medium opacity-90 mb-1">
              {activeSchedule.quantity} units
            </div>
            {activeSchedule.startTime && activeSchedule.endTime && (
              <div className="text-xs opacity-75 font-mono">
                {formatTimeRange(activeSchedule.startTime, activeSchedule.endTime)}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProductionPlanningBoard;

