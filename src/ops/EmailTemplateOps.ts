import {
  EmailTemplateSkeleton,
  NoIdObjectSkeletonInterface,
} from '../api/ApiTypes';
import {
  getConfigEntitiesByType,
  getConfigEntity,
  putConfigEntity,
} from '../api/IdmConfigApi';
import State from '../shared/State';
import { EmailTemplateExportInterface } from "./OpsTypes";
import { createProgressIndicator, debugMessage, stopProgressIndicator, updateProgressIndicator } from "./utils/Console";

export default (state: State) => {
  return {
    /**
     * Email template type key used to build the IDM id: 'emailTemplate/<id>'
     */
    EMAIL_TEMPLATE_TYPE,

    /**
     * Get all email templates
     * @returns {Promise} a promise that resolves to an array of email template objects
     */
    async getEmailTemplates() {
      return getEmailTemplates({ state });
    },

    /**
     * Get email template
     * @param {string} templateId id/name of the email template without the type prefix
     * @returns {Promise} a promise that resolves an email template object
     */
    async getEmailTemplate(templateId: string) {
      return getEmailTemplate({ templateId, state });
    },

    /**
     * Export all email templates. The response can be saved to file as is.
     * @returns {Promise<EmailTemplateExportInterface>} Promise resolving to a EmailTemplateExportInterface object.
     */
    async exportEmailTemplates(): Promise<EmailTemplateExportInterface> {
      return exportEmailTemplates({ state });
    },

    /**
     * Put email template
     * @param {string} templateId id/name of the email template without the type prefix
     * @param {Object} templateData email template object
     * @returns {Promise} a promise that resolves to an email template object
     */
    async putEmailTemplate(
      templateId: string,
      templateData: EmailTemplateSkeleton
    ) {
      return putEmailTemplate({ templateId, templateData, state });
    },
  };
};

/**
 * Create an empty email template export template
 * @returns {EmailTemplateExportInterface} an empty email template export template
 */
export function createEmailTemplateExportTemplate(): EmailTemplateExportInterface {
  return {
    meta: {},
    emailTemplate: {},
  } as EmailTemplateExportInterface;
}

/**
 * Email template type key used to build the IDM id: 'emailTemplate/<id>'
 */
export const EMAIL_TEMPLATE_TYPE = 'emailTemplate';

/**
 * Get all email templates
 * @returns {Promise} a promise that resolves to an array of email template objects
 */
export async function getEmailTemplates({ state }: { state: State }) {
  return getConfigEntitiesByType({ type: EMAIL_TEMPLATE_TYPE, state });
}

/**
 * Get email template
 * @param {string} templateId id/name of the email template without the type prefix
 * @returns {Promise} a promise that resolves an email template object
 */
export async function getEmailTemplate({
  templateId,
  state,
}: {
  templateId: string;
  state: State;
}) {
  return getConfigEntity({
    entityId: `${EMAIL_TEMPLATE_TYPE}/${templateId}`,
    state,
  });
}

/**
 * Export all email templates. The response can be saved to file as is.
 * @returns {Promise<EmailTemplateExportInterface>} Promise resolving to a EmailTemplateExportInterface object.
 */
export async function exportEmailTemplates({
  state
}: {
  state: State
}): Promise<EmailTemplateExportInterface> {
  debugMessage({ message: `EmailTemplateOps.exportEmailTemplates: start`, state });
  const exportData = createEmailTemplateExportTemplate();
  const emailTemplates = (await getEmailTemplates({ state })).result;
  createProgressIndicator({
    total: emailTemplates.length,
    message: 'Exporting email templates',
    state,
  });
  for (const emailTemplate of emailTemplates) {
    const templateId = emailTemplate._id.replace(`${EMAIL_TEMPLATE_TYPE}/`, '');
    updateProgressIndicator({
      message: `Exporting email template ${templateId}`,
      state,
    });
    exportData.emailTemplate[templateId] = emailTemplate;
  }
  stopProgressIndicator({
    message: `${emailTemplates.length} email templates exported.`,
    state,
  });
  debugMessage({ message: `EmailTemplateOps.exportEmailTemplates: end`, state });
  return exportData;
}

/**
 * Put email template
 * @param {string} templateId id/name of the email template without the type prefix
 * @param {Object} templateData email template object
 * @returns {Promise} a promise that resolves to an email template object
 */
export async function putEmailTemplate({
  templateId,
  templateData,
  state,
}: {
  templateId: string;
  templateData: EmailTemplateSkeleton | NoIdObjectSkeletonInterface;
  state: State;
}) {
  return putConfigEntity({
    entityId: `${EMAIL_TEMPLATE_TYPE}/${templateId}`,
    entityData: templateData,
    state,
  });
}
