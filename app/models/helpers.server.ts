import { prisma } from "~/storage/db.server.ts";

export async function checkIsRecordAuthor(
  authorId: string,
  recordId: string,
  recordType: "media"
) {
  switch (recordType) {
    case "media": {
      const record = await prisma[recordType].findUnique({
        where: {
          id: recordId,
        },
        select: {
          authorId: true,
        },
      });
      return record && record.authorId === authorId;
    }
  }
  return false;
}
