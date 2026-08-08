import { RequireAuth } from '@/components/common/RequireAuth';
import MyPoliciesScreen from '@/screens/policies/MyPoliciesScreen';

export default function MyPolicies() {
  return (
    <RequireAuth redirectTo="/my-policies">
      <MyPoliciesScreen />
    </RequireAuth>
  );
}
