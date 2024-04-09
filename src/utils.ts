import * as fs from 'fs'
import * as path from 'path'
import {FileDetails} from './types'

export const message = {
  success: (message: string) => {
    const green = '\x1b[32m'
    const reset = '\x1b[0m'
    console.log(green + message + reset)
  },
  info: (message: string) => {
    console.log(message)
  },
}

function getFilesRecursive(directory: string, relativePath: string = ''): FileDetails[] {
  let files: FileDetails[] = []

  const items: string[] = fs.readdirSync(path.join(directory, relativePath))

  items.forEach(item => {
    const fullPath: string = path.join(directory, relativePath, item)
    const stats: fs.Stats = fs.statSync(fullPath)

    if (stats.isFile()) {
      const extension: string = path.extname(fullPath).slice(1)
      files.push({path: path.join(relativePath, item), type: extension})

    } else if (stats.isDirectory()) {
      const nestedFiles = getFilesRecursive(directory, path.join(relativePath, item))
      files = files.concat(nestedFiles)
    }
  })

  return files
}

export function getAllFiles(directory: string): FileDetails[] {
  return getFilesRecursive(directory)
}

export function sortByFileType(files: FileDetails[], typeOrder: string[]): FileDetails[] {
  const typePriorityMap: Record<string, number> = Object.create(null)
  typeOrder.forEach((item, index) => typePriorityMap[item] = index)

  const newFiles = files.map((item) => {
    return {
      ...item,
      sort: typePriorityMap?.[item.type ?? '*'] ?? typePriorityMap['*'],
    }
  })

  return newFiles.sort((a: Required<FileDetails>, b: Required<FileDetails>) => {
    return a?.sort - b?.sort
  })
}

export function filterByFileType(files: FileDetails[], typeOrder: string[]): FileDetails[] {
  const filterTypeMap: Record<string, FileDetails[]> = Object.create(null)
  typeOrder.forEach((type) => {
    filterTypeMap[type] = []
  })

  files.forEach((item) => {
    const type = item.type ?? '*'
    if (filterTypeMap[type]) {
      filterTypeMap[type].push(item)
    }
  })

  return typeOrder.flatMap(type => filterTypeMap[type])
}
