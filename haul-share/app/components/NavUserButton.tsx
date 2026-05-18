'use client';
import { UserButton } from '@clerk/nextjs';

export default function NavUserButton({ username }: { username: string | null }) {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'h-8 w-8 ring-1 ring-[var(--border)]',
        },
      }}
    >
      {username && (
        <UserButton.MenuItems>
          <UserButton.Link
            label="My profile"
            href={`/u/${username}`}
            labelIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
              </svg>
            }
          />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
}
