/**
 * Public entrypoint for MCP capability-building primitives in frodo-lib.
 *
 * @remarks
 * This barrel keeps MCP-related contracts and helper functions grouped under a
 * single module namespace for downstream runtime and CLI integration.
 */

export {
  McpCapabilityDescriptor,
  McpCapabilityInventoryOptions,
  McpCapabilityKind,
  McpCapabilityOperationType,
  McpCapabilityPolicy,
  McpCapabilityPolicyPresetName,
  McpCapabilityRiskClass,
  McpDeploymentType,
  McpToolAnnotations,
} from './CapabilityTypes.ts';
export {
  MCP_POLICY_PRESETS,
  applyCapabilityPolicy,
} from './CapabilityPolicy.ts';
export {
  McpCapabilityRouting,
  McpCapabilityRoutingStatus,
  describeCapabilityRouting,
  rankCapabilitiesForDeployment,
} from './CapabilityRouting.ts';
export {
  MCP_AMBIGUOUS_OBJECT_CONCEPTS,
  MCP_SEMANTIC_OBJECT_SYNONYMS,
  McpManagedObjectFamilyMatch,
  McpSemanticObjectFamily,
  McpSemanticObjectFamilyResolution,
  descriptorPatternsSupportFamily,
  discoverManagedObjectFamilies,
  matchManagedObjectFamily,
  normalizeSemanticObjectFamily,
  resolveSemanticObjectFamily,
} from './SemanticObjectFamilies.ts';
export {
  capabilityMatchesAnyProfile,
  capabilityMatchesDisabled,
  getMcpProfileDefinition,
  listAllMcpProfiles,
  listMcpProfiles,
  resolveMcpProfileSelection,
} from './ProfileRegistry.ts';
export {
  buildCapabilityInventory,
  inferObjectType,
  inferOperationType,
  inferRiskClass,
} from './CapabilityRegistry.ts';
export {
  McpCanonicalTool,
  McpDiscoveryContext,
  McpDiscoveryEntry,
  McpDiscoveryTarget,
  McpManagedObjectHydrationStatus,
  McpGenericTool,
  McpObjectTypeEntry,
  McpSpecialTool,
  McpToolManifest,
  buildToolManifest,
} from './ToolManifest.ts';
export {
  McpDiscoverArguments,
  McpExecutionPaginationMetadata,
  McpExecutionScopeMetadata,
  McpGenericExecutionArguments,
  McpRuntimeAdminAccountAuth,
  McpRuntimeAuth,
  McpRuntimeRequestContext,
  McpRuntimeServiceAccountAuth,
  McpRuntimeStateAuth,
  McpSpecialExecutionArguments,
  McpToolExecutionRequest,
  McpToolExecutionResult,
  McpToolExecutionMetadata,
  McpToolRuntime,
  McpToolRuntimeOptions,
  McpToolRuntimeTraceCandidate,
  McpToolRuntimeTraceCriteria,
  McpToolRuntimeTraceEvent,
  McpToolRuntimeTraceHandler,
  createToolRuntime,
  resolveRequestScopedFrodo,
} from './ToolRuntime.ts';
export {
  McpService,
  McpServiceOptions,
  McpServiceToolDefinition,
  composeCapabilityPolicy,
  createMcpService,
} from './McpService.ts';
