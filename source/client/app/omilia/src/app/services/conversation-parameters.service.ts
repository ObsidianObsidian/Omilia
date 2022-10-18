import { Injectable } from '@angular/core'
import { ScoreIndicator } from '../classes/score-indicator/score-indicator'
import { TimeScoreIndicator } from '../classes/score-indicator/time-score-indicator'

@Injectable({
  providedIn: 'root'
})
export class ConversationParametersService {
  private readonly scoreIndicator: ScoreIndicator = new TimeScoreIndicator(true)

  getScoreIndicator (): ScoreIndicator {
    return this.scoreIndicator
  }
}
