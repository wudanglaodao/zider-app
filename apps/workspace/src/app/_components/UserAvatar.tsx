type UserAvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  initials: string;
};

export function UserAvatar({ avatarUrl, className, initials }: UserAvatarProps) {
  const classes = ["ziderUserAvatar", className].filter(Boolean).join(" ");

  if (avatarUrl) {
    return (
      <span className={classes}>
        <img alt="" src={avatarUrl} />
      </span>
    );
  }

  return (
    <span className={classes}>
      <span>{initials}</span>
    </span>
  );
}
