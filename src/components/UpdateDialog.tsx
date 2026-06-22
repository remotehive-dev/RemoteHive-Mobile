import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme';

interface UpdateDialogProps {
  visible: boolean;
  apkUrl: string;
  releaseNotes?: string;
  onClose: () => void;
}

export default function UpdateDialog({ visible, apkUrl, releaseNotes, onClose }: UpdateDialogProps) {
  const handleDownload = () => {
    Linking.openURL(apkUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of RemoteHive is available. Download the latest APK to get new features and bug fixes.
          </Text>
          {releaseNotes ? (
            <Text style={styles.notes}>{releaseNotes}</Text>
          ) : null}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
              <Text style={styles.downloadBtnText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
              <Text style={styles.laterBtnText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  notes: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  downloadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  laterBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  laterBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
