import * as TencentCloudCommon from 'tencentcloud-sdk-nodejs-common'
import {ConfigType} from './types'
import {message} from './utils'

const CommonClient = TencentCloudCommon.CommonClient

export const runCdn = async (data: ConfigType) => {
  const {inputs} = data
  message.info('Start refreshing CDN')

  const client = new CommonClient(
    'cdn.tencentcloudapi.com',
    '2018-06-06',
    {
      credential: {
        secretId: inputs.secretId,
        secretKey: inputs.secretKey,
      },
      region: '',
      profile: {
        httpProfile: {
          endpoint: 'cdn.tencentcloudapi.com',
        },
      },
    },
  )

  const params = {
    Urls: data.files.filter((item) => inputs.cdnRefreshSuffix.includes(item.type)).map((item) => `${inputs.cdnDomain}/${item.path}`),
  }
  if (!params.Urls.length) return
  client.request('PurgeUrlsCache', params).then(
    (data) => {
      console.log(data)
    },
    (err) => {
      console.error('error', err)
    },
  )

  return new Promise<void>((resolve, reject) => {
    message.success('CDN refreshing...')
    resolve()
  })

}
