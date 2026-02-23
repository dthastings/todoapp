import { Todo } from "@/lib/types";

export const TODOS_STORAGE_KEY = "todo-app:v1";

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(TODOS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isTodoLike).map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
}

function isTodoLike(value: unknown): value is Todo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.completed === "boolean" &&
    typeof todo.createdAt === "number" &&
    typeof todo.updatedAt === "number"
  );
}
