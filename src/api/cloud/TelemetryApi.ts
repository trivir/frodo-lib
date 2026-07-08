import util from 'util';

import { State } from '../../shared/State';
import { getHostOnlyUrl } from '../../utils/ForgeRockUtils';
import { IdObjectSkeletonInterface } from '../ApiTypes';
import { generateEnvApi } from '../BaseApi';


const telemetryURLTemplate = '%s/environment/telemetry';
const otlpExporterURLTemplate = '%s/environment/telemetry/otlp/%s';
const splunkExporterURLTemplate = '%s/environment/telemetry/splunk/%s';

const apiVersion = 'protocol=1.0,resource=1.0';
const getApiConfig = () => ({
  path: `/environment/telemetry`,
  apiVersion,
});

export type LogSource =
  | 'am-access'
  | 'am-activity'
  | 'am-authentication'
  | 'am-config'
  | 'am-core'
  | 'am-everything'
  | 'environment-access'
  | 'idm-access'
  | 'idm-activity'
  | 'idm-authentication'
  | 'idm-config'
  | 'idm-core'
  | 'idm-recon'
  | 'idm-sync'
  | 'idm-everything'
  ;

export type OtlpExporterType = 'HTTP' | 'GRPC';

export type OtlpExporterEncoding = 'JSON' | 'PROTO';

export type OtlpBasicAuth = {
  username: string;
  password: string;
};

export type OtlpExporterSkeleton = IdObjectSkeletonInterface & {
  id: string;
  endpoint: string;
  type: OtlpExporterType;
  encoding?: OtlpExporterEncoding;
  sources: LogSource[];
  headers?: Record<string, string>;
  basicAuth?: OtlpBasicAuth;
};

export type SplunkExporterSkeleton = IdObjectSkeletonInterface & {
  id: string;
  endpoint: string;
  sources: LogSource[];
  index?: string;
  token?: string;
};

export type TelemetryExporters = {
  otlp: OtlpExporterSkeleton[];
  splunk: SplunkExporterSkeleton[];
};

export async function getTelemetryExporters({
  state,
}: {
  state: State;
}): Promise<TelemetryExporters> {
  const urlString = util.format(
    telemetryURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateEnvApi({
    resource: getApiConfig(),
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

export async function putOtlpExporter({
    exporterId,
    exporterData,
    state,
  }: {
    exporterId: string;
    exporterData: OtlpExporterSkeleton;
    state: State;
  }): Promise<OtlpExporterSkeleton> {
    const urlString = util.format(
      otlpExporterURLTemplate,
      getHostOnlyUrl(state.getHost()),
      exporterId
    );
  
    const { data } = await generateEnvApi({
      resource: getApiConfig(),
      state,
    }).put(urlString, exporterData, {
      withCredentials: true,
    });
    return data;
  }

export async function putSplunkExporter({
  exporterId,
  exporterData,
  state,
}: {
  exporterId: string;
  exporterData: SplunkExporterSkeleton;
  state: State;
}): Promise<SplunkExporterSkeleton> {
  const urlString = util.format(
    splunkExporterURLTemplate,
    getHostOnlyUrl(state.getHost()),
    exporterId
  );
  const { data } = await generateEnvApi({
    resource: getApiConfig(),
    state,
  }).put(urlString, exporterData, {
    withCredentials: true,
  });
  return data;
}

