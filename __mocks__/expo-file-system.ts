// Jest replaces `expo-file-system` (native) with an in-memory file store.
// Only the API surface used by the app is implemented.
const files = new Map<string, string>();
const directories = new Set<string>();

type UriPart = string | File | Directory;

function joinUris(parts: UriPart[]) {
  return parts
    .map((part) => (typeof part === "string" ? part : part.uri))
    .reduce((joined, part) => `${joined.replace(/\/+$/, "")}/${part}`);
}

function parentUri(uri: string) {
  return uri.slice(0, uri.lastIndexOf("/"));
}

export class Directory {
  readonly uri: string;

  constructor(...uris: UriPart[]) {
    this.uri = joinUris(uris);
  }

  get exists() {
    return directories.has(this.uri);
  }

  create(options?: { intermediates?: boolean; idempotent?: boolean }) {
    if (this.exists) {
      if (options?.idempotent) return;
      throw new Error(`Directory already exists: ${this.uri}`);
    }
    if (!options?.intermediates && !directories.has(parentUri(this.uri))) {
      throw new Error(`Parent directory does not exist: ${this.uri}`);
    }
    directories.add(this.uri);
  }

  list() {
    return [...files.keys()]
      .filter((uri) => parentUri(uri) === this.uri)
      .map((uri) => new File(uri));
  }
}

export class File {
  uri: string;

  constructor(...uris: UriPart[]) {
    this.uri = joinUris(uris);
  }

  get name() {
    return this.uri.slice(this.uri.lastIndexOf("/") + 1);
  }

  get exists() {
    return files.has(this.uri);
  }

  write(content: string) {
    files.set(this.uri, content);
  }

  textSync() {
    const content = files.get(this.uri);
    if (content === undefined) throw new Error(`No file: ${this.uri}`);
    return content;
  }

  async move(destination: Directory | File) {
    const content = this.textSync();
    const target =
      destination instanceof Directory
        ? new File(destination, this.name)
        : destination;
    if (!directories.has(parentUri(target.uri))) {
      throw new Error(`Destination does not exist: ${target.uri}`);
    }
    files.delete(this.uri);
    files.set(target.uri, content);
    this.uri = target.uri;
  }

  delete() {
    if (!files.delete(this.uri)) throw new Error(`No file: ${this.uri}`);
  }
}

directories.add("file:///document");
directories.add("file:///cache");

export const Paths = {
  document: new Directory("file:///document"),
  cache: new Directory("file:///cache"),
};
