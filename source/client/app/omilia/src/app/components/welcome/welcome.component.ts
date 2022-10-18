import { Component } from '@angular/core'
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  OMILIA_INVITATION_URL = 'https://discord.com/api/oauth2/authorize?client_id=927101408052924426&permissions=274914609152&scope=applications.commands%20bot'
}
