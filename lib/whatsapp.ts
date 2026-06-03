import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';

let sock: any = null;
let qrCodeData: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

export async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('whatsapp-auth');
  connectionStatus = 'connecting';
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // turn off terminal QR
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      // Convert QR to base64 image
      qrCodeData = await QRCode.toDataURL(qr);
    }
    
    if (connection === 'open') {
      connectionStatus = 'connected';
      qrCodeData = null;
    }
    
    if (connection === 'close') {
      connectionStatus = 'disconnected';
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectWhatsApp();
    }
  });

  return sock;
}

export function getSocket() { return sock; }
export function getQRCode() { return qrCodeData; }
export function getStatus() { return connectionStatus; }