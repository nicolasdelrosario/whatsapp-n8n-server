import type { NotFoundHandler } from "hono";

import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import * as HttpStatusPhrases from "@/lib/Shared/common/HttpStatusPhrases";

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `${HttpStatusPhrases.NOT_FOUND} - ${c.req.path}`,
    },
    HttpStatusCodes.NOT_FOUND,
  );
};
