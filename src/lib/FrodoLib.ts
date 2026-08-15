// instantiable modules
import AdminOps, { type Admin } from '../ops/AdminOps.ts';
import AgentOps, { type Agent } from '../ops/AgentOps.ts';
import AmConfigOps, { type AmConfig } from '../ops/AmConfigOps.ts';
import ApiOps, { type ApiFactory } from '../ops/ApiFactoryOps.ts';
import ApplicationOps, { type Application } from '../ops/ApplicationOps.ts';
import AuthenticateOps, { type Authenticate } from '../ops/AuthenticateOps.ts';
import AuthenticationSettingsOps, {
  type AuthenticationSettings,
} from '../ops/AuthenticationSettingsOps.ts';
import CirclesOfTrustOps, {
  type CirclesOfTrust,
} from '../ops/CirclesOfTrustOps.ts';
import ServerOps, { type Server } from '../ops/classic/ServerOps.ts';
import SiteOps, { type Site } from '../ops/classic/SiteOps.ts';
import AdminFederationOps, {
  type AdminFederation,
} from '../ops/cloud/AdminFederationOps.ts';
import EnvAIAgentOps, { type EnvAIAgent } from '../ops/cloud/EnvAIAgentOps.ts';
import EnvCertificatesOps, {
  type EnvCertificate,
} from '../ops/cloud/EnvCertificatesOps.ts';
import EnvContentSecurityOps, {
  type EnvContentSecurityPolicy,
} from '../ops/cloud/EnvContentSecurityPolicyOps.ts';
import EnvCookieDomainsOps, {
  type EnvCookieDomains,
} from '../ops/cloud/EnvCookieDomainsOps.ts';
import EnvCSRsOps, { type EnvCSR } from '../ops/cloud/EnvCSRsOps.ts';
import EnvCustomDomainsOps, {
  type EnvCustomDomains,
} from '../ops/cloud/EnvCustomDomainsOps.ts';
import EnvDirectConfigurationSessionOps, {
  type EnvDirectConfigurationSession,
} from '../ops/cloud/EnvDirectConfigurationSessionOps.ts';
import EnvFederationEnforcementOps, {
  type EnvFederationEnforcement,
} from '../ops/cloud/EnvFederationEnforcementOps.ts';
import EnvPromotionOps, {
  type EnvPromotion,
} from '../ops/cloud/EnvPromotionOps.ts';
import EnvReleaseOps, { type EnvRelease } from '../ops/cloud/EnvReleaseOps.ts';
import EnvServiceAccountScopesOps, {
  type EnvServiceAccountScopes,
} from '../ops/cloud/EnvServiceAccountScopesOps.ts';
import EnvSSOCookieConfigOps, {
  type EnvSSOCookieConfig,
} from '../ops/cloud/EnvSSOCookieConfigOps.ts';
import EsvCountOps, { type EsvCount } from '../ops/cloud/EsvCountOps.ts';
import FeatureOps, { type Feature } from '../ops/cloud/FeatureOps.ts';
import IgaCertificationTemplateOps, {
  type CertificationTemplate,
} from '../ops/cloud/iga/IgaCertificationTemplateOps.ts';
import IgaEventOps, { type IgaEvent } from '../ops/cloud/iga/IgaEventOps.ts';
import IgaGlossaryOps, {
  type Glossary,
} from '../ops/cloud/iga/IgaGlossaryOps.ts';
import IgaRequestFormOps, {
  type RequestForm,
} from '../ops/cloud/iga/IgaRequestFormOps.ts';
import IgaRequestTypeOps, {
  type RequestType,
} from '../ops/cloud/iga/IgaRequestTypeOps.ts';
import IgaWorkflowOps, {
  type Workflow,
} from '../ops/cloud/iga/IgaWorkflowOps.ts';
import LogOps, { type Log } from '../ops/cloud/LogOps.ts';
import SecretsOps, { type Secret } from '../ops/cloud/SecretsOps.ts';
import ServiceAccountOps, {
  type ServiceAccount,
} from '../ops/cloud/ServiceAccountOps.ts';
import StartupOps, { type Startup } from '../ops/cloud/StartupOps.ts';
import VariablesOps, { type Variable } from '../ops/cloud/VariablesOps.ts';
import WSFedOps, { type WSFed } from '../ops/cloud/WSFedOps.ts';
import ConfigOps, { type Config } from '../ops/ConfigOps.ts';
import ConnectionProfileOps, {
  type ConnectionProfile,
} from '../ops/ConnectionProfileOps.ts';
import ConnectorOps, { type Connector } from '../ops/ConnectorOps.ts';
import EmailTemplateOps, {
  type EmailTemplate,
} from '../ops/EmailTemplateOps.ts';
import IdmConfigOps, { type IdmConfig } from '../ops/IdmConfigOps.ts';
import IdmCryptoOps, { type IdmCrypto } from '../ops/IdmCryptoOps.ts';
import IdmScriptOps, { type IdmScript } from '../ops/IdmScriptOps.ts';
import IdmSystemOps, { type IdmSystem } from '../ops/IdmSystemOps.ts';
import IdpOps, { type Idp } from '../ops/IdpOps.ts';
import InfoOps, { type Info } from '../ops/InfoOps.ts';
import InternalRoleOps, { type InternalRole } from '../ops/InternalRoleOps.ts';
import JoseOps, { type Jose } from '../ops/JoseOps.ts';
import JourneyOps, { type Journey } from '../ops/JourneyOps.ts';
import ManagedObjectOps, {
  type ManagedObject,
} from '../ops/ManagedObjectOps.ts';
import MappingOps, { type Mapping } from '../ops/MappingOps.ts';
import NodeOps, { type Node } from '../ops/NodeOps.ts';
import OAuth2ClientOps, { type OAuth2Client } from '../ops/OAuth2ClientOps.ts';
import OAuth2OidcOps, { type OAuth2Oidc } from '../ops/OAuth2OidcOps.ts';
import OAuth2ProviderOps, {
  type OAuth2Provider,
} from '../ops/OAuth2ProviderOps.ts';
import OAuth2TrustedJwtIssuerOps, {
  type OAuth2TrustedJwtIssuer,
} from '../ops/OAuth2TrustedJwtIssuerOps.ts';
import OrganizationOps, { type Organization } from '../ops/OrganizationOps.ts';
import PolicyOps, { type Policy } from '../ops/PolicyOps.ts';
import PolicySetOps, { type PolicySet } from '../ops/PolicySetOps.ts';
import RawConfigOps, { type RawConfig } from '../ops/RawConfigOps.ts';
import RealmOps, { type Realm } from '../ops/RealmOps.ts';
import ReconOps, { type Recon } from '../ops/ReconOps.ts';
import ResourceTypeOps, { type ResourceType } from '../ops/ResourceTypeOps.ts';
import Saml2Ops, { type Saml2 } from '../ops/Saml2Ops.ts';
import ScriptOps, { type Script } from '../ops/ScriptOps.ts';
import ScriptTypeOps, { type ScriptType } from '../ops/ScriptTypeOps.ts';
import SecretStoreOps, { type SecretStore } from '../ops/SecretStoreOps.ts';
import ServiceOps, { type Service } from '../ops/ServiceOps.ts';
import SessionOps, { type Session } from '../ops/SessionOps.ts';
import ThemeOps, { type Theme } from '../ops/ThemeOps.ts';
import TokenCacheOps, { type TokenCache } from '../ops/TokenCacheOps.ts';
import UserOps, { type User } from '../ops/UserOps.ts';
import VersionUtils, { type Version } from '../ops/VersionUtils.ts';
// non-instantiable modules
import ConstantsImpl, { type Constants } from '../shared/Constants.ts';
import StateImpl, { type State, type StateInterface } from '../shared/State.ts';
import Base64Utils, { type Base64 } from '../utils/Base64Utils.ts';
import CryptoUtils, { type FrodoCrypto } from '../utils/CryptoUtils.ts';
import ExportImportUtils, {
  type ExportImport,
} from '../utils/ExportImportUtils.ts';
import ForgeRockUtils, { type FRUtils } from '../utils/ForgeRockUtils.ts';
import FrodoUtilsImpl, { type FrodoUtils } from '../utils/FrodoUtils.ts';
import HelpUtilsImpl, { type HelpUtils } from '../utils/HelpUtils.ts';
import JsonUtils, { type Json } from '../utils/JsonUtils.ts';
import ScriptValidationUtils, {
  type ScriptValidation,
} from '../utils/ScriptValidationUtils.ts';

