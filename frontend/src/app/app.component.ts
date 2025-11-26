import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type ApiResponse = unknown;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly title = 'DevSecOps Frontend';

  readonly statusText = signal('Checking...');
  readonly statusOk = signal<boolean | null>(null);

  healthOutput = '';
  loginOutput = '';
  usersOutput = '';
  userOutput = '';

  username = 'admin';
  password = 'admin123';
  userId = 1;
  token: string | null = null;

  constructor(private http: HttpClient) {
    this.ping();
  }

  private get apiBase() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000';
    return `http://${host}:3000`;
  }

  private setPill(text: string, ok: boolean | null) {
    this.statusText.set(text);
    this.statusOk.set(ok);
  }

  private async request<T = ApiResponse>(path: string, options: any = {}): Promise<{ status: number; body: T }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const resp = await fetch(`${this.apiBase}${path}`, {
      ...options,
      headers,
    });
    const text = await resp.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: resp.status, body };
  }

  async ping() {
    this.setPill('Checking...', null);
    const { status, body } = await this.request('/');
    this.healthOutput = JSON.stringify(body, null, 2);
    this.setPill(status === 200 ? 'API healthy' : `API error (${status})`, status === 200);
  }

  async login() {
    const { status, body }: any = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username: this.username, password: this.password }),
    });
    this.loginOutput = JSON.stringify(body, null, 2);
    if (status === 200 && body?.token) {
      this.token = body.token;
      this.setPill('Authenticated', true);
    } else {
      this.setPill(`Login failed (${status})`, false);
    }
  }

  async getUsers() {
    const { status, body } = await this.request('/users');
    this.usersOutput = JSON.stringify(body, null, 2);
    this.setPill(status === 200 ? 'Users loaded' : `Users error (${status})`, status === 200);
  }

  async getUserById() {
    const { status, body } = await this.request(`/users/${this.userId}`);
    this.userOutput = JSON.stringify(body, null, 2);
    this.setPill(status === 200 ? `User ${this.userId} loaded` : `User error (${status})`, status === 200);
  }
}
