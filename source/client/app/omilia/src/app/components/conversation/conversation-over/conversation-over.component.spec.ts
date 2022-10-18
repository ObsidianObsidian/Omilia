import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ConversationOverComponent } from './conversation-over.component'

describe('ConversationOverComponent', () => {
  let component: ConversationOverComponent
  let fixture: ComponentFixture<ConversationOverComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConversationOverComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationOverComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
