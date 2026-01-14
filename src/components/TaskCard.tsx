import { Task, TaskStatus, useTasks } from '@/hooks/useTasks';
import { Category } from '@/hooks/useCategories';
import { Calendar, Trash2, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  categories: Category[];
}

export function TaskCard({ task, categories }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();

  const category = categories.find((c) => c.id === task.category_id);

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ id: task.id, status });
  };

  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
  const isDueToday = task.deadline && isToday(new Date(task.deadline));

  const statusConfig = {
    todo: { label: 'To Do', className: 'status-todo' },
    in_progress: { label: 'In Progress', className: 'status-in-progress' },
    done: { label: 'Done', className: 'status-done' },
  };

  return (
    <div className={cn(
      'task-card group animate-fade-in',
      task.status === 'done' && 'opacity-70'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-medium text-foreground',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {category && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md"
                style={{ 
                  backgroundColor: `${category.color}15`,
                  color: category.color 
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}

            {task.deadline && (
              <span className={cn(
                'inline-flex items-center gap-1.5 text-xs',
                isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : 'text-muted-foreground'
              )}>
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(task.deadline), 'MMM d')}
              </span>
            )}

            {task.reminder_at && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Reminder set
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteTask.mutate(task.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <Select value={task.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue>
              <span className={cn('status-badge', statusConfig[task.status].className)}>
                {statusConfig[task.status].label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">
              <span className="status-badge status-todo">To Do</span>
            </SelectItem>
            <SelectItem value="in_progress">
              <span className="status-badge status-in-progress">In Progress</span>
            </SelectItem>
            <SelectItem value="done">
              <span className="status-badge status-done">Done</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
