import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ConversationParticipantComponent } from './conversation-participant.component'

describe('ConversationParticipantComponent', () => {
  let component: ConversationParticipantComponent
  let fixture: ComponentFixture<ConversationParticipantComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConversationParticipantComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationParticipantComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
