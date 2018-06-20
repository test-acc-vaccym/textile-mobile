/* ***********************************************************
* A short word on how to use this automagically generated file.
* We're often asked in the ignite gitter channel how to connect
* to a to a third party api, so we thought we'd demonstrate - but
* you should know you can use sagas for other flow control too.
*
* Other points:
*  - You'll need to add this saga to sagas/index.js
*  - This template uses the api declared in sagas/index.js, so
*    you'll need to define a constant in that file.
*************************************************************/
import { AppState } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select, take } from 'redux-saga/effects'
import BackgroundTimer from 'react-native-background-timer'
import RNFS from 'react-native-fs'
import BackgroundTask from 'react-native-background-task'
import NavigationService from '../Services/NavigationService'
import PhotosNavigationService from '../Services/PhotosNavigationService'
import IPFS from '../../TextileNode'
import { getAllPhotos, getPhotoPath } from '../Services/PhotoUtils'
import {StartupTypes} from '../Redux/StartupRedux'
import TextileActions, { TextileSelectors } from '../Redux/TextileRedux'
import IpfsNodeActions, { IpfsNodeSelectors } from '../Redux/IpfsNodeRedux'
import AuthActions from '../Redux/AuthRedux'
import UIActions from '../Redux/UIRedux'
import {params1} from '../Navigation/OnboardingNavigation'
import Upload from 'react-native-background-upload'
import { Buffer } from 'buffer'
import Config from 'react-native-config'

const API_URL = 'https://api.textile.io'

export function * signUp ({data}) {
  const {referralCode, username, email, password} = data
  try {
    const data = yield call(IPFS.signUpWithEmail, username, password, email, referralCode)
    const response = JSON.parse(data)
    if (response.error) {
      yield put(AuthActions.signUpFailure(response.error))
    } else {
      // TODO: Put username into textile-go for addition to metadata model
      yield put(AuthActions.signUpSuccess('tokenFromSignUp'))
      yield call(NavigationService.navigate, 'OnboardingScreen', params1)
    }
  } catch (error) {
    yield put(AuthActions.signUpFailure(error))
  }
}

export function * logIn ({data}) {
  const {username, password} = data
  try {
    const data = yield call(IPFS.signIn, username, password)
    const response = JSON.parse(data)
    if (response.error) {
      yield put(AuthActions.signUpFailure(response.error))
    } else {
      yield put(AuthActions.logInSuccess('tokenFormLogIn'))
      yield call(NavigationService.navigate, 'OnboardingScreen', params1)
    }
  } catch (error) {
    yield put(AuthActions.logInFailure(error))
  }
}

export function * recoverPassword ({data}) {
  // TODO: const {username} = data
  try {
    yield delay(2000)
    yield put(AuthActions.recoverPasswordSuccess())
  } catch (error) {
    yield put(AuthActions.recoverPasswordFailure(error))
  }
}

export function * viewPhoto () {
  yield call(PhotosNavigationService.navigate, 'PhotoViewer')
}

export function * toggleBackgroundTimer ({value}) {
  if (value) {
    yield call(BackgroundTimer.start)
  } else {
    yield call(BackgroundTimer.stop)
    yield call(BackgroundTask.finish)
  }
}

export function * initializeAppState () {
  yield take(StartupTypes.STARTUP)
  const defaultAppState = yield select(IpfsNodeSelectors.appState)
  let queriedAppState = defaultAppState
  while (queriedAppState.match(/default|unknown/)) {
    yield delay(10)
    const currentAppState = yield call(() => AppState.currentState)
    queriedAppState = currentAppState || 'unknown'
  }
  yield put(IpfsNodeActions.appStateChange(defaultAppState, queriedAppState))
}

export function * handleNewAppState ({previousState, newState}) {
  console.log('handleNewAppState', previousState, newState)
  if (previousState.match(/default|unknown/) && newState === 'background') {
    console.tron.logImportant('launched into background')
    yield * triggerCreateNode()
  } else if (previousState.match(/default|unknown|inactive|background/) && newState === 'active') {
    console.tron.logImportant('app transitioned to foreground')
    yield put(IpfsNodeActions.lock(false))
    yield * triggerCreateNode()
  } else if (previousState.match(/inactive|active/) && newState === 'background') {
    console.tron.logImportant('app transitioned to background')
    yield * triggerStopNode()
  }
}

