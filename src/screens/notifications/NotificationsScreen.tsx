import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  IndianRupee,
  Megaphone,
  ShieldCheck,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getAgentNotifications,
  markNotificationRead,
} from '@/services/notification.service';
import { useAuth } from '@/store/auth';
import type { AppNotification, NotificationCategory } from '@/types/notification';

const CATEGORY_META: Record<
  NonNullable<NotificationCategory> | 'default',
  { icon: typeof Bell; bg: string; color: string; label: string }
> = {
  marketing:        { icon: Megaphone,   bg: 'bg-purple-100', color: '#7C3AED', label: 'Marketing' },
  kyc_update:       { icon: ShieldCheck, bg: 'bg-sky-100',    color: '#0C4A6E', label: 'KYC Update' },
  commission_paid:  { icon: IndianRupee, bg: 'bg-emerald-100',color: '#047857', label: 'Commission' },
  general:          { icon: Bell,        bg: 'bg-slate-100',  color: '#334155', label: 'General' },
  default:          { icon: Bell,        bg: 'bg-slate-100',  color: '#334155', label: 'Notification' },
};

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function NotificationCard({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const meta = CATEGORY_META[item.category ?? 'default'] ?? CATEGORY_META.default;
  const Icon = meta.icon;
  const isRead = Boolean(item.is_read);

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-start rounded-[24px] px-4 py-4 ${isRead ? 'bg-white/80' : 'bg-white'}`}
      style={styles.cardShadow}
    >
      <View className={`h-11 w-11 items-center justify-center rounded-2xl ${meta.bg}`}>
        <Icon size={20} color={meta.color} strokeWidth={2.2} />
      </View>

      <View className="ml-3 flex-1">
        <View className="flex-row items-start justify-between">
          <Text className={`flex-1 pr-2 text-sm font-bold ${isRead ? 'text-slate-500' : 'text-sky-950'}`}>
            {item.title}
          </Text>
          <Text className="text-xs text-slate-400">{timeAgo(item.created_at)}</Text>
        </View>
        <Text className="mt-1 text-sm leading-5 text-slate-500">{item.message}</Text>
      </View>

      {!isRead && <View className="ml-2 mt-1 h-2 w-2 rounded-full bg-sky-600" />}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    const res = await getAgentNotifications(user.id, 1, 10);
    setNotifications(res.data);
  }, [user?.id]);

  useEffect(() => {
    setIsLoading(true);
    loadNotifications().finally(() => setIsLoading(false));
  }, [loadNotifications]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }

  async function handlePressNotification(item: AppNotification) {
    if (!user?.id || item.is_read) return;
    setNotifications((current) =>
      current.map((n) => (n.id === item.id ? { ...n, is_read: 1 } : n))
    );
    try {
      await markNotificationRead(item.id, user.id);
    } catch {
      // Non-fatal — the list will self-correct on next refresh.
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
        <View className="flex-row items-center px-5 pt-4">
          <Pressable
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-white/90"
            style={styles.iconShadow}
          >
            <ArrowLeft size={24} color="#0C4A6E" strokeWidth={2.4} />
          </Pressable>
        </View>

        <Text className="px-5 pt-5 text-3xl font-extrabold text-sky-950">Notifications</Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0C4A6E" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-white/80">
              <Bell size={28} color="#94A3B8" strokeWidth={2} />
            </View>
            <Text className="mt-4 text-center text-sm text-slate-500">
              You don&apos;t have any notifications yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#0C4A6E" />
            }
            renderItem={({ item }) => (
              <NotificationCard item={item} onPress={() => handlePressNotification(item)} />
            )}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  iconShadow: {
    elevation: 6,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardShadow: {
    elevation: 6,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});
