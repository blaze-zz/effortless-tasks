import { useMemo } from 'react';
import { format, subDays, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { TrendingUp, CheckCircle2, Target, Flame, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTasks, Task } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';

export const ProgressTracker = () => {
  const { tasks } = useTasks();
  const { habits, completions } = useHabits();

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const stats = useMemo(() => {
    // Task stats
    const completedTasks = tasks.filter((t: Task) => t.status === 'done');
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Tasks completed this week
    const tasksCompletedThisWeek = completedTasks.filter((t: Task) => {
      const updatedAt = new Date(t.updated_at);
      return isWithinInterval(updatedAt, { start: weekStart, end: weekEnd });
    }).length;

    // Habit stats
    const habitCompletionsThisWeek = completions.filter(c => {
      const completedDate = new Date(c.completed_date);
      return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
    }).length;

    const totalPossibleHabits = habits.length * 7;
    const habitCompletionRate = totalPossibleHabits > 0 
      ? Math.round((habitCompletionsThisWeek / totalPossibleHabits) * 100) 
      : 0;

    // Today's progress
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayTasks = tasks.filter((t: Task) => 
      t.deadline && format(new Date(t.deadline), 'yyyy-MM-dd') === todayStr
    );
    const todayCompletedTasks = todayTasks.filter((t: Task) => t.status === 'done');
    const todayTaskProgress = todayTasks.length > 0 
      ? Math.round((todayCompletedTasks.length / todayTasks.length) * 100) 
      : 100;

    const todayHabitCompletions = completions.filter(c => c.completed_date === todayStr).length;
    const todayHabitProgress = habits.length > 0 
      ? Math.round((todayHabitCompletions / habits.length) * 100) 
      : 100;

    // Calculate longest streak across all habits
    let longestStreak = 0;
    habits.forEach(habit => {
      const habitCompletions = completions
        .filter(c => c.habit_id === habit.id)
        .map(c => c.completed_date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      for (let i = 0; i <= 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        
        if (habitCompletions.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      if (streak > longestStreak) longestStreak = streak;
    });

    return {
      completedTasks: completedTasks.length,
      totalTasks,
      taskCompletionRate,
      tasksCompletedThisWeek,
      habitCompletionsThisWeek,
      habitCompletionRate,
      todayTaskProgress,
      todayHabitProgress,
      longestStreak,
    };
  }, [tasks, habits, completions, today, weekStart, weekEnd]);

  // Weekly activity data
  const weeklyActivity = useMemo(() => {
    return weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const tasksCompleted = tasks.filter((t: Task) => 
        t.status === 'done' && 
        format(new Date(t.updated_at), 'yyyy-MM-dd') === dayStr
      ).length;
      const habitsCompleted = completions.filter(c => c.completed_date === dayStr).length;
      return {
        day: format(day, 'EEE'),
        date: day,
        tasks: tasksCompleted,
        habits: habitsCompleted,
        total: tasksCompleted + habitsCompleted,
      };
    });
  }, [weekDays, tasks, completions]);

  const maxActivity = Math.max(...weeklyActivity.map(d => d.total), 1);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.taskCompletionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.habitCompletionsThisWeek}</p>
                <p className="text-xs text-muted-foreground">Habits This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Tasks</span>
              <span className="text-muted-foreground">{stats.todayTaskProgress}%</span>
            </div>
            <Progress value={stats.todayTaskProgress} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Habits</span>
              <span className="text-muted-foreground">{stats.todayHabitProgress}%</span>
            </div>
            <Progress value={stats.todayHabitProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {weeklyActivity.map((day, i) => {
              const isToday = format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              const height = (day.total / maxActivity) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '100px' }}>
                    {day.tasks > 0 && (
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(day.tasks / maxActivity) * 100}px` }}
                      />
                    )}
                    {day.habits > 0 && (
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${(day.habits / maxActivity) * 100}px` }}
                      />
                    )}
                    {day.total === 0 && (
                      <div className="w-full bg-muted rounded h-1" />
                    )}
                  </div>
                  <span className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-muted-foreground">Tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-muted-foreground">Habits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
