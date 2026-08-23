import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Log In — PataSpace'
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <LoginForm />
    </main>
  );
}
