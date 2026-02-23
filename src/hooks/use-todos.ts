"use client";

import { useEffect, useMemo, useState } from "react";
import { loadTodos, saveTodos } from "@/lib/storage";
import { Todo, TodoFilter } from "@/lib/types";

type UseTodosReturn = {
  todos: Todo[];
  filter: TodoFilter;
  filteredTodos: Todo[];
  activeCount: number;
  hasCompleted: boolean;
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: TodoFilter) => void;
};

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }, [todos, filter]);

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const hasCompleted = useMemo(
    () => todos.some((todo) => todo.completed),
    [todos],
  );

  const addTodo = (title: string) => {
    const normalized = title.trim();
    if (!normalized) {
      return;
    }

    const now = Date.now();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${now}-${Math.random().toString(36).slice(2)}`;

    const next: Todo = {
      id,
      title: normalized,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setTodos((prev) => [next, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
          : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, title: string) => {
    const normalized = title.trim();
    if (!normalized) {
      deleteTodo(id);
      return;
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, title: normalized, updatedAt: Date.now() }
          : todo,
      ),
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  return {
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
  };
}
