import { RequireAuth } from '@/components/common/RequireAuth';
import MyCommissionScreen from '@/screens/commission/MyCommissionScreen';

export default function MyCommission() {
  return (
    <RequireAuth redirectTo="/my-commission">
      <MyCommissionScreen />
    </RequireAuth>
  );
}
