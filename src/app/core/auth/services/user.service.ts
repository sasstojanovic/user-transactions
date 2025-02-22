import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { JwtService } from './jwt.service';
import { User } from '../user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());
  isAuthenticated = this.currentUser.pipe(map((user) => !!user));

  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) {}

  signin(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post<{
        user: User;
        accessToken: string;
      }>(`${this.apiUrl}/signin`, credentials)
      .pipe(tap((response) => this.setAuth(response)));
  }

  signup(userData: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  setAuth(userData: { user: User; accessToken: string }): void {
    console.log('userData: ', userData);
    this.jwtService.saveToken(userData.accessToken);
    this.saveUserId(userData.user.id);
    this.currentUserSubject.next(userData.user);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    localStorage.removeItem('userId');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User> {
    const userId = this.getUserId();

    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      tap({
        next: (user) => {
          console.log('USER: ', user);
          this.currentUserSubject.next(user);
        },
        error: () => this.purgeAuth(),
      }),
      shareReplay(1)
    );
  }

  checkUser(email: string): Observable<boolean> {
    return this.http
      .get<any[]>(`${this.apiUrl}/users?email=${email}`)
      .pipe(map((users) => users.length > 0));
  }

  private saveUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  private getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }
}
