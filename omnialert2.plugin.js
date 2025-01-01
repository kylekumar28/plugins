/**
 * @name OmniNotifierV2
 * @description Notifies when a new omni alert is posted
 * @version 1.0.0
 */

const config = {
  info: {
    name: 'OmniNotifier',
    description:
      'Notifies when a new omni alert is posted, with customizable settings.',
    version: '2.1.0',
    author: 'Kyle Kumar',
  },
  defaultSettings: {
    serverId: '1300128580956717086',
    channelId: '1310389291808981002',
  },
};

module.exports = class OmniNotifier {
  constructor() {
    this.settings =
      BdApi.Data.load(config.info.name, 'settings') || config.defaultSettings;
    this.isDialogOpen = false;
    this.isSoundPaused = false;
    this.statusBox = null;
  }

  start() {
    console.log('OmniNotifier Started');

    // this.serverId = '1300128580956717086';
    // this.serverId = '1300128580956717086';
    // this.channelId = '1300128580956717089';
    // this.channelId = '1310389291808981002';

    this.createStatusBox();
    this.checkActiveChannelPeriodically();

    // this.sound = new Audio('beep.mp3');
    this.sound = new Audio('https://www.kylekumar.com/assets/bell.mp3');
    this.sound.loop = true;

    this.messageObserver = new MutationObserver(
      this.handleNewMessage.bind(this)
    );
    this.observeChatContainer();
    // const chatContainer = document.querySelector('.scrollerInner_e2e187');

    // if (chatContainer) {
    //   console.log('Chat container found.');
    //   this.messageObserver.observe(chatContainer, {
    //     childList: true,
    //     subtree: true,
    //   });
    // } else {
    //   console.error('Chat container not found.');
    // }
  }

  // Set up the MutationObserver when in the target channel
  observeChatContainer() {
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
            'real' + this.settings.channelId,
            channel === this.settings.channelId
          );
          console.log(
            server,
            'real' + this.settings.serverId,
            server === this.settings.serverId
          );

          if (
            channel === this.settings.channelId &&
            server === this.settings.serverId
          ) {
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

  createStatusBox() {
    this.statusBox = document.createElement('div');
    this.statusBox.style.position = 'fixed';
    this.statusBox.style.top = '10px';
    this.statusBox.style.right = '10px';
    this.statusBox.style.padding = '10px';
    this.statusBox.style.backgroundColor = '#333';
    this.statusBox.style.color = '#fff';
    this.statusBox.style.borderRadius = '5px';
    this.statusBox.style.zIndex = '1000';
    document.body.appendChild(this.statusBox);
  }

  checkActiveChannelPeriodically() {
    setInterval(() => {
      const currentChannel = this.getChannelId();
      const currentServer = this.getServerId();

      if (
        currentChannel === this.settings.channelId &&
        currentServer === this.settings.serverId
      ) {
        this.statusBox.innerText = 'Status: Active';
      } else {
        this.statusBox.innerText = 'Status: Inactive';
      }
    }, 2000); // Check every 2 seconds
  }

  getSettingsPanel() {
    const panel = document.createElement('div');
    panel.style.padding = '10px';

    const serverInput = document.createElement('input');
    serverInput.type = 'text';
    serverInput.placeholder = 'Enter Server ID';
    serverInput.value = this.settings.serverId;
    serverInput.style.marginBottom = '10px';
    serverInput.style.display = 'block';

    const channelInput = document.createElement('input');
    channelInput.type = 'text';
    channelInput.placeholder = 'Enter Channel ID';
    channelInput.value = this.settings.channelId;
    channelInput.style.marginBottom = '10px';
    channelInput.style.display = 'block';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = () => {
      this.settings.serverId = serverInput.value;
      this.settings.channelId = channelInput.value;
      BdApi.Data.save(config.info.name, 'settings', this.settings);
      BdApi.alert(
        'Settings Saved',
        'Your settings have been saved successfully.'
      );
    };

    panel.appendChild(serverInput);
    panel.appendChild(channelInput);
    panel.appendChild(saveButton);

    return panel;
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
