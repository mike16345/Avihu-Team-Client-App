import { access, rename, rm } from "node:fs/promises";

export interface PublicationFileSystem {
  access(filePath: string): Promise<void>;
  rename(from: string, to: string): Promise<void>;
  rm(filePath: string, options: { recursive: true; force: true }): Promise<void>;
}

const defaultFileSystem: PublicationFileSystem = { access, rename, rm };

const pathExists = async (filePath: string, fileSystem: PublicationFileSystem) => {
  try {
    await fileSystem.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const getGeneratedBackupDirectory = (targetDirectory: string) => `${targetDirectory}.backup`;

export const recoverGeneratedDirectory = async (
  targetDirectory: string,
  fileSystem: PublicationFileSystem = defaultFileSystem
) => {
  if (await pathExists(targetDirectory, fileSystem)) return;

  const backupDirectory = getGeneratedBackupDirectory(targetDirectory);
  if (await pathExists(backupDirectory, fileSystem)) {
    await fileSystem.rename(backupDirectory, targetDirectory);
  }
};

export const publishGeneratedDirectory = async (
  temporaryDirectory: string,
  targetDirectory: string,
  fileSystem: PublicationFileSystem = defaultFileSystem
) => {
  await recoverGeneratedDirectory(targetDirectory, fileSystem);
  const backupDirectory = getGeneratedBackupDirectory(targetDirectory);

  if (await pathExists(backupDirectory, fileSystem)) {
    await fileSystem.rm(backupDirectory, { recursive: true, force: true });
  }

  const hadPreviousDirectory = await pathExists(targetDirectory, fileSystem);
  if (hadPreviousDirectory) {
    await fileSystem.rename(targetDirectory, backupDirectory);
  }

  try {
    await fileSystem.rename(temporaryDirectory, targetDirectory);
  } catch (publicationError) {
    if (hadPreviousDirectory) {
      try {
        await fileSystem.rename(backupDirectory, targetDirectory);
      } catch (rollbackError) {
        throw new AggregateError(
          [publicationError, rollbackError],
          `Unable to publish or restore generated assets at ${targetDirectory}`
        );
      }
    }
    throw publicationError;
  }

  if (hadPreviousDirectory) {
    try {
      await fileSystem.rm(backupDirectory, { recursive: true, force: true });
    } catch {
      // The newly published directory is valid; a later run can remove the recoverable backup.
    }
  }
};
