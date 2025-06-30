// types.ts

export interface TrackingDetails {
  waybill_number: string
  service_code: string
  status: string
  shipper_name: string
  shipper_city: string
  receiver_name: string
  receiver_city: string
  waybill_date: string
  waybill_time: string
  origin: string
  destination: string
}

export interface TrackingManifest {
  manifest_code: string
  manifest_description: string
  manifest_date: string
  manifest_time: string
  city_name: string
}

export interface TrackingData {
  summary: {
    courier_code: string
    courier_name: string
    waybill_number: string
    service_code: string
    status: string
    shipper_name: string
    receiver_name: string
    origin: string
    destination: string
    waybill_date: string
    waybill_time: string
  }
  details: TrackingDetails
  manifest: TrackingManifest[]
}
