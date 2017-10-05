import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Task } from '../task';
import { TaskService } from '../task.service';
import { StompService } from '@stomp/ng2-stompjs';
import { Observable } from 'rxjs/Observable';
import * as Stomp from '@stomp/stompjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit, OnChanges, OnDestroy {
  subscription: any;
  messages: Observable<Stomp.Message>;
  form: FormGroup = new FormGroup({});
  tasks: Task[];
  private subscribed: boolean;
  private _counter: any;
  private count: number;
  private mq: any;

  constructor(private taskService: TaskService, private stomp: StompService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngOnInit() {
    this.taskService.query()
      .subscribe((tasks) => {
        this.tasks = tasks.json()._embedded.tasks;
        console.log(this.tasks);
        this.form = this.toFormGroup(this.tasks);
      });
    this.subscribed = false;

    // Store local reference to Observable
    // for use with template ( | async )
    this.subscribe();
  }

  public subscribe() {
    if (this.subscribed) {
      return;
    }

    // Stream of messages
    this.messages = this.stomp.subscribe('/topic/tasks');

    // Subscribe a function to be run on_next message
    this.subscription = this.messages.subscribe(this.on_next);

    this.subscribed = true;
  }

  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }

    // This will internally unsubscribe from Stomp Broker
    // There are two subscriptions - one created explicitly, the other created in the template by use of 'async'
    this.subscription.unsubscribe();
    this.subscription = null;
    this.messages = null;

    this.subscribed = false;
  }

  ngOnDestroy() {
    // this.unsubscribe();
  }

  public onSendMessage() {
    const _getRandomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.stomp.publish('/topic/ng-demo-sub',
      `{ type: "Test Message", data: [ ${this._counter}, ${_getRandomInt(1, 100)}, ${_getRandomInt(1, 100)}] }`);

    this._counter++;
  }

  /** Consume a message from the stomp */
  public on_next = (message: Stomp.Message) => {

    // Store message in "historic messages" queue
    // this.mq.push(message.body + '\n');

    // Count it
    this.count++;

    // Log it to the console
    const task = JSON.parse(message.body);
    console.log(task);
    this.form.controls[task.id].setValue(task.completed);
  }

  toFormGroup(tasks: Task[]) {
    const group: any = {};

    tasks.forEach(task => {
      group[task.id] = new FormControl(task.completed);
      group[task.id].valueChanges.forEach((value) => {
        if (task.completed !== value) {
          task.completed = value;
          this.stomp.publish('/app/hello', JSON.stringify(task));
          this.taskService.save(task)
            .subscribe((resp) => {
                console.log('saved', task);
              },
              (error) => {
                console.log('error saving:', task, error);
              });
        }
      });
    });
    return new FormGroup(group);
  }

}
