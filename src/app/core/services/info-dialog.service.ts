import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { InfoDialogComponent } from '../../shared/components/info-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class InfoDialogService {
  constructor(private dialogService: DialogService) {}

  showMessage(title: string, message: string) {
    this.dialogService.open(InfoDialogComponent, {
      header: title,
      width: '400px',
      data: { title, message },
    });
  }
}
