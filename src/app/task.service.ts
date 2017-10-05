import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Task } from './task';

@Injectable()
export class TaskService {
  apiUrl = 'http://demo.sotomski.pl:8080/tasks';

  constructor(private http: Http) { }

  save(task: Task) {
    return this.http.post(this.apiUrl, task);
  }

  query() {
    return this.http.get(this.apiUrl);
  }
}
