import client, {Channel, Connection} from 'amqplib'
import {
    Convert, DBUserProfileInfo,
    SessionCreationRequest,
    UserConnectionStatusEvent,
    UserProfileInfo
} from "./common-classes/common-classes";
import {FirebaseApp} from "@firebase/app";
import admin from 'firebase-admin'

const serviceAccount = {
    "type": `${process.env.firebase_creds_type}`,
    "project_id": `${process.env.firebase_creds_project_id}`,
    "private_key_id": `${process.env.firebase_creds_private_key_id}`,
    "private_key": `${process.env.firebase_creds_private_key}`.replace(/\\n/gm, "\n"),
    "client_email": `${process.env.firebase_creds_client_email}`,
    "client_id": `${process.env.firebase_creds_client_id}`,
    "auth_uri": `${process.env.firebase_creds_auth_uri}`,
    "token_uri": `${process.env.firebase_creds_token_uri}`,
    "auth_provider_x509_cert_url": `${process.env.firebase_creds_auth_provider_x509_cert_url}`,
    "client_x509_cert_url": `${process.env.firebase_creds_client_x509_cert_url}`
} as never
export let messagingChannel: Channel
export let firebaseApp: FirebaseApp;
export let firestoreDB: FirebaseFirestore.Firestore

async function main() {
    configureFirebase()
    await setupMessaging()
    await setupListeners()
}

async function setupMessaging(): Promise<void> {
    const connection: Connection = await client.connect(`amqp://guest:guest@messaging-service:5672`)
    const channel: Channel = await connection.createChannel()
    messagingChannel = channel
    await channel.assertExchange('EXCHANGE_NAME_EXPORTER', 'topic', {durable: false})
    await channel.assertExchange("EXCHANGE_NAME_CONVERSATION_MANAGER", 'topic', {durable: false})
}


async function setupListeners(): Promise<void> {
    const sessionCreationQueue = await messagingChannel.assertQueue('', {exclusive: true, autoDelete: true})
    await messagingChannel.bindQueue(sessionCreationQueue.queue, 'EXCHANGE_NAME_EXPORTER', 'create_session')
    console.log('boundQueue')
    messagingChannel.consume(sessionCreationQueue.queue, (msg) => {
        onSessionCreationRequest(Convert.toSessionCreationRequest(msg.content.toString()))
    }, {noAck: true})

    const userJoinQueue = await messagingChannel.assertQueue('', {exclusive: true, autoDelete: true})
    await messagingChannel.bindQueue(userJoinQueue.queue, 'EXCHANGE_NAME_EXPORTER', 'user_join')
    messagingChannel.consume(userJoinQueue.queue, (msg) => {
        registerUser(Convert.toUserProfileInfo(msg.content.toString()))
    }, {noAck: true})
}

function configureFirebase(): void {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
    firestoreDB = admin.firestore();
}

void main()

function onSessionCreationRequest(creationRequest: SessionCreationRequest): void {
    console.log('sessionCreationRequest', creationRequest)
    creationRequest.users.forEach(user => registerUser(user))
}

function registerUser(userProfileInfo: UserProfileInfo): void {
    const dbUserProfileInfo: DBUserProfileInfo = {
        "avatarUrl": userProfileInfo.avatarURL,
        "displayName": userProfileInfo.displayName,
        "userId": userProfileInfo.id
    }
    firestoreDB.collection('userProfileInfo').doc(userProfileInfo.id)
        .set(dbUserProfileInfo).then((response) => {
        console.log("response from firestore", response)
    })
}

