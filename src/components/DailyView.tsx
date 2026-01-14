import { useState } from 'react';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { Category } from '@/hooks/useCategories';
import { TaskCard } from './TaskCard';
import { QuickAddTask } from './QuickAddTask';
import { cn } from '@/lib/utils';

interface DailyViewProps {
  tasks: Task[];
  categories: Category[];
}

export function DailyView({ tasks, categories }: DailyViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tasksForDate = tasks.filter((task) => {
    if (!task.deadline) return false;
    return isSameDay(new Date(task.deadline), selectedDate);
  });

  const unscheduledTasks = tasks.filter((task) => !task.deadline);

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  const completedCount = tasksForDate.filter((t) => t.status === 'done').length;
  const progressPercent = tasksForDate.length > 0 
    ? Math.round((completedCount / tasksForDate.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[180px]">
            <h2 className="font-semibold text-foreground">
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {!isToday(selectedDate) && (
          <Button variant="ghost" size="sm" onClick={goToToday} className="text-primary">
            <CalendarDays className="w-4 h-4 mr-2" />
            Go to Today
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {tasksForDate.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Daily Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {tasksForDate.length} completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Add */}
      <QuickAddTask selectedDate={selectedDate} categories={categories} />

      {/* Tasks for Selected Date */}
      <div>
        <h3 className="font-medium text-foreground mb-3">
          Tasks for {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d')}
          <span className="text-muted-foreground font-normal ml-2">
            ({tasksForDate.length})
          </span>
        </h3>
        
        {tasksForDate.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-xl border border-border">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No tasks scheduled for this day</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a task above or set a deadline on existing tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasksForDate.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} />
            ))}
          </div>
        )}
      </div>

      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <div>
          <h3 className="font-medium text-foreground mb-3">
            Unscheduled
            <span className="text-muted-foreground font-normal ml-2">
              ({unscheduledTasks.length})
            </span>
          </h3>
          <div className="space-y-3">
            {unscheduledTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} />
            ))}
            {unscheduledTasks.length > 5 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                +{unscheduledTasks.length - 5} more unscheduled tasks
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