/**
 * Frodo Library
 */
export type Frodo = {
  state: State;
  admin: Admin;
  agent: Agent;

  am: {
    config: AmConfig;
  };

  app: Application;

  authn: {
    journey: Journey;
    node: Node;
    settings: AuthenticationSettings;
  };

  authz: {
    policy: Policy;
    policySet: PolicySet;
    resourceType: ResourceType;
  };

  cloud: EsvCount & {
    adminFed: AdminFederation;
    env: EnvAIAgent &
      EnvContentSecurityPolicy &
      EnvCookieDomains &
      EnvCustomDomains &
      EnvDirectConfigurationSession &
      EnvFederationEnforcement &
      EnvRelease &
      EnvServiceAccountScopes &
      EnvSSOCookieConfig & {
        cert: EnvCertificate;
        csr: EnvCSR;
        promotion: EnvPromotion;
      };
    /**
     * @deprecated since v2.0.4 use {@link frodo.cloud.getEsvCount | frodo.cloud.getEsvCount} instead
     */
    esvCount: EsvCount;
    feature: Feature;
    iga: {
      certificationTemplate: CertificationTemplate;
      event: IgaEvent;
      glossary: Glossary;
      requestForm: RequestForm;
      requestType: RequestType;
      workflow: Workflow;
    };
    log: Log;
    secret: Secret;
    serviceAccount: ServiceAccount;
    startup: Startup;
    variable: Variable;
    wsfed: WSFed;
  };

  config: Config;
  conn: ConnectionProfile;
  cache: TokenCache;

  email: {
    template: EmailTemplate;
  };

  factory: ApiFactory;

  idm: {
    config: IdmConfig;
    connector: Connector;
    crypto: IdmCrypto;
    managed: ManagedObject;
    mapping: Mapping;
    organization: Organization;
    recon: Recon;
    script: IdmScript;
    system: IdmSystem;
  };

  info: Info;
  login: Authenticate;

  oauth2oidc: {
    client: OAuth2Client;
    endpoint: OAuth2Oidc;
    external: Idp;
    provider: OAuth2Provider;
    issuer: OAuth2TrustedJwtIssuer;
  };

  rawConfig: RawConfig;

  realm: Realm;

  role: InternalRole;

  saml2: {
    circlesOfTrust: CirclesOfTrust;
    entityProvider: Saml2;
  };

  script: Script;
  scriptType: ScriptType;
  server: Server;
  secretStore: SecretStore;
  service: Service;
  session: Session;
  site: Site;

  theme: Theme;

  user: User;

  utils: FRUtils &
    FrodoUtils &
    HelpUtils &
    ScriptValidation &
    ExportImport &
    Base64 & {
      constants: Constants;
      crypto: FrodoCrypto;
      jose: Jose;
      json: Json;
      version: Version;
    };

  /**
   * Create a new frodo instance
   * @param {StateInterface} config Initial state configuration to use with the new instance
   * @returns {Frodo} frodo instance
   */
  createInstance(config: StateInterface): Frodo;

  /**
   * Factory helper to create a frodo instance ready for logging in with an admin user account
   * @param {string} host host base URL, e.g. 'https://openam-my-tenant.forgeblocks.com/am'
   * @param {string} username admin account username
   * @param {string} password admin account password
   * @param {string} realm (optional) override default realm
   * @param {string} deploymentType (optional) override deployment type ('cloud', 'forgeops', or 'classic')
   * @param {boolean} allowInsecureConnection (optional) allow insecure connection
   * @param {boolean} debug (optional) enable debug output
   * @param {boolean} curlirize (optional) enable output of all library REST calls as curl commands
   * @returns {Frodo} frodo instance
   */
  createInstanceWithAdminAccount(
    host: string,
    username: string,
    password: string,
    realm?: string,
    deploymentType?: string,
    allowInsecureConnection?: boolean,
    debug?: boolean,
    curlirize?: boolean
  ): Frodo;

  /**
   * Factory helper to create a frodo instance ready for logging in with a service account
   * @param {string} host host base URL, e.g. 'https://openam-my-tenant.forgeblocks.com/am'
   * @param {string} serviceAccountId service account uuid
   * @param {string} serviceAccountJwkStr service account JWK as stringified JSON
   * @param {string} realm (optional) override default realm
   * @param {string} deploymentType (optional) override deployment type ('cloud', 'forgeops', or 'classic')
   * @param {boolean} allowInsecureConnection (optional) allow insecure connection
   * @param {boolean} debug (optional) enable debug output
   * @param {boolean} curlirize (optional) enable output of all library REST calls as curl commands
   * @returns {Frodo} frodo instance
   */
  createInstanceWithServiceAccount(
    host: string,
    serviceAccountId: string,
    serviceAccountJwkStr: string,
    realm?: string,
    deploymentType?: string,
    allowInsecureConnection?: boolean,
    debug?: boolean,
    curlirize?: boolean
  ): Frodo;

  /**
   * Factory helper to create a frodo instance ready for logging in with Amster credentials
   * @param {string} host host base URL, e.g. 'https://am.example.com:8443/am'
   * @param {string} amsterPrivateKey the pem encoded private key used to authenticate with Amster
   * @param {string} authenticationService (optional) the authentication service used to authenticate with Amster (default: 'amsterService')
   * @param {string} realm (optional) override default realm
   * @param {string} deploymentType (optional) override deployment type ('cloud', 'forgeops', or 'classic')
   * @param {boolean} allowInsecureConnection (optional) allow insecure connection
   * @param {boolean} debug (optional) enable debug output
   * @param {boolean} curlirize (optional) enable output of all library REST calls as curl commands
   * @returns {Frodo} frodo instance
   */
  createInstanceWithAmsterAccount(
    host: string,
    amsterPrivateKey: string,
    authenticationService?: string,
    realm?: string,
    deploymentType?: string,
    allowInsecureConnection?: boolean,
    debug?: boolean,
    curlirize?: boolean
  ): Frodo;
};

