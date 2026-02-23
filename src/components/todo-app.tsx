"use client";

import { FormEvent, useState } from "react";

import { useTodos } from "@/hooks/use-todos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TodoFilters } from "@/components/todo-filters";
import { TodoItem } from "@/components/todo-item";

export function TodoApp() {
  const [newTodo, setNewTodo] = useState("");
  const {
    todos,
    filter,
    filteredTodos,
    activeCount,
    hasCompleted,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    setFilter,
  } = useTodos();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTodo(newTodo);
    setNewTodo("");
  };

  return (
    <Card className="w-full max-w-2xl border-orange-200/70 bg-card/95 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">Todo List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Add a task"
            aria-label="New todo"
          />
          <Button type="submit">Add</Button>
        </form>

        <ul className="space-y-2">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))
          ) : (
            <li className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              {todos.length === 0
                ? "No tasks yet. Add your first task above."
                : "No tasks for this filter."}
            </li>
          )}
        </ul>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{activeCount} active item(s)</p>

          <TodoFilters filter={filter} onFilterChange={setFilter} />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearCompleted}
            disabled={!hasCompleted}
          >
            Clear completed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
