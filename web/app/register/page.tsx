import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create account | VitalSigns",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
