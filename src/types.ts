export type ConfigType = {
    inputs: InputsType
    files: FileDetails[]
}

export type InputsType = {
    cloudType: string
    secretId: string;
    secretKey: string;
    bucket: string;
    region: string;
    localPath: string;
    remotePath: string;
    uploadSuffix: string[];
    cdnDomain: string;
    cdnRefresh: boolean;
    cdnRefreshSuffix: string[];
}

export interface UploadType {
    cloudType: string
    upload: () => Promise<void>;
}

export interface FileDetails {
    path: string;
    type: string;
    sort?: number
}

