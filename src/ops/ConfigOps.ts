import { AgentSkeleton } from '../api/AgentApi';
import { IdObjectSkeletonInterface } from '../api/ApiTypes';
import { AuthenticationSettingsSkeleton } from '../api/AuthenticationSettingsApi';
import { CircleOfTrustSkeleton } from '../api/CirclesOfTrustApi';
import { SecretSkeleton } from '../api/cloud/SecretsApi';
import { VariableSkeleton } from '../api/cloud/VariablesApi';
import { NodeSkeleton } from '../api/NodeApi';
import { OAuth2ClientSkeleton } from '../api/OAuth2ClientApi';
import { PolicySkeleton } from '../api/PoliciesApi';
import { PolicySetSkeleton } from '../api/PolicySetApi';
import { RealmSkeleton } from '../api/RealmApi';
import { ResourceTypeSkeleton } from '../api/ResourceTypesApi';
import { Saml2ProviderSkeleton } from '../api/Saml2Api';
import { ScriptSkeleton } from '../api/ScriptApi';
import { ScriptTypeSkeleton } from '../api/ScriptTypeApi';
import { AmServiceSkeleton } from '../api/ServiceApi';
import { SocialIdpSkeleton } from '../api/SocialIdentityProvidersApi';
import Constants from '../shared/Constants';
import { State } from '../shared/State';
import {
  createProgressIndicator,
  stopProgressIndicator,
  updateProgressIndicator,
} from '../utils/Console';
import {
  exportOrImportWithErrorHandling,
  getMetadata,
} from '../utils/ExportImportUtils';
import { getRealmUsingExportFormat } from '../utils/ForgeRockUtils';
import { exportAgents, importAgents } from './AgentOps';
import {
  ApplicationSkeleton,
  exportApplications,
  importApplications,
} from './ApplicationOps';
import {
  exportAuthenticationSettings,
  importAuthenticationSettings,
} from './AuthenticationSettingsOps';
import {
  CirclesOfTrustExportInterface,
  exportCirclesOfTrust,
  importCirclesOfTrust,
} from './CirclesOfTrustOps';
import { exportSecrets } from './cloud/SecretsOps';
import { exportVariables } from './cloud/VariablesOps';
import {
  EmailTemplateSkeleton,
  exportEmailTemplates,
  importEmailTemplates,
} from './EmailTemplateOps';
import { FrodoError } from './FrodoError';
import { exportConfigEntities, importConfigEntities } from './IdmConfigOps';
import {
  exportSocialIdentityProviders,
  importSocialIdentityProviders,
} from './IdpOps';
import {
  exportJourneys,
  importJourneys,
  SingleTreeExportInterface,
} from './JourneyOps';
import { exportNodes } from './NodeOps';
import { exportOAuth2Clients, importOAuth2Clients } from './OAuth2ClientOps';
import { ExportMetaData } from './OpsTypes';
import { exportPolicies, importPolicies } from './PolicyOps';
import { exportPolicySets, importPolicySets } from './PolicySetOps';
import { exportRealms } from './RealmOps';
import { exportResourceTypes, importResourceTypes } from './ResourceTypeOps';
import { exportSaml2Providers, importSaml2Providers } from './Saml2Ops';
import { exportScripts, importScripts } from './ScriptOps';
import { exportScriptTypes } from './ScriptTypeOps';
import {
  exportSecretStores,
  SecretStoreExportSkeleton,
} from './SecretStoreOps';
import { exportServers, ServerExportSkeleton } from './ServerOps';
import { exportServices, importServices } from './ServiceOps';
import { exportThemes, importThemes, ThemeSkeleton } from './ThemeOps';
import { exportUsers, UserExportSkeleton } from './UserOps';

export type Config = {
  /**
   * Export full configuration
   * @param {FullExportOptions} options export options
   * @param {Error[]} collectErrors optional parameters to collect errors instead of having the function throw. Pass an empty array to collect errors and report on them but have the function perform all it can and return the export data even if it encounters errors.
   * @returns {Promise<FullExportInterface>} a promise resolving to a full export object
   */
  exportFullConfiguration(
    options: FullExportOptions,
    collectErrors?: Error[]
  ): Promise<FullExportInterface>;
  /**
   * Import full configuration
   * @param {FullExportInterface} importData import data
   * @param {FullImportOptions} options import options
   * @param {Error[]} collectErrors optional parameters to collect errors instead of having the function throw. Pass an empty array to collect errors and report on them but have the function perform all it can and return the export data even if it encounters errors.
   */
  importFullConfiguration(
    importData: FullExportInterface,
    options: FullImportOptions,
    collectErrors?: Error[]
  ): Promise<void>;
};

