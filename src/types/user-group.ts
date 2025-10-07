export interface UserGroup {
    id: string;
    name: string;
    description: string;
    defaultPermissions: Record<string, Record<string, boolean>>; // feature -> action -> boolean
}