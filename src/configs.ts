import core from '@actions/core'
import {ConfigType} from './types'
import {message} from './utils'

export const getConfig = (): ConfigType => {
  message.info('Start loading configuration')

  const inputs = {
    cloudType: core.getInput('cloudType', {required: true}),
    secretId: core.getInput('secretId', {required: true}),
    secretKey: core.getInput('secretKey', {required: true}),
    bucket: core.getInput('bucket', {required: true}),
    region: core.getInput('region', {required: true}),
    localPath: core.getInput('localPath', {required: true}),
    remotePath: core.getInput('remotePath', {required: false}) || '/',
    uploadSuffix: core.getMultilineInput('uploadSuffix', {required: false}),
    cdnDomain: core.getInput('cdnDomain', {required: false}) || '',
    cdnRefresh: core.getBooleanInput('cdnRefresh', {required: false}) || false,
    cdnRefreshSuffix: core.getMultilineInput('cdnRefreshSuffix', {required: false}) || '*',
  }

  message.success('Configuration loading completed')
  return {inputs, files: []}
}
