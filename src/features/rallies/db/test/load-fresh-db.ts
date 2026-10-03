import type * as GetDbModule from "@/shared/db/get-db";

import type * as RalliesDbModule from "../rallies-db";
import type * as StampsDbModule from "../stamps-db";

type FreshDb = {
  getDb: typeof GetDbModule.getDb;
  ralliesDb: typeof RalliesDbModule;
  stampsDb: typeof StampsDbModule;
};

// Loads the db modules in a fresh module registry: a new in-memory database
// whose tables are not set up yet, like a cold app start.
export function loadFreshDb(): FreshDb {
  let modules: FreshDb | undefined;

  jest.isolateModules(() => {
    const getDbModule = require("@/shared/db/get-db") as typeof GetDbModule;
    modules = {
      getDb: getDbModule.getDb,
      ralliesDb: require("../rallies-db") as typeof RalliesDbModule,
      stampsDb: require("../stamps-db") as typeof StampsDbModule,
    };
  });

  if (!modules) throw new Error("db modules did not load");
  return modules;
}