export function * triggerCreateNode () {
  const locked = yield select(IpfsNodeSelectors.locked)
  if (locked) {
    return
  }
  yield put(IpfsNodeActions.lock(true))
  yield put(IpfsNodeActions.createNodeRequest(RNFS.DocumentDirectoryPath))
}

export function * triggerStopNode () {
  yield put(IpfsNodeActions.stopNodeRequest())
}

export function * createNode ({path}) {
  try {
    const logLevel = (__DEV__ ? 'DEBUG' : 'INFO')
    const logFiles = !__DEV__
    const createNodeSuccess = yield call(IPFS.create, path, API_URL, logLevel, logFiles)
    const addDefaultThreadSuccess = yield call(IPFS.addThread, "default")
    const addAllThreadSuccess = yield call(IPFS.addThread, Config.ALL_THREAD_NAME, Config.ALL_THREAD_MNEMONIC)
    if (createNodeSuccess && addDefaultThreadSuccess && addAllThreadSuccess) {
      yield put(IpfsNodeActions.createNodeSuccess())
      yield put(IpfsNodeActions.startNodeRequest())
    } else {
      yield put(IpfsNodeActions.createNodeFailure(new Error('Failed creating node, but no error was thrown - Should not happen')))
      yield put(IpfsNodeActions.lock(false))
    }
  } catch (error) {
    yield put(IpfsNodeActions.createNodeFailure(error))
    yield put(IpfsNodeActions.lock(false))
  }
}

export function * startNode () {
  const onboarded = yield select(TextileSelectors.onboarded)
  if (!onboarded) {
    yield put(IpfsNodeActions.lock(false))
    return
  }
  try {
    const startNodeSuccess = yield call(IPFS.start)
    if (startNodeSuccess) {
      yield put(IpfsNodeActions.startNodeSuccess())
      yield put(IpfsNodeActions.getPhotoHashesRequest('default'))
      yield put(IpfsNodeActions.getPhotoHashesRequest('all'))
    } else {
      yield put(IpfsNodeActions.startNodeFailure(new Error('Failed starting node, but no error was thrown - Should not happen')))
      yield put(IpfsNodeActions.lock(false))
    }
  } catch (error) {
    yield put(IpfsNodeActions.startNodeFailure(error))
    yield put(IpfsNodeActions.lock(false))
  }
}

export function * stopNode () {
  yield put(IpfsNodeActions.lock(true))
  try {
    yield call(IPFS.stop)
    yield put(IpfsNodeActions.stopNodeSuccess())
  } catch (error) {
    yield put(IpfsNodeActions.stopNodeFailure(error))
  } finally {
    yield put(IpfsNodeActions.lock(false))
  }
}

export function * getPhotoHashes ({thread}) {
  try {
    const items = yield call(IPFS.getPhotoBlocks, null, -1, thread)
    let data = []
    for (let item of items) {
      try {
        const captionsrc = yield call(IPFS.getBlockData, item.id, 'caption')
        const caption = Buffer.from(captionsrc, 'base64').toString('utf8')
        item = {...item, caption}
      } catch (err) {
        // gracefully return an empty caption for now
      }
      try {
        const metasrc = yield call(IPFS.getFileData, item.target, 'meta')
        const meta = JSON.parse(Buffer.from(metasrc, 'base64').toString('utf8'))
        meta.username = meta.un // FIXME
        item = {...item, meta}
      } catch (err) {
        // gracefully return an empty meta for now
      }
      item.hash = item.target // FIXME
      data.push({...item})
    }
    yield put(IpfsNodeActions.getPhotoHashesSuccess(thread, data))
  } catch (error) {
    yield put(IpfsNodeActions.getPhotoHashesFailure(thread, error))
  }
}

