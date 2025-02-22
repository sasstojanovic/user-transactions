import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../core/auth/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  updateAmount(userData: {
    userId: number;
    accountAmount: number;
  }): Observable<any> {
    console.log('userData: ', userData);
    return this.http.patch(`${this.apiUrl}/users/${userData.userId}`, {
      accountAmount: userData.accountAmount,
    });
  }
}
