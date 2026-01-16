import { useState } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { Plus, Flame, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';

const HABIT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'
];

export const HabitTracker = () => {
  const { habits, isLoading, createHabit, deleteHabit, toggleCompletion, isCompleted, getStreak } = useHabits();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', color: '#10B981', frequency: 'daily' });

  const today = startOfDay(new Date());
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const handleCreateHabit = () => {
    if (!newHabit.name.trim()) return;
    createHabit.mutate(newHabit);
    setNewHabit({ name: '', description: '', color: '#10B981', frequency: 'daily' });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading habits...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Habit Tracker</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Habit name (e.g., Exercise, Read)"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              />
              <Input
                placeholder="Description (optional)"
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              />
              <div className="flex gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full transition-transform',
                      newHabit.color === color && 'ring-2 ring-offset-2 ring-foreground scale-110'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewHabit({ ...newHabit, color })}
                  />
                ))}
              </div>
              <Select value={newHabit.frequency} onValueChange={(v) => setNewHabit({ ...newHabit, frequency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateHabit} className="w-full" disabled={createHabit.isPending}>
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No habits yet. Add your first habit to start tracking!
          </p>
        ) : (
          <div className="space-y-4">
            {/* Date headers */}
            <div className="flex items-center gap-2 pl-[180px]">
              {last7Days.map((date) => (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'w-10 text-center text-xs font-medium',
                    format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <div>{format(date, 'EEE')}</div>
                  <div>{format(date, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Habits grid */}
            {habits.map((habit) => {
              const streak = getStreak(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-2">
                  <div className="w-[180px] flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-sm font-medium truncate">{habit.name}</span>
                    {streak > 0 && (
                      <span className="flex items-center text-xs text-orange-500">
                        <Flame className="h-3 w-3" />
                        {streak}
                      </span>
                    )}
                    <button
                      onClick={() => deleteHabit.mutate(habit.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {last7Days.map((date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const completed = isCompleted(habit.id, dateStr);
                      return (
                        <button
                          key={dateStr}
                          onClick={() => toggleCompletion.mutate({ habitId: habit.id, date: dateStr })}
                          className={cn(
                            'w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center',
                            completed
                              ? 'border-transparent'
                              : 'border-border hover:border-muted-foreground/50'
                          )}
                          style={{
                            backgroundColor: completed ? habit.color : 'transparent',
                          }}
                        >
                          {completed && <Check className="h-5 w-5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
