export function formatProfileRole(role?: string): string {
  if (!role) return "Usuário";

  return role
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}
