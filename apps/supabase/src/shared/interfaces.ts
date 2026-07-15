export interface IProfile {
  id: number;
  uuid: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
  first_name: string;
  last_name: string;
  bio: string;
  following: number[],
  role?: IRole;
  avatar: string;
  member_id?: string;
  member_free_pass?: boolean;
}

export interface IRole {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface IAvatar {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null,
  caption: string | null,
  width: number;
  height: number;
  formats: any,
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null,
  provider: string;
  provider_metadata: string | null,
  created_at: string;
  updated_at: string;
  published_at: string;
}
