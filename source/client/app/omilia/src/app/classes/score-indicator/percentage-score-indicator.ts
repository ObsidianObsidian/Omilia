import { ScoreIndicator } from './score-indicator'

export class PercentageScoreIndicator extends ScoreIndicator {
  override getScoreString (score: number): string {
    return `${score}%`
  }
}
