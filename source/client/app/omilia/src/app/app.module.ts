import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NavBarComponent } from './components/nav-bar/nav-bar.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { WelcomeComponent } from './components/welcome/welcome.component'
import { MatButtonModule } from '@angular/material/button'
import { ConversationBoardComponent } from './components/conversation-board/conversation-board.component'
import { MatListModule } from '@angular/material/list'
import { ConversationComponent } from './components/conversation/conversation.component'
import { ConversationParticipantComponent } from './components/conversation-participant/conversation-participant.component'
import { MatIconModule } from '@angular/material/icon'
import { ScoreIndicatorComponent } from './components/score-indicator/score-indicator.component'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { ConversationOverComponent } from './components/conversation/conversation-over/conversation-over.component'
import { SelectionBoardComponent } from './components/selection-board/selection-board.component'
import { SessionComponent } from './components/session/session.component'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { HttpClientModule } from '@angular/common/http'

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    WelcomeComponent,
    ConversationBoardComponent,
    ConversationComponent,
    ConversationParticipantComponent,
    ScoreIndicatorComponent,
    ConversationOverComponent,
    SelectionBoardComponent,
    SessionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
