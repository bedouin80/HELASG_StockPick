import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';
const TOKEN_KEY = 'auth-token';
const USERSTORE_KEY = 'user-store';

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  constructor() { }

  clean(): void {
    window.localStorage.clear();
  }

  saveToken(token: any): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  }

  getToken(): any {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token != null) {
      return JSON.parse(token);
    }
    return null;
  }

  saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user != null) {
      return JSON.parse(user);
    }
    return null;
  }

  getUserStore(guid: string): string | null {
    const text = window.localStorage.getItem(USERSTORE_KEY);
    if (text != null) {
      let userStore = JSON.parse(text);
      if (userStore != null) {
        if (userStore.guid == guid) {
          return userStore.text;
        } else return null;
      } else return null;
    } else return null;
  }

  saveUserStore(UserStore: any): void {
    window.localStorage.removeItem(USERSTORE_KEY);
    window.localStorage.setItem(USERSTORE_KEY, JSON.stringify(UserStore));
  }

  getUserName(id: number, jsontext: string): string | null {
    let userStore = JSON.parse(atob(jsontext));
    if (userStore != null) {
      for (let i: number = 0; i < userStore.length; i++) {
        if (userStore[i].Id == id) {
          return userStore[i].Name;
        }
      }
      return null;
    } else return null;
  }
}
