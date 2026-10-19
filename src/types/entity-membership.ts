export type MemberRole = "administrador" | "recepcionista" | "barbeiro";
export type MembershipStatus = "ativo" | "convidado" | "inativo";

export interface EntityMembershipListItem {
  entity_id: string;
  profile_id: string;
  identity_id: string | null;
  email: string | null;
  entity_name: string | null;
  profile_name: string | null;
  phone: string | null;
  photo: string | null;
  birth_date: string | null;
  roles: MemberRole[];
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}
