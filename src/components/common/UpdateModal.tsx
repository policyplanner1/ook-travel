import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type UpdateModalProps = {
  visible: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  releaseNotes?: string;
  updateUrl: string;
  onDismiss: () => void;
};

export function UpdateModal({
  visible,
  forceUpdate,
  latestVersion,
  releaseNotes,
  updateUrl,
  onDismiss,
}: UpdateModalProps) {
  function handleUpdatePress() {
    Linking.openURL(updateUrl).catch(() => {});
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={forceUpdate ? () => {} : onDismiss}
    >
      <View style={styles.overlay}>
        {!forceUpdate && <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />}

        <View className="mx-6 rounded-[28px] bg-white px-6 py-7">
          <Text className="text-center text-2xl font-extrabold text-sky-950">
            {forceUpdate ? 'Update Required' : 'New Version Available'}
          </Text>

          <Text className="mt-3 text-center text-sm leading-6 text-slate-500">
            {forceUpdate
              ? `A new version (${latestVersion}) is required to continue using the app.`
              : `Version ${latestVersion} is available with the latest improvements and fixes.`}
          </Text>

          {releaseNotes ? (
            <Text className="mt-3 text-center text-xs leading-5 text-slate-400">{releaseNotes}</Text>
          ) : null}

          <Pressable
            onPress={handleUpdatePress}
            className="mt-6 rounded-[22px] bg-orange-500 px-5 py-4"
            style={styles.buttonShadow}
          >
            <Text className="text-center text-lg font-extrabold text-white">Update Now</Text>
          </Pressable>

          {!forceUpdate ? (
            <Pressable onPress={onDismiss} className="mt-3 px-5 py-3">
              <Text className="text-center text-sm font-semibold text-slate-400">Later</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
  },
  buttonShadow: {
    elevation: 6,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
});
