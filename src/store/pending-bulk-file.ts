type BulkFile = {
  uri: string;
  name: string;
  type: string;
};

let pendingBulkFile: BulkFile | null = null;

export function setPendingBulkFile(file: BulkFile | null) {
  pendingBulkFile = file;
}

export function getPendingBulkFile() {
  return pendingBulkFile;
}

export function clearPendingBulkFile() {
  pendingBulkFile = null;
}
