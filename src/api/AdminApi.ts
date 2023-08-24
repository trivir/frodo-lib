import { EmailTemplateSkeleton } from '../ops/EmailTemplateOps';
import { SingleTreeExportInterface } from '../ops/JourneyOps';
import { ExportMetaData } from '../ops/OpsTypes';
import { ThemeSkeleton } from '../ops/ThemeOps';
import { AgentSkeleton } from './AgentApi';
import { IdObjectSkeletonInterface } from './ApiTypes';
import { CircleOfTrustSkeleton } from './CirclesOfTrustApi';
import { OAuth2ClientSkeleton } from './OAuth2ClientApi';
import { PolicySkeleton } from './PoliciesApi';
import { PolicySetSkeleton } from './PolicySetApi';
import { ResourceTypeSkeleton } from './ResourceTypesApi';
import { Saml2ProviderSkeleton } from './Saml2Api';
import { ScriptSkeleton } from './ScriptApi';
import { AmServiceSkeleton } from './ServiceApi';
import { SocialIdpSkeleton } from './SocialIdentityProvidersApi';

export interface FullExportInterface {
  meta?: ExportMetaData;
  agents: Record<string, AgentSkeleton>;
  application: Record<string, OAuth2ClientSkeleton>;
  config: Record<string, IdObjectSkeletonInterface>;
  emailTemplate: Record<string, EmailTemplateSkeleton>;
  idp: Record<string, SocialIdpSkeleton>;
  policy: Record<string, PolicySkeleton>;
  policyset: Record<string, PolicySetSkeleton>;
  resourcetype: Record<string, ResourceTypeSkeleton>;
  saml: {
    hosted: Record<string, Saml2ProviderSkeleton>;
    remote: Record<string, Saml2ProviderSkeleton>;
    metadata: Record<string, string[]>;
    cot: Record<string, CircleOfTrustSkeleton>;
  };
  script: Record<string, ScriptSkeleton>;
  service: Record<string, AmServiceSkeleton>;
  theme: Record<string, ThemeSkeleton>;
  trees: Record<string, SingleTreeExportInterface>;
}
