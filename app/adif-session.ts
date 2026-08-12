export type SharedAdifRecord = {
  id: string;
  source: string;
  fields: Record<string, string>;
};

export type SharedAdifWorkspace = {
  text: string;
  name: string;
  updatedAt: number;
  workshop?: {
    records: SharedAdifRecord[];
    excluded: string[];
  };
};

const DATABASE_NAME = "adif-atlas";
const STORE_NAME = "workspace";
const ACTIVE_KEY = "active-adif";

function openDatabase() {
  return new Promise<IDBDatabase | null>((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.addEventListener("upgradeneeded", () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => resolve(null));
  });
}

export async function saveSharedAdif(
  workspace: Omit<SharedAdifWorkspace, "updatedAt">,
) {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(
      { ...workspace, updatedAt: Date.now() },
      ACTIVE_KEY,
    );
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => resolve());
    transaction.addEventListener("abort", () => resolve());
  });
  database.close();
}

export async function loadSharedAdif() {
  const database = await openDatabase();
  if (!database) return null;
  const workspace = await new Promise<SharedAdifWorkspace | null>((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(ACTIVE_KEY);
    request.addEventListener("success", () => {
      resolve((request.result as SharedAdifWorkspace | undefined) ?? null);
    });
    request.addEventListener("error", () => resolve(null));
  });
  database.close();
  return workspace;
}

export async function clearSharedAdif() {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(ACTIVE_KEY);
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => resolve());
    transaction.addEventListener("abort", () => resolve());
  });
  database.close();
}
