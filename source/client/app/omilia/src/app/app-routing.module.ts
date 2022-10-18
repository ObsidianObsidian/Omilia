import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { WelcomeComponent } from './components/welcome/welcome.component'
import { SessionComponent } from './components/session/session.component'

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'session/:sessionId', component: SessionComponent },
  { path: '**', redirectTo: '/welcome' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
