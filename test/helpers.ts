import type { Context } from "hono";
import type { ServicesContainer } from "../src/lib/Shared/infrastructure/services/createServicesContainer";

type FakeContextOptions = {
  body: unknown;
  services: ServicesContainer;
};

export function createContext({ body, services }: FakeContextOptions) {
  return {
    req: {
      json: async () => body,
    },
    get: (key: string) => {
      if (key === "services") {
        return services;
      }

      return undefined;
    },
    json: (payload: unknown, status: number) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: {
          "content-type": "application/json",
        },
      }),
  } as unknown as Context;
}

export async function readJsonResponse(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}
