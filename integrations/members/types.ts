// Generic member type (replacing Wix-specific types)

export type Member = {
  _id?: string;
  loginEmail?: string;
  loginEmailVerified?: boolean;
  status?: "UNKNOWN" | "PENDING" | "APPROVED" | "BLOCKED" | "OFFLINE";
  role?: "ADMIN" | "STORE_MANAGER" | "STAFF";
  contact?: {
    firstName?: string;
    lastName?: string;
    phones?: string[];
  };
  profile?: {
    nickname?: string;
    photo?: {
      url?: string;
      height?: number;
      width?: number;
      offsetX?: number;
      offsetY?: number;
    };
    title?: string;
  };
  _createdDate?: Date;
  _updatedDate?: Date;
  lastLoginDate?: Date;
};
