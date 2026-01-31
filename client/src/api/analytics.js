import axios from "./apiClient";

export const trackVisit = async (data) => {
    // Don't await response to avoid blocking UI
    axios.post("/analytics/track", data).catch(err => console.error("Tracking Error:", err));
};

export const getAnalyticsLogs = async (page = 1) => {
    const { data } = await axios.get(`/analytics/logs?pageNumber=${page}`);
    return data;
};

export const getAnalyticsStats = async () => {
    const { data } = await axios.get("/analytics/stats");
    return data;
};
