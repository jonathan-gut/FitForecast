import "./SignUpPage.css";

export default function Signup() {
  return (
    <div className="signup-page">
      <h1 className="title">Create an Account</h1>

      <form className="signup-form">
        <input type="text" placeholder="Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit" className="button signup-button">Sign Up</button>
      </form>
    </div>
  );
}