/**
 * Create a new frodo instance
 * @param {StateInterface} config Initial state configuration to use with the new instance
 * @returns {Frodo} frodo instance
 */
const FrodoLib = (config: StateInterface = {}): Frodo => {
  const state = StateImpl(config);
  return {
    state: state,
    admin: AdminOps(state),
    agent: AgentOps(state),

    am: {
      config: AmConfigOps(state),
    },

    app: ApplicationOps(state),

    authn: {
      journey: JourneyOps(state),
      node: NodeOps(state),
      settings: AuthenticationSettingsOps(state),
    },

    authz: {
      policy: PolicyOps(state),
      policySet: PolicySetOps(state),
      resourceType: ResourceTypeOps(state),
    },

    cloud: {
      ...EsvCountOps(state),
      adminFed: AdminFederationOps(state),
      env: {
        ...EnvAIAgentOps(state),
        ...EnvContentSecurityOps(state),
        ...EnvCookieDomainsOps(state),
        ...EnvCustomDomainsOps(state),
        ...EnvDirectConfigurationSessionOps(state),
        ...EnvFederationEnforcementOps(state),
        ...EnvReleaseOps(state),
        ...EnvServiceAccountScopesOps(state),
        ...EnvSSOCookieConfigOps(state),
        cert: EnvCertificatesOps(state),
        csr: EnvCSRsOps(state),
        promotion: EnvPromotionOps(state),
      },
      esvCount: EsvCountOps(state),
      feature: FeatureOps(state),
      iga: {
        certificationTemplate: IgaCertificationTemplateOps(state),
        event: IgaEventOps(state),
        glossary: IgaGlossaryOps(state),
        requestForm: IgaRequestFormOps(state),
        requestType: IgaRequestTypeOps(state),
        workflow: IgaWorkflowOps(state),
      },
      log: LogOps(state),
      secret: SecretsOps(state),
      serviceAccount: ServiceAccountOps(state),
      startup: StartupOps(state),
      variable: VariablesOps(state),
      wsfed: WSFedOps(state),
    },

    config: ConfigOps(state),
    conn: ConnectionProfileOps(state),
    cache: TokenCacheOps(state),

    email: {
      template: EmailTemplateOps(state),
    },

    factory: ApiOps(state),

    idm: {
      config: IdmConfigOps(state),
      connector: ConnectorOps(state),
      crypto: IdmCryptoOps(state),
      managed: ManagedObjectOps(state),
      mapping: MappingOps(state),
      organization: OrganizationOps(state),
      recon: ReconOps(state),
      script: IdmScriptOps(state),
      system: IdmSystemOps(state),
    },

    info: InfoOps(state),
    login: AuthenticateOps(state),

    oauth2oidc: {
      client: OAuth2ClientOps(state),
      endpoint: OAuth2OidcOps(state),
      external: IdpOps(state),
      provider: OAuth2ProviderOps(state),
      issuer: OAuth2TrustedJwtIssuerOps(state),
    },

    rawConfig: RawConfigOps(state),

    realm: RealmOps(state),

    role: InternalRoleOps(state),

    saml2: {
      circlesOfTrust: CirclesOfTrustOps(state),
      entityProvider: Saml2Ops(state),
    },

    script: ScriptOps(state),
    scriptType: ScriptTypeOps(state),
    server: ServerOps(state),
    secretStore: SecretStoreOps(state),
    service: ServiceOps(state),
    session: SessionOps(state),
    site: SiteOps(state),

    theme: ThemeOps(state),

    user: UserOps(state),

    utils: {
      ...ForgeRockUtils(state),
      ...FrodoUtilsImpl(),
      ...HelpUtilsImpl(),
      ...ScriptValidationUtils(state),
      ...ExportImportUtils(state),
      ...Base64Utils(),
      constants: ConstantsImpl,
      crypto: CryptoUtils(),
      jose: JoseOps(state),
      json: JsonUtils(),
      version: VersionUtils(state),
    },

    createInstance,
    createInstanceWithAdminAccount,
    createInstanceWithServiceAccount,
    createInstanceWithAmsterAccount,
  };
};

