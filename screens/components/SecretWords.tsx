import { ScrollView, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { observer } from 'mobx-react-lite';

export const StaticSecretWords = observer(
  ({ words, onWordPress }: { words: string[]; onWordPress: (word: string, index: number) => void }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, index) => (
        <TouchableHighlight
          underlayColor={borderColor}
          key={index}
          onPress={() => onWordPress(word, index)}
          style={{
            padding: 12,
            paddingVertical: 8,
            borderColor,
            borderWidth: 1,
            borderRadius: 7,
            marginEnd: 12,
            marginBottom: 8,
          }}
        >
          <Text style={{}}>{word}</Text>
        </TouchableHighlight>
      ))}
    </View>
  )
);

export const SortedSecretWords = observer(
  ({ words, onDelWord }: { words: string[]; onDelWord: (word: string, index: number) => void }) => (
    <ScrollView
      contentContainerStyle={{
        padding: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
      style={{
        backgroundColor: borderColor,
        borderRadius: 10,
        borderWidth: 1,
        borderColor,
        marginVertical: 12,
        maxHeight: 200,
      }}
    >
      {words.map((word, index) => (
        <View
          key={index}
          style={{
            padding: 12,
            paddingEnd: 0,
            paddingVertical: 0,
            borderColor: secondaryFontColor,
            borderWidth: 1,
            borderRadius: 7,
            marginEnd: 12,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14 }}>{word}</Text>
          <TouchableOpacity
            onPress={() => onDelWord(word, index)}
            style={{
              paddingStart: 8,
              paddingVertical: 8,
              paddingEnd: 8,
              marginBottom: -2,
            }}
          >
            <Ionicons name="close" size={12} color={fontColor} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )
);
