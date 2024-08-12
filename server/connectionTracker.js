const fs = require('fs');
const path = require('path');

const connectionsFilePath = path.join(__dirname, 'connections.json');

let activeConnections = [];

function trackConnection(socket, username) {
    let remoteAddress = socket.handshake.address;
  
    const headers = socket.handshake.headers;
    if (headers && headers['x-forwarded-for']) {
      remoteAddress = headers['x-forwarded-for'].split(',')[0].trim();
    } else if (headers && headers['x-real-ip']) {
      remoteAddress = headers['x-real-ip'];
    }
    if (remoteAddress === '::1') {
      remoteAddress = socket.handshake.address;
    }
  
    if (!remoteAddress) {
      console.error('Impossible de récupérer l\'adresse IP depuis la connexion socket');
      return;
    }
  
    const connectionTime = new Date().toLocaleString();
  
    const connectionInfo = {
      ip: remoteAddress,
      username: username || 'Anonyme',
      connectionTime: connectionTime
    };
  
    activeConnections.push(connectionInfo);
    saveConnectionsToFile();
  }

function saveConnectionsToFile() {
  fs.writeFile(connectionsFilePath, JSON.stringify(activeConnections, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement des connexions dans le fichier :', err);
    }
  });
}

module.exports = {
  trackConnection
};