export default (state: State): Config => {
  return {
    async exportFullConfiguration(
      options: FullExportOptions = {
        useStringArrays: true,
        noDecode: false,
        coords: true,
        includeDefault: false,
      },
      collectErrors: Error[]
    ) {
      return exportFullConfiguration({ options, collectErrors, state });
    },
    async importFullConfiguration(
      importData: FullExportInterface,
      options: FullImportOptions = {
        reUuidJourneys: false,
        reUuidScripts: false,
        cleanServices: false,
        includeDefault: false,
      },
      collectErrors: Error[]
    ) {
      return importFullConfiguration({
        importData,
        options,
        collectErrors,
        state,
      });
    },
  };
};

/**
 * Full export options
 */
export interface FullExportOptions {
  /**
   * Use string arrays to store multi-line text in scripts.
   */
  useStringArrays: boolean;
  /**
   * Do not include decoded variable value in export
   */
  noDecode: boolean;
  /**
   * Include x and y coordinate positions of the journey/tree nodes.
   */
  coords: boolean;
  /**
   * Include default scripts in export if true
   */
  includeDefault: boolean;
}

/**
 * Full import options
 */
export interface FullImportOptions {
  /**
   * Generate new UUIDs for all journey nodes during import.
   */
  reUuidJourneys: boolean;
  /**
   * Generate new UUIDs for all scripts during import.
   */
  reUuidScripts: boolean;
  /**
   * Indicates whether to remove previously existing services of the same id before importing
   */
  cleanServices: boolean;
  /**
   * Include default scripts in import if true
   */
  includeDefault: boolean;
}

export interface FullExportInterface {
  meta?: ExportMetaData;
  global: FullGlobalExportInterface;
  realm: Record<string, FullRealmExportInterface>;
  idm: Record<string, IdObjectSkeletonInterface> | undefined;
}

export interface FullGlobalExportInterface {
  agents: Record<string, AgentSkeleton> | undefined;
  authentication: AuthenticationSettingsSkeleton | undefined;
  realm: Record<string, RealmSkeleton> | undefined;
  scripttype: Record<string, ScriptTypeSkeleton> | undefined;
  secretstore: Record<string, SecretStoreExportSkeleton> | undefined;
  server: Record<string, ServerExportSkeleton> | undefined;
  service: Record<string, AmServiceSkeleton> | undefined;
}

export interface FullRealmExportInterface {
  agents: Record<string, AgentSkeleton> | undefined;
  application: Record<string, OAuth2ClientSkeleton> | undefined;
  authentication: AuthenticationSettingsSkeleton | undefined;
  emailTemplate: Record<string, EmailTemplateSkeleton> | undefined;
  idp: Record<string, SocialIdpSkeleton> | undefined;
  managedApplication: Record<string, ApplicationSkeleton> | undefined;
  node: Record<string, NodeSkeleton> | undefined;
  policy: Record<string, PolicySkeleton> | undefined;
  policyset: Record<string, PolicySetSkeleton> | undefined;
  resourcetype: Record<string, ResourceTypeSkeleton> | undefined;
  saml:
    | {
        hosted: Record<string, Saml2ProviderSkeleton>;
        remote: Record<string, Saml2ProviderSkeleton>;
        metadata: Record<string, string[]>;
        cot: Record<string, CircleOfTrustSkeleton> | undefined;
      }
    | undefined;
  script: Record<string, ScriptSkeleton> | undefined;
  secrets: Record<string, SecretSkeleton> | undefined;
  secretstore: Record<string, SecretStoreExportSkeleton> | undefined;
  service: Record<string, AmServiceSkeleton> | undefined;
  theme: Record<string, ThemeSkeleton> | undefined;
  trees: Record<string, SingleTreeExportInterface> | undefined;
  user: Record<string, UserExportSkeleton> | undefined;
  variables: Record<string, VariableSkeleton> | undefined;
}

