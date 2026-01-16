import { PrismaClient, Prisma } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getUrl } from "./db-url";

const adapter = new PrismaPg({
  connectionString: getUrl(),
});

const g = globalThis as unknown as {
  prisma: PrismaClient;
};

export const db =
  g.prisma ||
  new PrismaClient({
    adapter,
    log: ["info", { emit: "event", level: "query" }],
  }).$on("query", (e) => {
    if (process.env.DATABASE_LOGGING === "true") {
      console.log({
        query: e.query,
        params: e.params,
        duration: e.duration,
      });

      const parsedParams = JSON.parse(e.params) as Array<string>;
      let mappedQuery = e.query;

      parsedParams.forEach((paramValue, index) => {
        mappedQuery = mappedQuery.replace(
          `$${index + 1}`,
          !isNaN(parseFloat(paramValue)) ? paramValue : `'${paramValue}'`,
        );
      });

      console.log("Mapped Query:", mappedQuery);
    }
  });

g.prisma = db;

export const PrismaClientUnknownRequestError =
  Prisma.PrismaClientUnknownRequestError;
export const PrismaClientValidationError = Prisma.PrismaClientValidationError;
export const PrismaClientInitializationError =
  Prisma.PrismaClientInitializationError;
export const PrismaClientRustPanicError = Prisma.PrismaClientRustPanicError;
export const PrismaClientKnownRequestError =
  Prisma.PrismaClientKnownRequestError;
