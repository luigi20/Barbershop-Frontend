import { NextRequest } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";
import {
  blockSchema,
  forwardValidated,
  invalidId,
  validBlockId,
  validProfileId,
} from "@/lib/availability-bff.server";

interface Context {
  params: Promise<{ profileId: string; blockId: string }>;
}

export async function PUT(request: NextRequest, context: Context) {
  const { profileId, blockId } = await context.params;
  if (!validProfileId(profileId) || !validBlockId(blockId)) return invalidId();
  return forwardValidated(
    request,
    "PUT",
    `/availability/professionals/${profileId}/blocks/${blockId}`,
    blockSchema,
  );
}

export async function DELETE(request: NextRequest, context: Context) {
  const { profileId, blockId } = await context.params;
  if (!validProfileId(profileId) || !validBlockId(blockId)) return invalidId();
  return forwardManagement(
    request,
    "DELETE",
    `/availability/professionals/${profileId}/blocks/${blockId}`,
  );
}
