export interface User {
    id: string;
    companyCode: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    division: string;
    role: "owner" | "approver" | "admin";
}

export interface Register {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "owner" | "approver";
    companyCode: string;
    division: string;
    password: string;
}

export interface StoredUser extends User {
    passwordHash: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
