import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";

const Auth = () => {
  return (
    <div className="auth">
      <div className="auth__form-col">
        <AuthForm />
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>
    </div>
  );
};

export default Auth;
