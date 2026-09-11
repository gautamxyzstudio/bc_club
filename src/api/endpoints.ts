const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const Endpoints = {
  // Auth Login
  login: `${BASE_URL}/api/auth/login`,
  signup: `${BASE_URL}/api/register-with-role`,
  forgotPassword: `${BASE_URL}/api/password/forgot`,
  verifyOtp: `${BASE_URL}/api/password/verify-otp`,
  resetPassword: `${BASE_URL}/api/password/reset`,
  reactiveAccount: `${BASE_URL}/api/auth/reactivate-vow-account`,
  me: `${BASE_URL}/api/users/me`,

  // Assignment List Properties
  getAssessmentPropertiesList: `${BASE_URL}/api/property-assignment-lists`,
  getPropertiesAssignmentDetails: (id: string) =>
    `${BASE_URL}/api/property-assignment-lists/${id}`,
  getSimilarAssignmentProperties: (id: string) =>
    `${BASE_URL}/api/property-assignment-lists/${id}/similar?radius=10&limit=20`,
  getSimilarAssignmentSoldProperties: (id: string) =>
    `${BASE_URL}/api/property-assignment-lists/${id}/similar-sold?radiusKm=10&limit=20`,
  getDDFPropertiesListByAddress: `${BASE_URL}/api/ddf-listings/search-by-address`,

  // Sale Report
  getSaleReport: `${BASE_URL}/api/real-estate-board/sales-reported`,
  getSoldSummary: `${BASE_URL}/api/real-estate-board/sold-market-summary`,
  getMonthlySalesReports: `${BASE_URL}/api/real-estate-board/monthly-sales-report`,
  getCityMonthlyData: `${BASE_URL}/api/real-estate-board/city-monthly-data`,
  getMonthlySalesChart: `${BASE_URL}/api/real-estate-boards/monthly-sales-chart`,

  // MapZoom
  mapZoomWithClusters: `${BASE_URL}/api/real-estate-board/map-zoom-clusters`,
  mapZoomProperties: `${BASE_URL}/api/real-estate-board/map-properties`,
  getMapZoomAssignmentList: `${BASE_URL}/api/property-assignment-lists/map-zoom`,
  getMapZoomSold: `${BASE_URL}/api/real-estate-board/sold/map-zoom`,
  getMapZoomSchools: `${BASE_URL}/api/schools/map-zoom`,

  // Flood Province
  getFloodProvinceGeoJSON: `${BASE_URL}/api/flood-province/findGeoJSON`,

  // Real Estate Board Listing
  getRealEstatePropertiesList: `${BASE_URL}/api/real-estate-boards`,
  getRealEstatePropertiesListById: (id: string) =>
    `${BASE_URL}/api/real-estate-boards/${id}`,
  getSimilarRealEstateProperties: (id: string) =>
    `${BASE_URL}/api/real-estate-board/${id}/similar?radiusKm=90&limit=20`,
  getSimilarRealEstateSoldProperties: (id: string) =>
    `${BASE_URL}/api/real-estate-board/${id}/similar-sold?radiusKm=90&limit=20`,
  getRealEstatePropertiesListByAddress: `${BASE_URL}/api/real-estate-board/search-by-address`,
  getNearbyRealEstatePlaces: (id: string) =>
    `${BASE_URL}/api/real-estate-board/${id}/neighborhood?radius=9000&limit=6`,
  getMyRealEstateFavorites: `${BASE_URL}/api/real-estate-board/my-favorites`,
  addRealEstateFavorite: (id: string) =>
    `${BASE_URL}/api/real-estate-board/add-favorite/${id}`,
  removeRealEstateFavorite: (id: string) =>
    `${BASE_URL}/api/real-estate-board/remove-favorite/${id}`,
  updateRealEstateListing: (id: string) =>
    `${BASE_URL}/api/real-estate-boards/${id}`,

  // Forecloser Properties
  getForecloserProperties: `${BASE_URL}/api/forecloser-properties`,
  getForecloserPropertiesAlt: `${BASE_URL}/api/forecloser-properties`,
  copyToForecloserList: (docId: string) =>
    `${BASE_URL}/api/forecloser-properties/copy-from-real-estate/${docId}`,
  deleteForecloserProperty: (id: string) =>
    `${BASE_URL}/api/forecloser-properties/${id}`,
};
