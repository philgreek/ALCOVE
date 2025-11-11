// FIX: The reference to "vite/client" was removed to address a "Cannot find type definition file" error.
// This is often an environment or tsconfig.json configuration issue.
// The types for import.meta.env are preserved below.

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}