/**
 * Export full configuration
 * @param {FullExportOptions} options export options
 * @param {Error[]} collectErrors optional parameters to collect errors instead of having the function throw. Pass an empty array to collect errors and report on them but have the function perform all it can and return the export data even if it encounters errors.
 */
export async function exportFullConfiguration({
  options = {
    useStringArrays: true,
    noDecode: false,
    coords: true,
    includeDefault: false,
  },
  collectErrors,
  state,
}: {
  options: FullExportOptions;
  collectErrors?: Error[];
  state: State;
}): Promise<FullExportInterface> {
  let errors: Error[] = [];
  let throwErrors: boolean = true;
  if (collectErrors && Array.isArray(collectErrors)) {
    throwErrors = false;
    errors = collectErrors;
  }
  const { useStringArrays, noDecode, coords, includeDefault } = options;
  const stateObj = { state };
  const globalStateObj = { globalConfig: true, state };
  const realmStateObj = { globalConfig: false, state };
  const isClassicDeployment =
    state.getDeploymentType() === Constants.CLASSIC_DEPLOYMENT_TYPE_KEY;
  const isCloudDeployment =
    state.getDeploymentType() === Constants.CLOUD_DEPLOYMENT_TYPE_KEY;
  const isForgeOpsDeployment =
    state.getDeploymentType() === Constants.FORGEOPS_DEPLOYMENT_TYPE_KEY;
  const isPlatformDeployment = isCloudDeployment || isForgeOpsDeployment;

  //Export global config
  const globalConfig: FullGlobalExportInterface = {
    agents: isClassicDeployment
      ? (
          await exportOrImportWithErrorHandling(
            exportAgents,
            globalStateObj,
            errors
          )
        )?.agents
      : undefined,
    authentication: isClassicDeployment
      ? (
          await exportOrImportWithErrorHandling(
            exportAuthenticationSettings,
            globalStateObj,
            errors
          )
        )?.authentication
      : undefined,
    realm: (
      await exportOrImportWithErrorHandling(exportRealms, stateObj, errors)
    )?.realm,
    scripttype: (
      await exportOrImportWithErrorHandling(exportScriptTypes, stateObj, errors)
    )?.scripttype,
    secretstore: isClassicDeployment
      ? (
          await exportOrImportWithErrorHandling(
            exportSecretStores,
            globalStateObj,
            errors
          )
        )?.secretstore
      : undefined,
    server: isClassicDeployment
      ? (await exportOrImportWithErrorHandling(exportServers, stateObj, errors))
          ?.server
      : undefined,
    service: (
      await exportOrImportWithErrorHandling(
        exportServices,
        globalStateObj,
        errors
      )
    )?.service,
  };

  //Export realm configs
  const realmConfig = {};
  const currentRealm = state.getRealm();
  for (const realm of Object.keys(otherConfig.realm)) {
    state.setRealm(getRealmUsingExportFormat(realm));
    //Export saml2 providers and circle of trusts
    let saml = (
      (await exportOrImportWithErrorHandling(
        exportSaml2Providers,
        stateObj,
        errors
      )) as CirclesOfTrustExportInterface
    )?.saml;
    const cotExport = await exportOrImportWithErrorHandling(
      exportCirclesOfTrust,
      stateObj,
      errors
    );
    if (saml) {
      saml.cot = cotExport?.saml.cot;
    } else {
      saml = cotExport?.saml;
    }
    realmConfig[realm] = {
      agents: (
        await exportOrImportWithErrorHandling(
          exportAgents,
          realmStateObj,
          errors
        )
      )?.agents,
      application: (
        await exportOrImportWithErrorHandling(
          exportOAuth2Clients,
          {
            options: { deps: false, useStringArrays },
            state,
          },
          errors
        )
      )?.application,
      authentication: (
        await exportOrImportWithErrorHandling(
          exportAuthenticationSettings,
          realmStateObj,
          errors
        )
      )?.authentication,
      emailTemplate: isPlatformDeployment
        ? (
            await exportOrImportWithErrorHandling(
              exportEmailTemplates,
              stateObj,
              errors
            )
          )?.emailTemplate
        : undefined,
      idp: (
        await exportOrImportWithErrorHandling(
          exportSocialIdentityProviders,
          stateObj,
          errors
        )
      )?.idp,
      managedApplication: isPlatformDeployment
        ? (
            await exportOrImportWithErrorHandling(
              exportApplications,
              {
                options: { deps: false, useStringArrays },
                state,
              },
              errors
            )
          )?.managedApplication
        : undefined,
      node: (
        await exportOrImportWithErrorHandling(exportNodes, stateObj, errors)
      )?.node,
      policy: (
        await exportOrImportWithErrorHandling(
          exportPolicies,
          {
            options: { deps: false, prereqs: false, useStringArrays },
            state,
          },
          errors
        )
      )?.policy,
      policyset: (
        await exportOrImportWithErrorHandling(
          exportPolicySets,
          {
            options: { deps: false, prereqs: false, useStringArrays },
            state,
          },
          errors
        )
      )?.policyset,
      resourcetype: (
        await exportOrImportWithErrorHandling(
          exportResourceTypes,
          stateObj,
          errors
        )
      )?.resourcetype,
      saml,
      script: (
        await exportOrImportWithErrorHandling(
          exportScripts,
          {
            options: {
              includeLibraries: false,
              includeDefault,
              useStringArrays,
            },
            state,
          },
          errors
        )
      )?.script,
      secrets: isCloudDeployment
        ? (
            await exportOrImportWithErrorHandling(
              exportSecrets,
              stateObj,
              errors
            )
          )?.secrets
        : undefined,
      secretstore: isClassicDeployment
        ? (
            await exportOrImportWithErrorHandling(
              exportSecretStores,
              realmStateObj,
              errors
            )
          )?.secretstore
        : undefined,
      service: (
        await exportOrImportWithErrorHandling(
          exportServices,
          realmStateObj,
          errors
        )
      )?.service,
      theme: isPlatformDeployment
        ? (
            await exportOrImportWithErrorHandling(
              exportThemes,
              stateObj,
              errors
            )
          )?.theme
        : undefined,
      trees: (
        await exportOrImportWithErrorHandling(
          exportJourneys,
          {
            options: { deps: false, useStringArrays, coords },
            state,
          },
          errors
        )
      )?.trees,
      user: (
        await exportOrImportWithErrorHandling(exportUsers, stateObj, errors)
      )?.user,
      variables: isCloudDeployment
        ? (
            await exportOrImportWithErrorHandling(
              exportVariables,
              {
                noDecode,
                state,
              },
              errors
            )
          )?.variables
        : undefined,
    };
  }
  state.setRealm(currentRealm);

  //Create full export
  const fullExport = {
    meta: getMetadata(stateObj),
    global: globalConfig,
    realm: realmConfig,
    idm: isPlatformDeployment
      ? (
          await exportOrImportWithErrorHandling(
            exportConfigEntities,
            stateObj,
            errors
          )
        )?.idm
      : undefined,
  };
  if (throwErrors && errors.length > 0) {
    throw new FrodoError(`Error exporting full config`, errors);
  }
  return fullExport;
}

