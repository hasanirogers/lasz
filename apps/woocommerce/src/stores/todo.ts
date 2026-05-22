import { createStore } from 'zustand/vanilla';
import lodashSet from 'lodash-es/set';
import lodashPullAt from 'lodash-es/pullAt';

export interface ITodoItem {
  value: string;
  checked?: boolean;
};

export interface ITodoStore {
  todoList: ITodoItem[];
  addTodo: (newTodo: ITodoItem) => void;
  addTodoAll: (newTodos: ITodoItem[]) => void;
  removeTodo: (index: number) => void;
  removeTodoAll: () => void;
  todoToggle: (index: number) => void;
};

const store = createStore<ITodoStore>(set => ({
  todoList: [],
  addTodo: (newTodo) => set(state => ({ todoList: [...state.todoList, newTodo] })),
  addTodoAll: (newTodos) => set(state => ({ todoList: [...state.todoList, ...newTodos] })),
  removeTodo: (index) => set(state => {
    lodashPullAt(state.todoList, index)
    return { todoList: state.todoList };
  }),
  removeTodoAll: () => set(() => ({ todoList: [] })),
  todoToggle: (index) => set((state) => lodashSet(state, `todoList[${index}].checked`, !state.todoList[index].checked)),
}));

export default store;