export function * pairNewDevice (action) {
  const { pubKey } = action
  try {
    yield call(IPFS.pairDevice, pubKey)
    yield put(TextileActions.pairNewDeviceSuccess(pubKey))
  } catch (err) {
    yield put(TextileActions.pairNewDeviceError(pubKey))
  }
}

export function * shareImage ({thread, hash, caption}) {
  try {
    yield call(IPFS.sharePhoto, hash, thread, caption)
    yield put(IpfsNodeActions.getPhotoHashesRequest(thread))
  } catch (error) {
    yield put(UIActions.imageSharingError(error))
  }
}

export function * photosTask () {
  try {
    const camera = yield select(TextileSelectors.camera)
    let allPhotos = yield call(getAllPhotos)

    // for new users, just grab their latest photos
    if (camera.processed === undefined) {
      const ignoredPhotos = allPhotos.splice(1)
      yield put(TextileActions.urisToIgnore(ignoredPhotos.map(photo => photo.uri)))
    }

    const processed = camera && camera.processed ? camera.processed : {}
    const photos = allPhotos.filter((photo) => {
      switch (processed[photo.uri] !== undefined && processed[photo.uri] !== 'error') {
        case (true):
          return false
        default:
          return true
      }
    })

    // ensure that no other jobs try to process the same photo
    yield put(TextileActions.photosProcessing(photos))

    let photoUploads = []
    // Convert all our new entries to thumbs before anything else
    for (let photo of photos.reverse()) {
      try {
        photo = yield call(getPhotoPath, photo)
        const multipartData = yield call(IPFS.addPhoto, photo.path, 'default', '')
        photoUploads.push({
          photo: photo,
          multipartData
        })
      } catch (error) {
        // if error, delete the photo copy and thumb from disk then fire error
        try {
          yield call(RNFS.unlink, photo.path)
        } finally {
          yield put(TextileActions.photoProcessingError(photo.uri, error))
        }
      }
    }
    // refresh our gallery
    yield put(IpfsNodeActions.getPhotoHashesRequest('default'))
    // initialize and complete our uploads
    for (let photoData of photoUploads) {
      let {photo, multipartData} = photoData
      try {
        yield put(TextileActions.imageAdded(photo.uri, 'default', multipartData.boundary, multipartData.payloadPath))
        yield uploadFile(multipartData.boundary, multipartData.boundary, multipartData.payloadPath)
      } catch (error) {
        yield put(TextileActions.photoProcessingError(photo.uri, error))
      } finally {
        // no matter what, after add/update try to unlink the file from drive
        try {
          yield call(RNFS.unlink, photo.path)
        } catch (error) {
          yield put(TextileActions.photoProcessingError(photo.uri, error))
        }
      }
    }
  } catch (error) {
    yield put(TextileActions.photosTaskError(error))
  } finally {
    const appState = yield select(IpfsNodeSelectors.appState)
    if (appState.match(/background/)) {
      yield * stopNode()
    } else {
      yield put(IpfsNodeActions.lock(false))
    }
  }
}

export function * removePayloadFile ({data}) {
  const { id } = data
  const items = yield select(TextileSelectors.itemsById, id)
  for (const item of items) {
    if (item.remotePayloadPath && item.state === 'complete') {
      // TODO: probably should be a try/catch?
      yield call(RNFS.unlink, item.remotePayloadPath)
    }
  }
  yield put(TextileActions.imageRemovalComplete(id))
}

export function * retryUploadAfterError ({data}) {
  const { id } = data
  const items = yield select(TextileSelectors.itemsById, id)
  for (const item of items) {
    if (item.remainingUploadAttempts > 0) {
      yield put(TextileActions.imageUploadRetried(item.hash))
      yield uploadFile(item.hash, item.hash, item.remotePayloadPath)
    }
  }
}

function * uploadFile (id: string, boundary: string, payloadPath: string) {
  yield call(
    Upload.startUpload,
    {
      customUploadId: id,
      path: payloadPath,
      url: 'https://ipfs.textile.io/api/v0/add?wrap-with-directory=true',
      method: 'POST',
      type: 'raw-multipart',
      boundary: boundary
    }
  )
}
