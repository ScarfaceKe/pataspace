import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account — PataSpace'
};

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <RegisterForm />
    </main>
  );
}
