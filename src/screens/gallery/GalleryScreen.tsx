import { useState } from 'react';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { ArrowLeft, Download, FileSpreadsheet, FileText } from 'lucide-react-native';
import {
  Alert,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { galleryItems, type GalleryItem } from '@/constants/gallery';

export default function GalleryScreen() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const getImageSource = (source: string | number) =>
    typeof source === 'string' ? { uri: source } : source;

  async function handleItemPress(item: GalleryItem) {
    if (item.type === 'image') {
      setSelectedImage(item);
      return;
    }

    try {
      if (typeof item.source === 'string') {
        await Linking.openURL(item.source);
        return;
      }

      const [asset] = await Asset.loadAsync(item.source);
      const assetUri = asset?.localUri ?? asset?.uri;

      if (!assetUri) {
        throw new Error('Missing asset URI');
      }

      await Linking.openURL(assetUri);
    } catch {
      Alert.alert(
        'Unable to open file',
        'The file could not be opened in the browser. Please try again in a moment.'
      );
    }
  }

  async function handleDownload(item: GalleryItem) {
    try {
      if (typeof item.source === 'string') {
        await Linking.openURL(item.source);
        return;
      }

      const [asset] = await Asset.loadAsync(item.source);
      const assetUri = asset?.localUri ?? asset?.uri;

      if (!assetUri) {
        throw new Error('Missing asset URI');
      }

      await Linking.openURL(assetUri);
    } catch {
      Alert.alert(
        'Unable to open file',
        'The file could not be opened in the browser. Please try again in a moment.'
      );
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/home-bg.png')}
      resizeMode="cover"
      className="flex-1"
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-white/90"
            style={styles.iconShadow}
          >
            <ArrowLeft size={24} color="#0C4A6E" strokeWidth={2.4} />
          </Pressable>

          <View className="mt-5">
            <Text className="text-3xl font-extrabold text-sky-950">Gallery</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Tap any item to preview it, or use the download icon to save it.
            </Text>
          </View>

          <View className="mt-6 gap-4">
            {galleryItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleItemPress(item)}
                className="overflow-hidden rounded-[28px] bg-white/95"
                style={styles.cardShadow}
              >
                {item.type === 'image' ? (
                  <Image
                    source={getImageSource(item.source)}
                    resizeMode="cover"
                    className="h-56 w-full"
                  />
                ) : item.type === 'xlsx' ? (
                  <View className="h-56 items-center justify-center bg-emerald-50">
                    <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-100">
                      <FileSpreadsheet size={42} color="#059669" strokeWidth={2.2} />
                    </View>
                    <Text className="mt-4 text-lg font-extrabold text-sky-950">Excel Template</Text>
                    <Text className="mt-2 px-8 text-center text-sm leading-6 text-slate-500">
                      Download the spreadsheet template to fill in.
                    </Text>
                  </View>
                ) : (
                  <View className="h-56 items-center justify-center bg-sky-50">
                    <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-orange-100">
                      <FileText size={42} color="#EA580C" strokeWidth={2.2} />
                    </View>
                    <Text className="mt-4 text-lg font-extrabold text-sky-950">PDF Document</Text>
                    <Text className="mt-2 px-8 text-center text-sm leading-6 text-slate-500">
                      Open the one-pager PDF in a full document viewer.
                    </Text>
                  </View>
                )}

                <View className="px-5 py-5">
                  <View className="flex-row items-center justify-between">
                    <View className="mr-4 flex-1">
                      <Text className="text-xl font-extrabold text-sky-950">{item.title}</Text>
                      <Text className="mt-1 text-sm text-slate-500">{item.fileName}</Text>
                    </View>

                    <Pressable
                      onPress={() => handleDownload(item)}
                      className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-100"
                    >
                      <Download size={20} color="#0C4A6E" strokeWidth={2.2} />
                    </Pressable>
                  </View>

                  {/* <View className="mt-4 flex-row items-center">
                    {item.type === 'image' ? (
                      <ImageIcon size={18} color="#0C4A6E" strokeWidth={2.2} />
                    ) : (
                      <FileText size={18} color="#0C4A6E" strokeWidth={2.2} />
                    )}
                    <Eye size={18} color="#0C4A6E" strokeWidth={2.2} style={styles.inlineIcon} />
                    <Text className="ml-2 text-sm font-semibold text-sky-900">
                      Tap to view
                    </Text>
                  </View> */}
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Modal visible={selectedImage !== null} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectedImage(null)} />

            <View className="mx-5 overflow-hidden rounded-[28px] bg-slate-950">
              {selectedImage ? (
                <Image
                  source={getImageSource(selectedImage.source)}
                  resizeMode="contain"
                  style={styles.previewImage}
                />
              ) : null}

              <View className="bg-slate-950 px-5 py-4">
                <Text className="text-lg font-extrabold text-white">
                  {selectedImage?.title ?? ''}
                </Text>
                <Text className="mt-1 text-sm text-slate-300">
                  {selectedImage?.fileName ?? ''}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  cardShadow: {
    elevation: 10,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  iconShadow: {
    elevation: 6,
    shadowColor: '#082F49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    justifyContent: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewImage: {
    width: '100%',
    height: 420,
    backgroundColor: '#020617',
  },
});
