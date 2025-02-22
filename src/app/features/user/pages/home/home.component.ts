import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/auth/services/user.service';
import { User } from '../../../../core/auth/user.model';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ChangeAmountComponent } from '../../components/change-amount.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [DialogService, MessageService],
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  ref: DynamicDialogRef | undefined;
  constructor(
    private userService: UserService,
    private router: Router,
    private dialogService: DialogService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.userService.currentUser.subscribe((user) => {
      this.currentUser = user;
      console.log(this.currentUser);
    });
  }

  onChangeAmount() {
    this.ref = this.dialogService.open(ChangeAmountComponent, {
      header: 'Update amount',
      width: '400px',
      modal: true,
      dismissableMask: true,
      data: { user: this.currentUser },
    });

    this.ref.onClose.subscribe(() => {
      console.log('CLOSE');
    });
  }
}
