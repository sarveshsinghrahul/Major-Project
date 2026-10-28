import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthForm, Field } from "../components/AuthForm";
import { useAuth } from "../store/auth";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";
  if (user) return <Navigate to={from} replace />;

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Log in"
      error={error}
      submitting={submitting}
      submitLabel="Log in"
      onSubmit={submit}
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-indigo-600">
            Create an account
          </Link>
        </>
      }
    >
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
    </AuthForm>
  );
}
