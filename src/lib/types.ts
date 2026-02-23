export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TodoFilter = "all" | "active" | "completed";
