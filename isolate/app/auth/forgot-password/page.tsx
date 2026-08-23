import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Reset Password — PataSpace'
};

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <ForgotPasswordForm />
    </main>
  );
}
