const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Monorepo: watch shared/ directory for changes
config.watchFolders = [path.resolve(workspaceRoot, 'shared')]

// Ensure .ts and .tsx extensions are resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx']

// pnpm workspace — set both node_modules paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// pnpm uses symlinks which Metro must follow
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

module.exports = config