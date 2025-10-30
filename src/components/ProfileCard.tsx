import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

export interface ProfileCardProps {
  name: string;
  handle: string;
  avatarSize?: number;
  children?: ReactNode;
}

export function ProfileCard({
  name,
  handle,
  avatarSize = 56,
  children,
}: ProfileCardProps) {
  return (
    <div className="profile-header">
      <Avatar size={avatarSize} />
      <div className="profile-meta">
        <div className="profile-name">{name}</div>
        <div className="profile-handle">@{handle}</div>
        {children}
      </div>
    </div>
  );
}

export default ProfileCard;
