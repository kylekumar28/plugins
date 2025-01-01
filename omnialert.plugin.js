/**
 * @name OmniNotifier
 * @description Notifies when a new omni alert is posted
 * @version 1.0.0
 */

module.exports = class OmniNotifier {
  constructor() {
    this.isDialogOpen = false;
    this.isSoundPaused = false;
  }

  start() {
    console.log('OmniNotifier Started');

    // this.serverId = '1300128580956717086';
    this.serverId = '913149380335374407';
    // this.channelId = '1300128580956717089';
    this.channelId = '913155305385377823';

    // this.sound = new Audio('beep.mp3');
    this.sound = new Audio('https://www.kylekumar.com/assets/bell.mp3');
    this.sound.loop = true;

    this.messageObserver = new MutationObserver(
      this.handleNewMessage.bind(this)
    );
    const chatContainer = document.querySelector('.scrollerInner_e2e187');

    if (chatContainer) {
      console.log('Chat container found.');
      this.messageObserver.observe(chatContainer, {
        childList: true,
        subtree: true,
      });
    } else {
      console.error('Chat container not found.');
    }
  }

  // handleNewMessage(mutations) {
  //   for (const mutation of mutations) {
  //     for (const addedNode of mutation.addedNodes) {
  //       if (
  //         addedNode.nodeType === 1 &&
  //         addedNode.tagName === 'LI' &&
  //         addedNode.className.startsWith('messageListItem_')
  //       ) {
  //         console.log('Node found');
  //         // Ensure that we are in the correct server and channel
  //         const channel = this.getChannelId();
  //         const server = this.getServerId();

  //         console.log(channel, 'real' + this.channelId);
  //         console.log(server, 'real' + this.serverId);

  //         console.log(channel === this.channelId);
  //         console.log(server === this.serverId);

  //         if (channel === this.channelId && server === this.serverId) {
  //           const messageContent = this.getMessageContent(addedNode);
  //           if (messageContent) {
  //             console.log('notifying', messageContent);
  //             this.notifyUser(messageContent);
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  handleNewMessage(mutations) {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode.nodeType === 1 &&
          addedNode.tagName === 'LI'
          // addedNode.className.startsWith('messageListItem_')
        ) {
          console.log('Node found');
          // Ensure that we are in the correct server and channel
          const channel = this.getChannelId();
          const server = this.getServerId();

          console.log(
            channel,
            'real' + this.channelId,
            channel === this.channelId
          );
          console.log(server, 'real' + this.serverId, server === this.serverId);

          if (channel === this.channelId && server === this.serverId) {
            const messageContent = this.getMessageContent(addedNode);
            if (messageContent) {
              console.log('notifying', messageContent);

              // if dialog box is already open
              if (this.isDialogOpen) {
                if (this.sound.paused) {
                  // if sound is paused, unpause it
                  console.log('Unpausing sound');
                  this.sound.play();
                }
                // Do nothing if sound is already palying and dialog is open
              } else {
                // create dialog box and play sound
                console.log('dialog box not open, opening new one');
                this.notifyUser(messageContent);
              }
            }
          }
        }
      }
    }
  }

  getChannelId() {
    // Function to get the current channel ID from the URL
    const urlParts = window.location.href.split('/');
    return urlParts[urlParts.length - 1];
  }

  getServerId() {
    // Function to get the current server ID from the URL
    const urlParts = window.location.href.split('/');
    return urlParts[urlParts.length - 2];
  }

  getMessageContent(messageNode) {
    // Find the div with the 'messageContent_' class and target the span within it
    // const contentDiv = messageNode.querySelector('[class*="messageContent_"]');
    // if (contentDiv) {
    //   const messageSpan = contentDiv.querySelector('span'); // The span containing the message text
    //   return messageSpan ? messageSpan.innerText : null;
    // }
    // return null;
    return 'New alert';
  }

  notifyUser(message) {
    // Play the custom sound
    // this.sound.play();
    this.isDialogOpen = true;
    this.isSoundPaused = false;

    // Create a pop-up window with the recent message
    this.createDialog(message);
  }

  createDialog(message) {
    this.closeDialog();

    this.sound.play();

    // CReate dialog
    const dialog = document.createElement('div');
    dialog.id = 'omni-dialog';
    dialog.style.position = 'fixed';
    dialog.style.bottom = '20px';
    dialog.style.right = '20px';
    dialog.style.padding = '20px';
    dialog.style.backgroundColor = '#333';
    dialog.style.color = '#fff';
    dialog.style.borderRadius = '10px';
    dialog.style.zIndex = '1000';

    // Message content
    const messageEl = document.createElement('p');
    messageEl.innerHTML = `<strong>New Message:</strong><br>${message}`;
    dialog.appendChild(messageEl);

    // Pause/Resume button
    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause Sound';
    pauseButton.style.marginRight = '10px';

    // this.sound.play();

    pauseButton.addEventListener('click', () => {
      if (this.sound.paused) {
        this.sound.play();
        pauseButton.textContent = 'Pause Sound';
        this.isSoundPaused = false;
      } else {
        this.sound.pause();
        pauseButton.textContent = 'Resume Sound';
        this.isSoundPaused = true;
      }
    });
    dialog.appendChild(pauseButton);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
      this.closeDialog();
    });
    dialog.appendChild(closeButton);

    // Add dialog to the page
    document.body.appendChild(dialog);
  }

  closeDialog() {
    this.sound.pause();
    this.sound.currentTime = 0;

    // Remove dialog box if exists
    const existingDialog = document.getElementById('omni-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    this.isDialogOpen = false;
  }

  showPopup(message) {
    // Simple pop-up creation
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.padding = '10px';
    popup.style.backgroundColor = '#333';
    popup.style.color = '#fff';
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '1000';
    popup.innerHTML = `<strong>New Message:</strong><br>${message}`;

    document.body.appendChild(popup);

    // Remove the pop-up after 5 seconds
    setTimeout(() => {
      popup.remove();
    }, 5000);
  }

  stop() {
    console.log('Omni Notifier stopped');

    // Disconnect the observer when the plugin stops
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }

    this.closeDialog();
  }
};
