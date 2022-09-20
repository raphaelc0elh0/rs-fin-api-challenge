import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (host = "database"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  return createConnection(
    Object.assign(
      defaultOptions,
      process.env.NODE_ENV === "test"
        ? { host: "localhost", database: "fin_api_test" }
        : { host }
    )
  );
};
