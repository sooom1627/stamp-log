import { deleteRally, listRallies } from "@/shared/db/rallies-db";

// Tests in one file share one in-memory database; start from no rallies.
export async function deleteAllRallies() {
  for (const rally of await listRallies()) {
    await deleteRally(rally.id);
  }
}
