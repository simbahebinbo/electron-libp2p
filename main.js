// main.js
import {app, BrowserWindow} from 'electron'
// import { createRSAPeerId } from '@libp2p/peer-id-factory'
// import { createLibp2p } from 'libp2p';
// import { floodsub } from '@libp2p/floodsub';
// import { bootstrap } from '@libp2p/bootstrap';
// import { tcp } from '@libp2p/tcp';
// import { mdns } from '@libp2p/mdns';
// import { mplex } from '@libp2p/mplex';
// import { noise } from '@chainsafe/libp2p-noise';
// import { unmarshalPrivateKey } from '@libp2p/crypto/keys';
// import { createFromPrivKey } from '@libp2p/peer-id-factory';
// import { logger } from '@libp2p/logger';
// import { pipe } from 'it-pipe';
// import uint8ArrayFromString = (import 'uint8arrays/from-string'.fromString;
// import uint8ArrayToString = (import 'uint8arrays/to-string'.toString;

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    })
    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow();
    // start();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// libp2p
// let libp2pnode;
// let myPeerId;

// async function start() {
//   const log = logger('i2kn:api:libp2p');

//   log('libp2p starting');

//   const peerId = await createRSAPeerId();

//   const privKeyBuffer = uint8ArrayFromString(peerId.privKey, 'base64pad');
//   const PK = await unmarshalPrivateKey(new Uint8Array(privKeyBuffer));
//   myPeerId = await createFromPrivKey(PK);

//   // const connectionProtector = preSharedKey({
//   //   psk: new Uint8Array(Buffer.from(swarmKey, 'base64')),
//   // });

//   const p2pOptions = {
//     peerId: myPeerId,
//     addresses: {
//       listen: [
//         '/ip4/0.0.0.0/tcp/0',
//       ],
//     },
//     transports: [
//       tcp(),
//     ],
//     peerDiscovery: [
//       mdns(),
//     ],
//     streamMuxers: [mplex()],
//     connectionEncryption: [noise()],
//     connectionManager: {
//       maxParallelDials: 150, // 150 total parallel multiaddr dials
//       maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
//       dialTimeout: 30e3, // 10 second dial timeout per peer dial
//       inboundUpgradeTimeout: 30e3,
//       autoDial: true,
//     },
//     pubsub: floodsub(),
//     // connectionProtector,
//   };

//   // Add boostraps nodes if any
//   if (bootstrapinit && bootstrapinit.length) {
//     p2pOptions.peerDiscovery.push(bootstrap({
//       list: bootstrapinit,
//     }));
//     log('add boostraps %o', bootstrapinit);
//   }

//   libp2pnode = await createLibp2p(p2pOptions);

//   libp2pnode.handle('/i2knV3', ({ stream }) => {
//     pipe(
//       stream,
//       async (source) => {
//         let message = '/i2knV3 msg : ';
//         // eslint-disable-next-line no-restricted-syntax
//         for await (const msg of source) {
//           message += uint8ArrayToString(msg.subarray());
//         }
//         log('handle msg :', message);
//       },
//     );
//   });

//   libp2pnode.addEventListener('peer:discovery', (evt) => {
//     const { detail: peer } = evt;
//     log('libp2p.onPeerDiscovery', peer.id.toString());
//   });

//   libp2pnode.connectionManager.addEventListener('peer:connect', async (evt) => {
//     const { detail: connection } = evt;
//     const { remotePeer } = connection;
//     log('libp2p.onPeerConnected', remotePeer.toString());

//     // send hello
//     const stream = await libp2pnode.dialProtocol(remotePeer, ['/i2knV3']);
//     await pipe(
//       [uint8ArrayFromString(`HELLO FROM ${myPeerId.toString()}`)],
//       stream,
//     );
//   });

//   libp2pnode.connectionManager.addEventListener('peer:disconnect', (evt) => {
//     const { detail: connection } = evt;
//     const { remotePeer } = connection;
//     log('libp2p.onPeerDisconnected', remotePeer.toString());
//   });

//   await libp2pnode.start();

//   log('libp2p started');

//   libp2pnode.pubsub.addEventListener('message', (evt) => {
//     log(`libp2p message: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
//   });
//   libp2pnode.pubsub.subscribe('i2knGS');

//   libp2pnode.pubsub.publish('i2knGS', new TextEncoder().encode(`PEER ONLINE : ${myPeerId.toString()}`));

//   const multiAddrs = libp2pnode.getMultiaddrs();
//   return multiAddrs.map((m) => m.toString());
// }

// async function stop() {
//   await libp2pnode.pubsub.publish('i2knGS', new TextEncoder().encode(`PEER OFFLINE : ${myPeerId.toString()}`));
//   libp2pnode.pubsub.unsubscribe('i2knGS');
//   await libp2pnode.stop();
//   return 'stopped';
// }

// async function stopMasternode() {
//   console.log('stop Masternode');
//   return 'sopped';
// }

// async function startMasternode(
//   privKey,
//   bootstrapinit,
//   swarmKey,
//   isMasternode,
// ) {
//   return ['started'];
// }

// async function send(msg) {
//   await libp2pnode.pubsub.publish('i2knGS', new TextEncoder().encode(`MSG : ${msg}`));
// }

