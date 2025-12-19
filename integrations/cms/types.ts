// Generic type definitions (replacing Wix-specific types)

export interface WixDataItem {
  _id: string;
  [key: string]: any;
}

export interface WixDataQueryResult<T = any> {
  items: T[];
  pageInfo?: {
    pageNumber: number;
    pageSize: number;
    total: number;
  };
}
