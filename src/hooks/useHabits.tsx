import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  frequency: string;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export const useHabits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['habit_completions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .order('completed_date', { ascending: false });
      
      if (error) throw error;
      return data as HabitCompletion[];
    },
    enabled: !!user,
  });

  const createHabit = useMutation({
    mutationFn: async (habit: { name: string; description?: string; color: string; frequency: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habit, user_id: user!.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit created!' });
    },
    onError: (error) => {
      toast({ title: 'Error creating habit', description: error.message, variant: 'destructive' });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habit_completions'] });
      toast({ title: 'Habit deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting habit', description: error.message, variant: 'destructive' });
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      const existing = completions.find(
        c => c.habit_id === habitId && c.completed_date === date
      );

      if (existing) {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .insert([{ habit_id: habitId, user_id: user!.id, completed_date: date }]);
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_completions'] });
    },
    onError: (error) => {
      toast({ title: 'Error updating habit', description: error.message, variant: 'destructive' });
    },
  });

  const isCompleted = (habitId: string, date: string) => {
    return completions.some(c => c.habit_id === habitId && c.completed_date === date);
  };

  const getStreak = (habitId: string) => {
    const habitCompletions = completions
      .filter(c => c.habit_id === habitId)
      .map(c => c.completed_date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= habitCompletions.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habitCompletions.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  return {
    habits,
    completions,
    isLoading: habitsLoading || completionsLoading,
    createHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
  };
};
