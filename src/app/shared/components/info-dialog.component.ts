import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, NgIf],
  templateUrl: './info-dialog.component.html',
})
export class InfoDialogComponent {
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  close() {
    this.ref.close();
  }
}
