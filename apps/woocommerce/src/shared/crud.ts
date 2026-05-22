import todosStore, { type ITodoItem } from "../stores/todo";
import alertStore from "../stores/alert";

interface ISaveTodos {
  id: number;
  todos: ITodoItem[];
}

export async function fetchTodos(id: number) {
    const response = await fetch(`/api/todos/${id}`);
    const todos = await response.json();
    todosStore.setState({ todoList: todos.data });
  }

export async function saveTodos({ id, todos }: ISaveTodos) {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todos),
  });

  if (!response.ok) {
    console.log('huh?');
    const alertState = alertStore.getState();
    const data = await response.json();
    alertState.setConfig({
      message: data.message || 'Failed to save todo.',
      opened: true,
      icon: 'exclamation-triangle',
      closeable: true,
    });
  }
}
