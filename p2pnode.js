import { createRSAPeerId } from '@libp2p/peer-id-factory'
import { gossipsub } from '@chainsafe/libp2p-gossipsub';

// libp2p
let libp2pnode;
let myPeerId;

async function start() {
  const { createLibp2p } = await import('libp2p');
  const { floodsub } = await import('@libp2p/floodsub');
  // const { webRTCStar } = await import('@libp2p/webrtc-star');
  // const { sigServer } = await import('@libp2p/webrtc-star-signalling-server');
  const { bootstrap } = await import('@libp2p/bootstrap');
  const { tcp } = await import('@libp2p/tcp');
  const { mdns } = await import('@libp2p/mdns');
  const { mplex } = await import('@libp2p/mplex');
  const { noise } = await import('@chainsafe/libp2p-noise');
  const { unmarshalPrivateKey } = await import('@libp2p/crypto/keys');
  const { createFromPrivKey } = await import('@libp2p/peer-id-factory');
  const { preSharedKey } = await import('libp2p/pnet');
  const { logger } = await import('@libp2p/logger');
  const { pipe } = await import('it-pipe');
  const uint8ArrayFromString = (await import('uint8arrays/from-string')).fromString;
  const uint8ArrayToString = (await import('uint8arrays/to-string')).toString;

  const log = logger('i2kn:api:libp2p');

  log('libp2p starting');

  const peerId = await createRSAPeerId();
  const PK = await unmarshalPrivateKey(peerId.privateKey);
  myPeerId = await createFromPrivKey(PK);
  console.log(myPeerId.toString());

  // const connectionProtector = preSharedKey({
  //   psk: new Uint8Array(Buffer.from(swarmKey, 'base64')),
  // });

  const p2pOptions = {
    peerId: myPeerId,
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
      ],
    },
    transports: [
      tcp(),
    ],
    peerDiscovery: [
      mdns(),
    ],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    // connectionManager: {
    //   maxParallelDials: 150, // 150 total parallel multiaddr dials
    //   maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
    //   dialTimeout: 30e3, // 10 second dial timeout per peer dial
    //   inboundUpgradeTimeout: 30e3,
    //   autoDial: true,
    // },
    pubsub: gossipsub({
      allowPublishToZeroPeers:true, // or error thrown, not catchable...
      // directPeers: 
    }),
    // connectionProtector,
  };

  libp2pnode = await createLibp2p(p2pOptions);

  libp2pnode.handle('/i2knV3', ({ stream }) => {
    pipe(
      stream,
      async (source) => {
        let message = '/i2knV3 msg : ';
        // eslint-disable-next-line no-restricted-syntax
        for await (const msg of source) {
          message += uint8ArrayToString(msg.subarray());
        }
        log('handle msg :', message);
      },
    );
  });

  libp2pnode.addEventListener('peer:discovery', (evt) => {
    const { detail: peer } = evt;
    log('libp2p.onPeerDiscovery', peer.id.toString());
  });

  libp2pnode.connectionManager.addEventListener('peer:connect', async (evt) => {
    const { detail: connection } = evt;
    const { remotePeer } = connection;
    log('libp2p.onPeerConnected', remotePeer.toString());

    // send hello on CONNECT
    try {
      const stream = await libp2pnode.dialProtocol(remotePeer, ['/i2knV3']);
      await pipe(
        [uint8ArrayFromString(`HELLO FROM ${myPeerId.toString()}`)],
        stream,
      );
    } catch (error) {
      log('ERROR !!!', error);
    }
  });
  
  libp2pnode.connectionManager.addEventListener('peer:disconnect', (evt) => {
    const { detail: connection } = evt;
    const { remotePeer } = connection;
    log('libp2p.onPeerDisconnected', remotePeer.toString());
  });

  await libp2pnode.start();
  log('libp2p started');

  libp2pnode.pubsub.addEventListener('message', (evt) => {
    log(`libp2p message: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
  });
  libp2pnode.pubsub.subscribe('i2knGS');
  setInterval(()=>{
    const peers = libp2pnode.pubsub.getSubscribers('i2knGS');
    log('pubsub peers', peers);
    try {
      libp2pnode.pubsub.publish('i2knGS', new TextEncoder().encode(`PUBSUB FROM ${myPeerId.toString()}`));
    } catch (error) {
      log(error);
    }
  },5000)

  const multiAddrs = libp2pnode.getMultiaddrs();
  log(multiAddrs.map((m) => m.toString()));
}

async function stop() {
  await libp2pnode.pubsub.publish('i2knGS', new TextEncoder().encode(`PEER OFFLINE : ${myPeerId.toString()}`));
  libp2pnode.pubsub.unsubscribe('i2knGS');
  await libp2pnode.stop();
  return 'stopped';
}

async function send(msg) {
  await libp2pnode.pubsub.publish('i2knGS', new TextEncoder().encode(`MSG : ${msg}`));
}

start();
