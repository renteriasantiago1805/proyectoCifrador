import { Component } from '@angular/core';

import { Cifrador } from './cifrador/cifrador';

@Component({
  selector: 'app-root',
  imports: [Cifrador],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Proyecto de cifrado';
}
