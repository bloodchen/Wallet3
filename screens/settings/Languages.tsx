import { FlatList, ListRenderItemInfo, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const renderItem = ({ item }: ListRenderItemInfo<string>) => {
    return (
      <TouchableOpacity style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 17 }}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer style={{ paddingTop: 0 }}>
        <FlatList
          data={['English', '日本語', '繁體中文', '简体中文']}
          renderItem={renderItem}
          keyExtractor={(i) => i}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: borderColor }} />}
          style={{ backgroundColor: '#fff' }}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
