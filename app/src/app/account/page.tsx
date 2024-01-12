"use client";

import { Paper } from "@/components/general/Paper";
import { useAuthentication } from "@/contexts/Authentication";
import { UserAvatar } from "@/components/general/UserAvatar";
import { UserProfileMenu } from "@/components/general/UserProfileMenu";

export default function Account() {
  const { user, isLoading } = useAuthentication();

  if (!isLoading && user.role === 'anonymous') {
    return <Paper className="text-center">Not logged in</Paper>;
  }

  return (
    <div className="flex flex-col items-center gap-y-[10px]">
      <div className="bg-primary rounded-xl p-2">
        <div className="flex justify-between items-center">
          <UserAvatar user={user} />
          <UserProfileMenu />
        </div>
      </div>
    </div>
  );
}
