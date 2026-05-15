export interface User {
  id: string;
  clerk_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  siteName: string;
  category: string | null;
  folderId?: string[];
}

export interface Haul {
  id: string;
  user_id: string;
  share_id: string | null;
  title: string | null;
  products: Product[];
  is_public: boolean;
  circle_id: string | null;
  created_at: string;
}

export interface HaulWithAuthor extends Haul {
  author: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
  reaction_counts?: Record<string, number>;
  comment_count?: number;
}

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  invite_code: string;
  is_private: boolean;
  cover_color: string;
  member_count: number;
  created_at: string;
}

export interface SocialConnection {
  id: string;
  user_id: string;
  platform: 'facebook' | 'twitter' | 'instagram';
  platform_user_id: string;
  platform_username: string | null;
  connected_at: string;
}

export interface CircleMember {
  circle_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}

export interface CircleWithMembers extends Circle {
  members: CircleMember[];
  member_count: number;
}

export interface Reaction {
  id: string;
  haul_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Comment {
  id: string;
  haul_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_by: string | null;
  created_at: string;
  members: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>[];
  last_message: { body: string | null; haul_id: string | null; sender_username: string | null; created_at: string } | null;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  haul_id: string | null;
  created_at: string;
  sender: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
  haul?: HaulWithAuthor | null;
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string | null;
  type: 'reaction' | 'comment' | 'follow' | 'fork';
  haul_id: string | null;
  body: string | null;
  read: boolean;
  created_at: string;
  from_user?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}
