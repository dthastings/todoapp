"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

import { Todo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);

  const handleSave = () => {
    onEdit(todo.id, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(todo.title);
    setIsEditing(false);
  };

  return (
    <li className="rounded-md border bg-background/70 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant={todo.completed ? "default" : "outline"}
          className="h-8 w-8"
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <Check className="h-4 w-4" />
        </Button>

        {isEditing ? (
          <Input
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSave();
              }
              if (event.key === "Escape") {
                handleCancel();
              }
            }}
            autoFocus
            className="h-9"
            aria-label="Edit todo"
          />
        ) : (
          <p
            className={cn(
              "flex-1 text-sm sm:text-base",
              todo.completed && "text-muted-foreground line-through",
            )}
          >
            {todo.title}
          </p>
        )}

        {isEditing ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleSave}
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleCancel}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                setEditValue(todo.title);
                setIsEditing(true);
              }}
              aria-label="Edit todo"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete todo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
