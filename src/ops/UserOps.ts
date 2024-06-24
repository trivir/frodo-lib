import {
  getUser,
  getUserConfig,
  getUsers,
  UserConfigSkeleton,
  UserSkeleton,
} from '../api/UserApi';
import { State } from '../shared/State';
import {
  createProgressIndicator,
  debugMessage,
  stopProgressIndicator,
  updateProgressIndicator,
} from '../utils/Console';
import { getMetadata } from '../utils/ExportImportUtils';
import { FrodoError } from './FrodoError';
import { ExportMetaData } from './OpsTypes';

export type User = {
  /**
   * Create an empty user export template
   * @returns {UserExportInterface} an empty user export template
   */
  createUserExportTemplate(): UserExportInterface;
  /**
   * Read user by id
   * @param {string} userId User id
   * @returns {Promise<UserSkeleton>} a promise that resolves to a user object
   */
  readUser(userId: string): Promise<UserSkeleton>;
  /**
   * Read all users.
   * @returns {Promise<UserSkeleton[]>} a promise that resolves to an array of user objects
   */
  readUsers(): Promise<UserSkeleton[]>;
  /**
   * Export a single user by id. The response can be saved to file as is.
   * @param {string} userId User id
   * @returns {Promise<UserExportInterface>} Promise resolving to a UserExportInterface object.
   */
  exportUser(userId: string): Promise<UserExportInterface>;
  /**
   * Export all users. The response can be saved to file as is.
   * @returns {Promise<UserExportInterface>} Promise resolving to a UserExportInterface object.
   */
  exportUsers(): Promise<UserExportInterface>;
};

export default (state: State): User => {
  return {
    createUserExportTemplate(): UserExportInterface {
      return createUserExportTemplate({ state });
    },
    async readUser(userId: string): Promise<UserSkeleton> {
      return readUser({ userId, state });
    },
    async readUsers(): Promise<UserSkeleton[]> {
      return readUsers({ state });
    },
    async exportUser(userId: string): Promise<UserExportInterface> {
      return exportUser({ userId, state });
    },
    async exportUsers(): Promise<UserExportInterface> {
      return exportUsers({ state });
    },
  };
};

export type UserExportSkeleton = UserSkeleton & {
  config: UserConfigSkeleton;
};

export interface UserExportInterface {
  meta?: ExportMetaData;
  user: Record<string, UserExportSkeleton>;
}

/**
 * Create an empty user export template
 * @returns {UserExportInterface} an empty user export template
 */
export function createUserExportTemplate({
  state,
}: {
  state: State;
}): UserExportInterface {
  return {
    meta: getMetadata({ state }),
    user: {},
  };
}

/**
 * Read user by id
 * @param {string} userId User id
 * @returns {Promise<UserSkeleton>} a promise that resolves to a user object
 */
export async function readUser({
  userId,
  state,
}: {
  userId: string;
  state: State;
}): Promise<UserSkeleton> {
  try {
    return getUser({ userId, state });
  } catch (error) {
    throw new FrodoError(`Error reading user ${userId}`, error);
  }
}

/**
 * Read all users.
 * @returns {Promise<UserSkeleton[]>} a promise that resolves to an array of user objects
 */
export async function readUsers({
  state,
}: {
  state: State;
}): Promise<UserSkeleton[]> {
  try {
    debugMessage({
      message: `UserOps.readUsers: start`,
      state,
    });
    const { result } = await getUsers({ state });
    debugMessage({ message: `UserOps.readUsers: end`, state });
    return result;
  } catch (error) {
    throw new FrodoError(`Error reading users`, error);
  }
}

/**
 * Export a single user by id. The response can be saved to file as is.
 * @param {string} userId User id
 * @returns {Promise<UserExportInterface>} Promise resolving to a UserExportInterface object.
 */
export async function exportUser({
  userId,
  state,
}: {
  userId: string;
  state: State;
}): Promise<UserExportInterface> {
  try {
    const user = (await readUser({
      userId,
      state,
    })) as UserExportSkeleton;
    user.config = await getUserConfig({ userId, state });
    const exportData = createUserExportTemplate({ state });
    exportData.user[userId] = user;
    return exportData;
  } catch (error) {
    throw new FrodoError(`Error exporting user ${userId}`, error);
  }
}

/**
 * Export all users. The response can be saved to file as is.
 * @returns {Promise<UserExportInterface>} Promise resolving to a UserExportInterface object.
 */
export async function exportUsers({
  state,
}: {
  state: State;
}): Promise<UserExportInterface> {
  let indicatorId: string;
  try {
    debugMessage({
      message: `UserOps.exportUsers: start`,
      state,
    });
    const exportData = createUserExportTemplate({ state });
    const users = await readUsers({ state });
    indicatorId = createProgressIndicator({
      total: users.length,
      message: 'Exporting users...',
      state,
    });
    for (const user of users) {
      updateProgressIndicator({
        id: indicatorId,
        message: `Exporting user ${user._id}`,
        state,
      });
      user.config = await getUserConfig({ userId: user._id, state });
      exportData.user[user._id] = user as UserExportSkeleton;
    }
    stopProgressIndicator({
      id: indicatorId,
      message: `Exported ${users.length} users.`,
      state,
    });
    debugMessage({ message: `UserOps.exportUsers: end`, state });
    return exportData;
  } catch (error) {
    stopProgressIndicator({
      id: indicatorId,
      message: `Error exporting users.`,
      status: 'fail',
      state,
    });
    throw new FrodoError(`Error reading users`, error);
  }
}
