import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSnackBarConfig } from '@angular/material/snack-bar/snack-bar-config'

export enum MessageType {
  Error = 'error',
  Confirmation = 'confirmation',
  Information = 'info'
}

const errorTypeToClass = new Map<MessageType, string>([
  [MessageType.Error, 'notification-snackbar-error'],
  [MessageType.Information, 'notification-snackbar-information'],
  [MessageType.Confirmation, 'notification-snackbar-confirmation']
])

@Injectable({
  providedIn: 'root'
})

export class NotificationsService {
  constructor (private readonly matSnackBar: MatSnackBar) {}
  private _audioLevel: number = 1

  displaySnackBar (message: string, type: MessageType, action?: string, config: MatSnackBarConfig = {}): void {
    config.panelClass = errorTypeToClass.get(type)
    this.matSnackBar.open(message, action, config)
  }

  playSound (src: string): void {
    const audio = new Audio(src)
    audio.volume = this._audioLevel
    void audio.play()
  }

  set audioLevel (level: number) {
    if (level < 0 || level > 1) {
      throw new Error('Audio level must be between 0 and 1')
    }
    this._audioLevel = level
  }

  get audioLevel (): number {
    return this._audioLevel
  }
}