function createInstance(config: StateInterface): Frodo {
  const frodo = FrodoLib(config);
  return frodo;
}

function createInstanceWithAmsterAccount(
  host: string,
  amsterPrivateKey: string,
  authenticationService: string = ConstantsImpl.DEFAULT_AMSTER_SERVICE,
  realm: string = undefined,
  deploymentType: string = undefined,
  allowInsecureConnection = false,
  debug = false,
  curlirize = false
): Frodo {
  const config: StateInterface = {
    host,
    amsterPrivateKey,
    authenticationService,
    realm,
    deploymentType,
    allowInsecureConnection,
    debug,
    curlirize,
  };
  const frodo = FrodoLib(config);
  return frodo;
}

function createInstanceWithServiceAccount(
  host: string,
  serviceAccountId: string,
  serviceAccountJwkStr: string,
  realm: string = undefined,
  deploymentType: string = undefined,
  allowInsecureConnection = false,
  debug = false,
  curlirize = false
): Frodo {
  const config: StateInterface = {
    host,
    serviceAccountId,
    serviceAccountJwk: JSON.parse(serviceAccountJwkStr),
    realm,
    deploymentType,
    allowInsecureConnection,
    debug,
    curlirize,
  };
  const frodo = FrodoLib(config);
  return frodo;
}

