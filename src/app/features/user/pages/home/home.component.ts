import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/auth/services/user.service';
import { ChangeAmountComponent } from '../../components/change-amount.component';
import { User } from '../../../../core/auth/user.model';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home.component.html',
  providers: [DialogService, MessageService],
})
export class HomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private currentUserSubscription!: Subscription;
  currentUser: User | null = null;
  ref: DynamicDialogRef | undefined;

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.currentUserSubscription = this.userService.currentUser.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );

    this.destroyRef.onDestroy(() => {
      this.currentUserSubscription.unsubscribe();
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
  }
}
