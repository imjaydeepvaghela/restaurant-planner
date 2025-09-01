import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlannerComponent } from './components/planner/planner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PlannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Restaurant Planner';
}
