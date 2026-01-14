import { useTasks, TaskStatus } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, LogOut, ListTodo, Clock, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { categories, isLoading: categoriesLoading, deleteCategory } = useCategories();

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const stats = [
    { label: 'To Do', count: todoTasks.length, icon: ListTodo, className: 'text-muted-foreground' },
    { label: 'In Progress', count: inProgressTasks.length, icon: Clock, className: 'text-primary' },
    { label: 'Completed', count: doneTasks.length, icon: CheckCheck, className: 'text-success' },
  ];

  const isLoading = tasksLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">TaskFlow</h1>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={cn('w-5 h-5', stat.className)} />
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-foreground">Categories</h2>
            <CreateCategoryDialog />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card group"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                  <button
                    onClick={() => deleteCategory.mutate(category.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-foreground">Tasks</h2>
          <CreateTaskDialog categories={categories} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">No tasks yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first task to get started
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="done">Done ({doneTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} categories={categories} />
              ))}
            </TabsContent>

            <TabsContent value="todo" className="space-y-3">
              {todoTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks to do</p>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} categories={categories} />
                ))
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3">
              {inProgressTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks in progress</p>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} categories={categories} />
                ))
              )}
            </TabsContent>

            <TabsContent value="done" className="space-y-3">
              {doneTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No completed tasks</p>
              ) : (
                doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} categories={categories} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
