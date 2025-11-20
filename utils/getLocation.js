import axios from "axios";

export const getLocationFromIp = async (ip) => {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`);

    if (res.data.status === "success") {
      return {
        country: res.data.country,
        state: res.data.regionName,
        city: res.data.city,
      };
    }

    return { country: null, state: null, city: null };
  } catch (err) {
    console.error("IP Location Error:", err);
    return { country: null, state: null, city: null };
  }
};
