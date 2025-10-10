export interface UserGroup {
    id: string;
    name: string;
    description: string;
    defaultPermissions: Partial<Record<string, Partial<Record<string, boolean>>>>; // feature -> action -> boolean
}