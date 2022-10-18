import { Component, Input, OnInit } from '@angular/core'
import { ScoreIndicator } from '../../classes/score-indicator/score-indicator'

@Component({
  selector: 'app-score-indicator',
  templateUrl: './score-indicator.component.html',
  styleUrls: ['./score-indicator.component.scss']
})
export class ScoreIndicatorComponent implements OnInit {
  @Input() public score: number | undefined
  @Input() public scoreIndicator: ScoreIndicator | undefined

  displayScore (): string {
    if (this.score != null && this.scoreIndicator != null) {
      return this.scoreIndicator.getScoreString(this.score)
    }
    return '...'
  }

  scoreUndefined (): boolean {
    return this.score == null || this.scoreIndicator == null
  }

  ngOnInit (): void {
  }
}
