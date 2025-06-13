export interface TripNotification {
  id: string
  tripId: string
  orderSerialNo: string
  productName: string
  customerName: string
  locationName: string
  truckPlate: string
  tripStatus: string
  startingDatetime: string
  timestamp: string
  priority: "high" | "medium" | "low"
  read: boolean
}

export interface FirebaseNotificationPayload {
  notification?: {
    title: string
    body: string
  }
  data?: {
    tripId?: string
    orderSerialNo?: string
    productName?: string
    customerName?: string
    locationName?: string
    truckPlate?: string
    tripStatus?: string
    startingDatetime?: string
    [key: string]: string | undefined // Allow for additional fields
  }
  from?: string
  messageId?: string
  collapseKey?: string
  [key: string]: any // Allow for additional fields
}