function createInstanceWithAdminAccount(
  host: string,
  username: string,
  password: string,
  realm: string = undefined,
  deploymentType: string = undefined,
  allowInsecureConnection = false,
  debug = false,
  curlirize = false
): Frodo {
  const config: StateInterface = {
    host,
    username,
    password,
    realm,
    deploymentType,
    allowInsecureConnection,
    debug,
    curlirize,
  };
  const frodo = FrodoLib(config);
  return frodo;
}

/**
 * Default frodo instance
 *
 * @remarks
 *
 * If your application requires a single connection to a ForgeRock Identity Platform
 * instance at a time, then this default instance is all you need:
 *
 * In order to use the default {@link Frodo | frodo} instance, you must populate its {@link State | state} with the
 * minimum required information to login to your ForgeRock Identity Platform instance:
 *
 * ```javascript
 * // configure the state before invoking any library functions that require credentials
 * state.setHost('https://instance0/am');
 * state.setUsername('admin');
 * state.setPassword('p@ssw0rd!');
 *
 * // now the library can login
 * frodo.login.getTokens();
 *
 * // and perform operations
 * frodo.authn.journey.exportJourney('Login');
 * ```
 *
 * If your application needs to connect to multiple ForgeRock Identity Platform instances
 * simultaneously, then you will want to create additional frodo instances using any of
 * the available factory methods accessible from the default instance:
 *
 * {@link frodo.createInstance}
 * ```javascript
 * // use factory method to create a new Frodo instance
 * const instance1 = frodo.createInstance({
 *    host: 'https://instance1/am',
 *    username: 'admin',
 *    password: 'p@ssw0rd!',
 * });
 *
 * // now the instance can login
 * instance1.login.getTokens();
 *
 * // and perform operations
 * instance1.authn.journey.exportJourney('Login');
 * ```
 *
 * {@link frodo.createInstanceWithAdminAccount}
 * ```javascript
 * // use factory method to create a new Frodo instance ready to login with an admin user account
 * const instance2 = frodo.createInstanceWithAdminAccount(
 *   'https://instance2/am',
 *   'admin',
 *   'p@ssw0rd!'
 * );
 *
 * // now the instance can login
 * instance2.login.getTokens();
 *
 * // and perform operations
 * instance2.authn.journey.exportJourney('Login');
 * ```
 *
 * {@link frodo.createInstanceWithServiceAccount}
 * ```javascript
 * // use factory method to create a new Frodo instance ready to login with a service account
 * const instance3 = frodo.createInstanceWithServiceAccount(
 *   'https://instance3/am',
 *   'serviceAccount',
 *   '{"k":"jwk"}'
 * );
 *
 * // now the instance can login
 * instance3.login.getTokens();
 *
 * // and perform operations
 * instance3.authn.journey.exportJourney('Login');
 * ```
 *
 * {@link frodo.createInstanceWithAmsterAccount}
 * ```javascript
 * // use factory method to create a new Frodo instance ready to login with Amster account
 * const instance4 = frodo.createInstanceWithAmsterAccount(
 *   'https://instance4/am',
 *   '-----BEGIN PRIVATE KEY-----\nMIIJQgIBADANBgkqhkiG9w0BAQEFAASCCSwwggkoAgEAAoICAQCVPUZaHCRHu9i3\n...',
 *   'amsterService'
 * );
 *
 * // now the instance can login
 * instance4.login.getTokens();
 *
 * // and perform AM operations
 * instance4.authn.journey.exportJourney('Login');
 * ```
 */
const frodo = FrodoLib();

/**
 * Default state instance
 *
 * @remarks
 *
 * {@link Frodo} maintains a {@link State | state} for each instance. The state is where Frodo gets configuration
 * information from like host to connecto to, username and password to use, whether to
 * allow insecure connections or not, etc. As the library operates, it updates its state.
 *
 * The default frodo instance contains an empty state instance by default. In order to
 * use the default frodo instance, you must populate its state with the minimum required
 * information to login to your ForgeRock Identity Platform instance:
 *
 * ```javascript
 * // configure the state before invoking any library functions that require credentials
 * state.setHost('https://instance0/am');
 * state.setUsername('admin');
 * state.setPassword('p@ssw0rd!');
 *
 * // now the library can login
 * frodo.login.getTokens();
 *
 * // and perform operations
 * frodo.authn.journey.exportJourney('Login');
 * ```
 */
const state = frodo.state;

export { frodo, FrodoLib, state };

export default FrodoLib;
