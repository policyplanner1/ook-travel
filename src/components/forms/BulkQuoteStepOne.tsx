import { FileText, Upload, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type BulkDocument = { name: string; size: number | null };

type Props = {
  document: BulkDocument | null;
  isPickingDocument: boolean;
  onPickDocument: () => void;
  onRemoveDocument: () => void;
  onNext: () => void;
  styles: { fieldShadow: object; buttonShadow: object };
};

export function BulkQuoteStepOne({
  document,
  isPickingDocument,
  onPickDocument,
  onRemoveDocument,
  onNext,
  styles,
}: Props) {
  return (
    <>
      <Text className="mb-5 text-center text-3xl font-extrabold tracking-[1px] text-sky-950">
        Bulk Quote
      </Text>

      <View className="rounded-3xl border border-dashed border-orange-300 bg-orange-50 px-4 py-4">
        <View className="flex-row items-start">
          <View className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-2xl bg-white">
            <Upload size={20} color="#EA580C" strokeWidth={2.3} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-sky-950">Upload Traveller List</Text>
            <Text className="mt-0.5 text-xs leading-5 text-slate-600">
              CSV or Excel (.csv / .xls / .xlsx) — one row per traveller
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPickDocument}
          className="mt-3 rounded-2xl bg-orange-500 px-4 py-3"
          style={styles.buttonShadow}
          disabled={isPickingDocument}
        >
          <Text className="text-center text-sm font-extrabold text-white">
            {isPickingDocument ? 'Opening…' : document ? 'Replace File' : 'Choose File'}
          </Text>
        </Pressable>

        {document ? (
          <View
            className="mt-3 flex-row items-center rounded-2xl bg-white px-4 py-3"
            style={styles.fieldShadow}
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
              <FileText size={18} color="#0C4A6E" strokeWidth={2.2} />
            </View>
            <Text className="flex-1 text-sm font-bold text-slate-800" numberOfLines={1}>
              {document.name}
            </Text>
            <Pressable
              onPress={onRemoveDocument}
              className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-slate-100"
            >
              <X size={16} color="#475569" strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : (
          <Text className="mt-2 text-xs font-medium text-slate-500">No file selected yet.</Text>
        )}
      </View>

      <Pressable
        className="mt-5 h-14 w-[72%] items-center justify-center self-center rounded-lg bg-orange-500"
        style={styles.buttonShadow}
        onPress={onNext}
      >
        <Text className="text-2xl font-extrabold tracking-normal text-white">Next</Text>
      </Pressable>
    </>
  );
}