/**
 * Import full configuration
 * @param {FullExportInterface} importData import data
 * @param {FullImportOptions} options import options
 */
export async function importFullConfiguration({
  importData,
  options = {
    reUuidJourneys: false,
    reUuidScripts: false,
    cleanServices: false,
    includeDefault: false,
  },
  collectErrors,
  state,
}: {
  importData: FullExportInterface;
  options: FullImportOptions;
  collectErrors?: Error[];
  state: State;
}): Promise<void> {
  let errors: Error[] = [];
  let throwErrors: boolean = true;
  if (collectErrors && Array.isArray(collectErrors)) {
    throwErrors = false;
    errors = collectErrors;
  }
  const isCloudDeployment =
    state.getDeploymentType() === Constants.CLOUD_DEPLOYMENT_TYPE_KEY;
  const isForgeOpsDeployment =
    state.getDeploymentType() === Constants.FORGEOPS_DEPLOYMENT_TYPE_KEY;
  const isPlatformDeployment = isCloudDeployment || isForgeOpsDeployment;
  const { reUuidJourneys, reUuidScripts, cleanServices, includeDefault } =
    options;
  // Import to global
  let indicatorId = createProgressIndicator({
    total: 1,
    message: `Importing everything for global...`,
    state,
  });
  updateProgressIndicator({
    id: indicatorId,
    message: `Importing Services...`,
    state,
  });
  await exportOrImportWithErrorHandling(
    importServices,
    {
      importData: importData.global,
      options: { clean: cleanServices, global: true, realm: true },
      state,
    },
    errors
  );
  stopProgressIndicator({
    id: indicatorId,
    message: 'Finished Importing Everything to global!',
    status: 'success',
    state,
  });
  // Import to realms
  const currentRealm = state.getRealm();
  for (const realm of Object.keys(importData.realm)) {
    state.setRealm(getRealmUsingExportFormat(realm));
    indicatorId = createProgressIndicator({
      total: 16,
      message: `Importing everything for ${realm} realm...`,
      state,
    });
    // Order of imports matter here since we want dependencies to be imported first. For example, journeys depend on a lot of things, so they are last, and many things depend on scripts, so they are first.
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Scripts...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importScripts,
      {
        scriptName: '',
        importData: importData.realm[realm],
        options: {
          reUuid: reUuidScripts,
          includeDefault,
        },
        validate: false,
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Authentication Settings...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importAuthenticationSettings,
      {
        importData: importData.realm[realm],
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Agents...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importAgents,
      { importData: importData.realm[realm], state },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: isPlatformDeployment
        ? `Importing IDM Config Entities...`
        : `Skipping IDM Config Entities...`,
      state,
    });
    if (isPlatformDeployment) {
      await exportOrImportWithErrorHandling(
        importConfigEntities,
        {
          importData,
          options: { validate: false },
          state,
        },
        errors
      );
    }
    updateProgressIndicator({
      id: indicatorId,
      message: isPlatformDeployment
        ? `Importing Email Templates...`
        : `Skipping Email Templates...`,
      state,
    });
    if (isPlatformDeployment) {
      await exportOrImportWithErrorHandling(
        importEmailTemplates,
        {
          importData: importData.realm[realm],
          state,
        },
        errors
      );
    }
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Resource Types...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importResourceTypes,
      {
        importData: importData.realm[realm],
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Circles of Trust...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importCirclesOfTrust,
      {
        importData: importData.realm[realm],
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Services...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importServices,
      {
        importData: importData.realm[realm],
        options: { clean: cleanServices, global: false, realm: true },
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: isPlatformDeployment
        ? `Importing Themes...`
        : `Skipping Themes...`,
      state,
    });
    if (isPlatformDeployment) {
      await exportOrImportWithErrorHandling(
        importThemes,
        {
          importData: importData.realm[realm],
          state,
        },
        errors
      );
    }
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Saml2 Providers...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importSaml2Providers,
      {
        importData: importData.realm[realm],
        options: { deps: false },
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Social Identity Providers...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importSocialIdentityProviders,
      {
        importData: importData.realm[realm],
        options: { deps: false },
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing OAuth2 Clients...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importOAuth2Clients,
      {
        importData: importData.realm[realm],
        options: { deps: false },
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: isPlatformDeployment
        ? `Importing Applications...`
        : `Skipping Applications...`,
      state,
    });
    if (isPlatformDeployment) {
      await exportOrImportWithErrorHandling(
        importApplications,
        {
          importData: importData.realm[realm],
          options: { deps: false },
          state,
        },
        errors
      );
    }
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Policy Sets...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importPolicySets,
      {
        importData: importData.realm[realm],
        options: { deps: false, prereqs: false },
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Policies...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importPolicies,
      {
        importData: importData.realm[realm],
        options: { deps: false, prereqs: false },
        state,
      },
      errors
    );
    updateProgressIndicator({
      id: indicatorId,
      message: `Importing Journeys...`,
      state,
    });
    await exportOrImportWithErrorHandling(
      importJourneys,
      {
        importData: importData.realm[realm],
        options: { deps: false, reUuid: reUuidJourneys },
        state,
      },
      errors
    );
    stopProgressIndicator({
      id: indicatorId,
      message: `Finished Importing Everything to ${realm} realm!`,
      status: 'success',
      state,
    });
  }
  state.setRealm(currentRealm);
  if (throwErrors && errors.length > 0) {
    throw new FrodoError(`Error importing full config`, errors);
  }
}
