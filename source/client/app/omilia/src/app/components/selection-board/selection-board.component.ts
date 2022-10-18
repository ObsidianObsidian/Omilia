import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { SelectionBoardOption } from './selection-board-option'

@Component({
  selector: 'app-selection-board',
  templateUrl: './selection-board.component.html',
  styleUrls: ['./selection-board.component.scss']
})
export class SelectionBoardComponent implements OnInit {
  @Output() selection = new EventEmitter<SelectionBoardOption>()
  @Input() options: SelectionBoardOption[] = []

  ngOnInit (): void {
  }

  onSelection (selection: SelectionBoardOption): void {
    if (selection.isDisabled === false) {
      this.selection.emit(selection)
    }
  }
}
