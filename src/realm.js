import { Stitch, RemoteMongoClient, AnonymousCredential } from 'mongodb-stitch-browser-sdk'

const stitchAppId = 'watch-example-seisr'
const stitchDbName = 'db'

// Create the Stitch app (if not already created)
export const stitchApp = Stitch.hasAppClient(stitchAppId) ? Stitch.getAppClient(stitchAppId) : Stitch.initializeAppClient(stitchAppId)

// Initialize Stitch Query Anywhere
export const mongodb = stitchApp.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')
export const countersCollection = mongodb.db(stitchDbName).collection('counters')

// Login with Auth0
export const login = () => stitchApp.auth.loginWithCredential(new AnonymousCredential())
