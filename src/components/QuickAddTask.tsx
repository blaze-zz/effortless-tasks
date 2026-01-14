import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { Category } from '@/hooks/useCategories';
import { format } from 'date-fns';

interface QuickAddTaskProps {
  selectedDate: Date;
  categories: Category[];
}

export function QuickAddTask({ selectedDate, categories }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('none');
  const { createTask } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      category_id: categoryId !== 'none' ? categoryId : null,
      deadline: format(selectedDate, 'yyyy-MM-dd'),
    });

    setTitle('');
    setCategoryId('none');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task for this day..."
        className="flex-1"
      />
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No category</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={!title.trim() || createTask.isPending}>
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  );
}
