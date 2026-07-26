import { LUMI_STAGE_ID } from "./types";

export interface OwnedImageRecord {
  id: string;
  owner_extension_identifier: string | null;
}

export async function confirmExtensionOwnedImageIds(
  imageIds: Iterable<string>,
  lookup: (imageId: string) => Promise<OwnedImageRecord | null>,
): Promise<string[]> {
  const unique = [...new Set(imageIds)];
  const records = await Promise.all(unique.map(async (imageId) => {
    try {
      return await lookup(imageId);
    } catch {
      return null;
    }
  }));
  return records
    .filter((record): record is OwnedImageRecord => !!record && record.owner_extension_identifier === LUMI_STAGE_ID)
    .map((record) => record.id);
}

