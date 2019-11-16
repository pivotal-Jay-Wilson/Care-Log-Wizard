import { Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-speed-dial-fab',
  templateUrl: './speed-dial-fab.component.html',
  styleUrls: ['./speed-dial-fab.component.scss']
})
export class SpeedDialFabComponent  {
  @Output() selected = new EventEmitter<any>();

  fabButtons = [
    {
      icon: 'slideshow'
    },
    {
      icon: 'picture_as_pdf'
    },
    {
      icon: 'email'
    }
  ];
  buttons = [];
  fabTogglerState = 'inactive';

  constructor() { }

  showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }
  selectButton(i) {
    this.selected.emit(this.fabButtons[i].icon);
  }
}
