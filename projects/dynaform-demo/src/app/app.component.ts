import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PoButtonModule, PoToolbarModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, PoToolbarModule, PoButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}

