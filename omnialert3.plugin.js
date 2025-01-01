/**
 * @name OmniNotifierV3
 * @description Pushes Discord messages to webhook
 * @version 3.0.0
 */

const config = {
  info: {
    name: 'OmniNotifierV3',
    description: 'Pushes Discord messages to webhook',
    version: '3.0.0',
    author: 'Kyle Kumar',
  },
  defaultSettings: {
    serverId: '1300128580956717086',
    channelId: '1310389291808981002',
  },
};

module.exports = class OmniNotifierV3 {
  constructor() {
    this.webhookUrl = 'https://www.kylekumar.com/webhook';
  }

  start() {
    console.log('OmniObserver Started');

    // Ensure a webhook URL is provided
    if (!this.webhookUrl) {
      console.error('Webhook URL is not set. Please provide a valid URL');
      return;
    }

    // TEST MODE
    this.processLastMessages(30);

    // Setup mutation observer
    this.messageObserver = new MutationObserver(
      this.handleNewMessages.bind(this)
    );
    this.observeChatContainer();
  }

  // TEST FUNCTION
  processLastMessages(count) {
    const chatContainer = document.querySelector('.scrollerInner_e2e187');
    if (!chatContainer) {
      console.error('Chat container not found for processing last messages.');
      return;
    }

    // Find all `LI` elements with the message class
    const messageItems = Array.from(
      chatContainer.querySelectorAll('li.messageListItem_d5deea')
    );

    // Get the last `count` messages
    const lastMessages = messageItems.slice(-count);

    console.log(
      `Processing the last ${lastMessages.length} messages for testing.`
    );

    lastMessages.forEach((messageNode) => {
      const messageContent = this.extractMessageContent(messageNode);
      if (messageContent) {
        console.log(messageContent.type, messageContent.text);

        // // Send the content to the webhook
        // this.sendToWebhook({
        //   type: 'OMNI',
        //   text: messageContent,
        // });
      }
    });
  }

  observeChatContainer() {
    const chatContainer = document.querySelector('.scrollerInner_e2e187');

    if (chatContainer) {
      console.log('Chat container found');

      this.messageObserver.observe(chatContainer, {
        childList: true,
        subtree: false,
      });
    } else {
      console.error('Chat container was not found');
    }
  }

  handleNewMessages(mutations) {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode.nodeType === 1 &&
          addedNode.tagName === 'LI' &&
          addedNode.classList.startsWith('messageListItem_')
        ) {
          // New message detected
          console.log('New messsage detected');

          // Extract content from embedDescription
          const messageContent = this.extractMessageContent(addedNode);
          if (messageContent) {
            console.log('Message Content: ', messageContent);

            // Send to webhook
            this.sendToWebhook(messageContent);
          }
        }
      }
    }
  }

  extractMessageContent(messageNode) {
    const descriptionContainer = messageNode.querySelector(
      '[class^="embedDescription_"]'
    );

    if (descriptionContainer) {
      // Check if the container contains any <a> tags
      if (descriptionContainer.querySelector('a')) {
        console.warn('Description contains a link. Skipping message.');
        return null; // Return null or "" if an <a> tag is found
      }

      // Directly concatenate the text content of all <span> elements
      const messageContent = Array.from(
        descriptionContainer.querySelectorAll('span')
      )
        .map((span) => span.innerText) // Extract text from each span
        .join('') // Concatenate all spans without adding spaces
        .trim(); // Remove leading or trailing whitespace

      return messageContent ? { type: 'OMNI', text: messageContent } : null;
    }

    console.warn('No embedded description found in message.');
    return null;
  }

  sendToWebhook(payload) {
    if (!payload) {
      console.warn('No payload to send');
      return;
    }

    fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new error(`HTTP error! Status ${response.status}`);
        }
        console.log('Message sent to webhook successfully:', payload);
      })
      .catch((error) => {
        console.error('Failed to send message to webhook:', error);
      });
  }

  stop() {
    console.log('OmniObserver stopped');

    // Disconnect the observer when the plugin stops
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }
  }
};
