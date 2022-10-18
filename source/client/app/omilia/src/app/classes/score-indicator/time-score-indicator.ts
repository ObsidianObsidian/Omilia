import { ScoreIndicator } from './score-indicator'

export class TimeScoreIndicator extends ScoreIndicator {
  constructor (private readonly displaySeconds: boolean = false) {
    super()
  }

  override getScoreString (score: number): string {
    let seconds = Math.floor(score / 1000)
    let minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    seconds = seconds % 60
    minutes = minutes % 60
    const allUnits: Array<[number, string]> = [[hours, 'h'], [minutes, 'm']]
    if (this.displaySeconds) {
      allUnits.push([seconds, 's'])
    }
    const nbUnits = allUnits.length
    return allUnits.filter((it, idx) => it[0] > 0 || idx === nbUnits - 1).map(it => it.join('')).join(' ')
  }
}
