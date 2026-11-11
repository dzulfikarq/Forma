export function validateMetadata(categories: unknown[], templates: unknown[]): string[];
export function validatePackageDependencies(template: { id: string; version: string; dependencies: string[] }, manifest: { name?: string; version?: string; scripts?: Record<string, string>; dependencies?: Record<string, unknown>; peerDependencies?: Record<string, unknown> }): string[];
export function buildRegistry(repositoryRoot?: string, ref?: string | null): Promise<unknown>;
