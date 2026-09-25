export interface EntityMembershipListItem {
  entity_name: string | null;
  profile_name: string | null;
  phone: string | null;
  photo: string | null;
  roles: string[];
  status: string;
  created_at: string;
  updated_at: string;
}
