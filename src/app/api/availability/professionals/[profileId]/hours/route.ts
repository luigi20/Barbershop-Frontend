import { NextRequest } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";
import {
  forwardValidated,
  hoursSchema,
  invalidId,
  validProfileId,
} from "@/lib/availability-bff.server";

interface Context {
  params: Promise<{ profileId: string }>;
}

export async function GET(request: NextRequest, context: Context) {
  const { profileId } = await context.params;
  if (!validProfileId(profileId)) return invalidId();
  return forwardManagement(
    request,
    "GET",
    `/availability/professionals/${profileId}/hours`,
  );
}

export async function PUT(request: NextRequest, context: Context) {
  const { profileId } = await context.params;
  if (!validProfileId(profileId)) return invalidId();
  return forwardValidated(
    request,
    "PUT",
    `/availability/professionals/${profileId}/hours`,
    hoursSchema,
  );
}
