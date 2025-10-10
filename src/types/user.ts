export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    position?: string; // Position/Title
    department?: string;
    location?: string; // Primary Location
    groupId: string;
}