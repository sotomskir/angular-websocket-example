export class Task {
  id: number;
  completed: boolean;
  name: string;

  constructor(options: {
    id?: number;
    completed?: boolean;
    name?: string;
    } = {}) {
    this.id = options.id;
    this.completed = options.completed;
    this.name = options.name;
  }

}
