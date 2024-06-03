import * as core from '@actions/core'
import {getConfig} from './configs'
import {filterByFileType, getAllFiles, message, sortByFileType} from './utils'
import {COSUploader} from './cos-uploader'
import {runCdn} from './cdn'

const run = async () => {
  try {
    const config = getConfig()
    const {inputs} = config

    const defaultFiles = getAllFiles(inputs.localPath)

    message.info('Start processing data')
    if (inputs.uploadSuffix.includes('*')) {
      config.files = sortByFileType(defaultFiles, inputs.uploadSuffix)
    } else {
      config.files = filterByFileType(defaultFiles, inputs.uploadSuffix)
    }
    message.success('Data processing completed')

    // message.info(JSON.stringify(config, null, 4))

    message.info('Ready to start uploading')
    if (inputs.cloudType === 'cos') {
      message.info('cloudType-cos')
      const cosInst = new COSUploader(config)
      message.info('cosInst')
      await cosInst.uploadFiles()
      message.info('uploadFiles')
    }
    message.success('All upload completed')

    await runCdn(config)

  } catch (error) {
    core.setFailed(`Action failed with error ${error}`)
  }
}

run()
