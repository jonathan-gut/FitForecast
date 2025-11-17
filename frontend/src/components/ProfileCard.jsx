import "./ProfileCard.css";

export default function ProfileCard({ email }) {
  return (
    <div className="profile-card">
      <div className="profile-name">{email}</div>
    </div>
  );
}
