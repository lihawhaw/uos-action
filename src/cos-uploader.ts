import COS, {UploadFileItemParams} from 'cos-nodejs-sdk-v5'
import {ConfigType} from './types'
import {message} from './utils'

export class COSUploader {
  private cos: COS
  private readonly bucket: string
  private readonly region: string
  private readonly localPath: string
  private readonly remotePath: string
  private readonly files: UploadFileItemParams[]

  constructor(config: ConfigType) {
    const {inputs, files} = config
    this.cos = new COS({
      SecretId: inputs.secretId,
      SecretKey: inputs.secretKey,
    })
    this.bucket = inputs.bucket
    this.region = inputs.region
    this.localPath = inputs.localPath
    this.remotePath = inputs.remotePath
    this.files = files.map((item) => {
      return {
        Bucket: `${this.bucket}`,
        Region: this.region,
        Key: `${this.remotePath}/${item.path}`,
        FilePath: `${this.localPath}/${item.path}`,
      }
    })
  }

  public async uploadFiles(): Promise<void> {
    try {
      await this.cos.uploadFiles({
        files: this.files,
        SliceSize: 1024 * 1024 * 10,
        onFileFinish: (error, data) => {
          if (!error && data) message.success(`success：${this.remotePath}${decodeURIComponent(`${data.Location}`.split(this.remotePath)[1])}`)
        },
      })
      return Promise.resolve()
    } catch (error) {
      throw error
    }
  }
}
