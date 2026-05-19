import axios from 'axios';

type PincodeApiResponse = Array<{
  Status: string;
  Message: string;
  PostOffice: Array<{
    District: string;
    State: string;
  }> | null;
}>;

export async function fetchCityStateByPincode(pinCode: string) {
  const { data } = await axios.get<PincodeApiResponse>(
    `https://api.postalpincode.in/pincode/${pinCode}`
  );

  const result = data[0];
  const postOffice = result?.PostOffice?.[0];

  if (!result || result.Status !== 'Success' || !postOffice) {
    throw new Error('Unable to fetch city and state from this PIN code.');
  }

  return {
    city: postOffice.District,
    state: postOffice.State,
  };
}
