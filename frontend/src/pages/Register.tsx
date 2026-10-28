import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthForm, Field } from "../components/AuthForm";
import { useAuth } from "../store/auth";

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password, consent_analytics: consent });
      navigate("/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Create your account"
      error={error}
      submitting={submitting}
      submitLabel="Sign up"
      onSubmit={submit}
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-indigo-600">
            Log in
          </Link>
        </>
      }
    >
      <Field label="Name" value={name} onChange={setName} autoComplete="name" />
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="Password (8+ characters)" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>Store my quiz results and study activity so LearnPath can personalize my learning path.</span>
      </label>
    </AuthForm>
  );
}
