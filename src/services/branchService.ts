import { branches, type Branch } from "@/data/marketing/branches";

export async function getBranches(): Promise<Branch[]> {
  return branches;
}

export async function searchBranches(query: string): Promise<Branch[]> {
  const q = query.trim().toLowerCase();
  if (!q) return branches;
  return branches.filter(
    (b) =>
      b.city.toLowerCase().includes(q) ||
      b.state.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q),
  );
}

export async function getBranchById(id: string): Promise<Branch | null> {
  return branches.find((b) => b.id === id) ?? null;
}
