import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class adminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isAdmin = sessionStorage.getItem('isAdmin');

    if (isAdmin === 'true') {
      return true;
    }

    // ❌ Block direct access
    this.router.navigate(['/']);
    return false;
  }
}
