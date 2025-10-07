export interface User {
    id: string;
    name: string;
    groupId: string;
    permissionOverrides?: Record<string, Record<string, boolean>>; // feature -> action -> boolean
}