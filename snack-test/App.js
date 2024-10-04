import { Snack } from 'snack-sdk';

// Create Snack
const snack = new Snack({
  files: {
    'App.js': {
      type: 'CODE',
      contents: `
import * as React from 'react';
import { View, Text } from 'react-native';

export default () => (
  <View style={{flex: 1, justifyContent: 'center'}}>
    <Text style={{fontSize: 20, textAlign: 'center'}}>
      Hello Snack!
    </Text>
  </View>
);
`,
    },
  },
});

// Make the Snack available online
snack.setOnline(true);
const { url } = await snack.getStateAsync();

// You can now use the url and show it as a QR code
// to open the Snack in the Expo client.

// Stop Snack when done
snack.setOnline(false);
