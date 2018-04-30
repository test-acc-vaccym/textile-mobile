// @flow
import { NativeModules } from 'react-native'

const { TextileIPFS } = NativeModules

type MultipartData = {
  payloadPath: string,
  boundary: string
}

export default {
  createNodeWithDataDir: async function (dataDir: string): boolean {
    // TODO: should do a try/catch here
    const success = await TextileIPFS.createNodeWithDataDir(dataDir)
    return success
  },

  startGateway: async function (): boolean {
    // TODO: should do a try/catch here
    const success = await TextileIPFS.startGateway()
    return success
  },

  startNode: async function (): boolean {
    // TODO: should do a try/catch here
    const success = await TextileIPFS.startNode()
    return success
  },

  stopNode: async function (): boolean {
    // TODO: should do a try/catch here
    const success = await TextileIPFS.stopNode()
    return success
  },

  addImageAtPath: async function (path: string, thumbPath: string, thread: string): MultipartData {
    // TODO: should do a try/catch here
    const multipartData = await TextileIPFS.addImageAtPath(path, thumbPath, thread)
    return multipartData
  },

  getPhotos: async function (offset: ?string, limit: number, thread: string): string {
    // TODO: should do a try/catch here
    const result = await TextileIPFS.getPhotos(offset, limit, thread)
    return result
  },

  getPhotoData: async function (path: string): string {
    // TODO: should do a try/catch here
    const result = await TextileIPFS.getPhotoData(path)
    return result
  },

  syncGetPhotoData: function (path: string): string {
    return TextileIPFS.syncGetPhotoData(path)
  },

  pairNewDevice: async function (pubKey: string): string {
    // TODO: should do a try/catch here
    const result = await TextileIPFS.pairNewDevice(pubKey)
    return result
  },

  getFilePath: async function (uri: string): string {
    try {
      const result = await TextileIPFS.getFilePath(uri)
      console.log('h', result)
      return result
    } catch (e) {
      console.log(e)
    }
  }
}
